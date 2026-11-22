import React, { useCallback, useMemo, useState } from "react"
import { TrendsMetric, TrendsRange } from "../../models/Trends.ts"
import {
    BandPoint,
    bucketNotes,
    buildServerSeries,
    buildTotalSeries,
    formatBucketTitle,
    maxValue,
    spanInMonths,
    TRENDS_DEFAULT_BUCKET,
    TRENDS_RANGE_OPTIONS,
} from "../../utils/trendsUtils.ts"
import { NivoGappedDateSeries } from "../../utils/nivoUtils.ts"
import GenericLine from "../charts/GenericLine.tsx"
import { PillRadioGroup } from "../global/PillToggleGroup.tsx"
import Checkbox from "../global/Checkbox.tsx"
import Skeleton from "../global/Skeleton.tsx"
import useWindowSize from "../../hooks/useWindowSize.ts"
import { usePopulationTrends } from "./useTrendsData.tsx"
import {
    makeBandLayer,
    TREND_CHART_MARGIN,
    trendAxisBottom,
    trendXScale,
    trendYScale,
} from "./trendChartConfig.tsx"
import "./Trends.css"

export type TrendsView = "combined" | "servers"

const METRIC_OPTIONS: { value: TrendsMetric; label: string }[] = [
    { value: "players", label: "Players" },
    { value: "lfms", label: "LFMs" },
]

const VIEW_OPTIONS: { value: TrendsView; label: string }[] = [
    { value: "combined", label: "All servers" },
    { value: "servers", label: "By server" },
]

const SMOOTHING_DAYS = 7
const CHART_HEIGHT = "420px"

const formatY = (value: number) => Math.round(value).toLocaleString()

interface Props {
    range: TrendsRange
    setRange: (range: TrendsRange) => void
    metric: TrendsMetric
    setMetric: (metric: TrendsMetric) => void
    view: TrendsView
    setView: (view: TrendsView) => void
    timezone: string
}

const PopulationTrendChart = ({
    range,
    setRange,
    metric,
    setMetric,
    view,
    setView,
    timezone,
}: Props) => {
    const bucket = TRENDS_DEFAULT_BUCKET[range]
    const { data, loading, error } = usePopulationTrends(range, bucket)
    const { isMobile } = useWindowSize()

    // Smoothing defaults on for the long daily ranges, where weekday/weekend swings
    // make the raw line hard to read; the viewer can override it.
    const [smoothingOverride, setSmoothingOverride] = useState<boolean | null>(
        null
    )
    const canSmooth = bucket === "day"
    const smoothing =
        canSmooth &&
        (smoothingOverride ?? (range === "quarter" || range === "year"))
    const canShowBand = view === "combined" && bucket !== "hour"
    const [bandEnabled, setBandEnabled] = useState(true)
    const showBand = canShowBand && bandEnabled

    const smoothingWindow = smoothing ? SMOOTHING_DAYS : 0

    const { series, band } = useMemo((): {
        series: NivoGappedDateSeries[]
        band: BandPoint[]
    } => {
        if (!data) return { series: [], band: [] }
        if (view === "servers")
            return {
                series: buildServerSeries(
                    data,
                    metric,
                    timezone,
                    smoothingWindow
                ),
                band: [],
            }
        const total = buildTotalSeries(data, metric, timezone, smoothingWindow)
        return { series: [total.series], band: total.band }
    }, [data, view, metric, timezone, smoothingWindow])

    const notes = useMemo(
        () => (data ? bucketNotes(data, timezone) : new Map<number, string>()),
        [data, timezone]
    )

    const bandByTime = useMemo(
        () => new Map(band.map((b) => [b.x.getTime(), b])),
        [band]
    )

    const extraLayers = useMemo(
        () => (showBand ? [makeBandLayer(band)] : undefined),
        [showBand, band]
    )

    const yScale = useMemo(
        () => trendYScale(maxValue(series, showBand ? band : [])),
        [series, band, showBand]
    )

    const spanMonths = data ? spanInMonths(data.start, data.end) : 0
    const axisBottom = useMemo(
        () => trendAxisBottom(range, bucket, isMobile, spanMonths),
        [range, bucket, isMobile, spanMonths]
    )
    const xScale = useMemo(() => trendXScale(bucket), [bucket])

    const tooltipTitleFormatter = useCallback(
        (x: Date) => formatBucketTitle(x, bucket, notes.get(x.getTime())),
        [bucket, notes]
    )

    const tooltipFooter = useCallback(
        (x: Date | number) => {
            if (!showBand || !(x instanceof Date)) return null
            const point = bandByTime.get(x.getTime())
            if (!point || point.min === null || point.max === null) return null
            return (
                <div className="trends-tooltip-band">
                    {smoothing ? `${SMOOTHING_DAYS}-day avg hourly` : "Hourly"}{" "}
                    low {formatY(point.min)} · high {formatY(point.max)}
                </div>
            )
        },
        [showBand, bandByTime, smoothing]
    )

    const metricLabel = metric === "players" ? "players online" : "LFMs posted"
    const bucketLabel =
        bucket === "hour" ? "hourly" : bucket === "day" ? "daily" : "weekly"

    let chart: React.ReactNode
    if (error) {
        chart = (
            <div
                className="trends-chart-status"
                style={{ height: CHART_HEIGHT }}
            >
                Couldn't load population trends. Try again later.
            </div>
        )
    } else if (loading || !data) {
        chart = <Skeleton variant="rectangular" height={CHART_HEIGHT} />
    } else if (data.total.length === 0 || series.length === 0) {
        chart = (
            <div
                className="trends-chart-status"
                style={{ height: CHART_HEIGHT }}
            >
                No population data for this range yet.
            </div>
        )
    } else {
        chart = (
            <GenericLine
                nivoData={series}
                showLegend={view === "servers"}
                restrictToServers={view === "servers"}
                xScale={xScale}
                axisBottom={axisBottom}
                margin={TREND_CHART_MARGIN}
                yScale={yScale}
                yFormatter={formatY}
                tooltipTitleFormatter={tooltipTitleFormatter}
                tooltipFooter={tooltipFooter}
                extraLayers={extraLayers}
                showTotalInTooltip={view === "servers"}
                chartHeight={CHART_HEIGHT}
            />
        )
    }

    return (
        <div>
            <div className="trends-controls">
                <div className="trends-control-group">
                    <span className="trends-control-label">Range</span>
                    <PillRadioGroup
                        ariaLabel="Range"
                        options={TRENDS_RANGE_OPTIONS}
                        value={range}
                        onChange={setRange}
                    />
                </div>
                <div className="trends-control-group">
                    <span className="trends-control-label">Show</span>
                    <PillRadioGroup
                        ariaLabel="Metric"
                        options={METRIC_OPTIONS}
                        value={metric}
                        onChange={setMetric}
                    />
                </div>
                <div className="trends-control-group">
                    <span className="trends-control-label">Servers</span>
                    <PillRadioGroup
                        ariaLabel="Servers"
                        options={VIEW_OPTIONS}
                        value={view}
                        onChange={setView}
                    />
                </div>
                {(canSmooth || canShowBand) && (
                    <div className="trends-control-group">
                        {canSmooth && (
                            <Checkbox
                                checked={smoothing}
                                onChange={(e) =>
                                    setSmoothingOverride(e.target.checked)
                                }
                            >
                                {SMOOTHING_DAYS}-day average
                            </Checkbox>
                        )}
                        {canShowBand && (
                            <Checkbox
                                checked={bandEnabled}
                                onChange={(e) =>
                                    setBandEnabled(e.target.checked)
                                }
                            >
                                Show hourly low/high
                            </Checkbox>
                        )}
                    </div>
                )}
            </div>
            {chart}
            <p className="trends-note">
                Average {metricLabel}
                {view === "combined"
                    ? " across all servers"
                    : " per server"},{" "}
                {smoothing
                    ? `${bucketLabel}, smoothed over ${SMOOTHING_DAYS} days`
                    : bucketLabel}
                .{" "}
                {bucket === "hour"
                    ? "Times are in your timezone."
                    : "Days are UTC days."}
                {showBand &&
                    (smoothing
                        ? ` The shaded band spans the quietest and busiest hour in each ${bucket}, averaged over the same ${SMOOTHING_DAYS} days.`
                        : ` The shaded band spans the quietest and busiest hour in each ${bucket}.`)}
                {smoothing &&
                    " Today's partial day is left out of the average."}{" "}
                Gaps mean no data was collected.
            </p>
        </div>
    )
}

export default PopulationTrendChart
