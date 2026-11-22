import React, { useCallback, useMemo } from "react"
import { PopulationTrendsData } from "../../models/Trends.ts"
import {
    bucketNotes,
    buildLfmRatioSeries,
    buildServerSeries,
    buildShareSeries,
    formatBucketTitle,
    spanInMonths,
} from "../../utils/trendsUtils.ts"
import { NivoGappedDateSeries } from "../../utils/nivoUtils.ts"
import GenericLine from "../charts/GenericLine.tsx"
import Skeleton from "../global/Skeleton.tsx"
import useWindowSize from "../../hooks/useWindowSize.ts"
import { usePopulationTrends } from "./useTrendsData.tsx"
import {
    TREND_CHART_MARGIN,
    trendAxisBottom,
    trendXScale,
    trendYScale,
} from "./trendChartConfig.tsx"
import "./Trends.css"

const CHART_HEIGHT = "360px"
const RATIO_SERIES_ID = "Per 100 players"

const formatCount = (value: number) => Math.round(value).toLocaleString()
const formatPercent = (value: number) => `${value.toFixed(1)}%`
const formatRatio = (value: number) => value.toFixed(1)

interface ChartProps {
    data: PopulationTrendsData
    series: NivoGappedDateSeries[]
    timezone: string
    yFormatter: (value: number) => string
    showLegend: boolean
}

const TrendLine = ({
    data,
    series,
    timezone,
    yFormatter,
    showLegend,
}: ChartProps) => {
    const { isMobile } = useWindowSize()
    const notes = useMemo(() => bucketNotes(data, timezone), [data, timezone])
    const tooltipTitleFormatter = useCallback(
        (x: Date) => formatBucketTitle(x, data.bucket, notes.get(x.getTime())),
        [data.bucket, notes]
    )
    const axisBottom = useMemo(
        () =>
            trendAxisBottom(
                data.range,
                data.bucket,
                isMobile,
                spanInMonths(data.start, data.end)
            ),
        [data.range, data.bucket, data.start, data.end, isMobile]
    )
    const xScale = useMemo(() => trendXScale(data.bucket), [data.bucket])
    const yScale = useMemo(() => trendYScale(), [])

    return (
        <GenericLine
            nivoData={series}
            showLegend={showLegend}
            restrictToServers={showLegend}
            xScale={xScale}
            axisBottom={axisBottom}
            margin={TREND_CHART_MARGIN}
            yScale={yScale}
            yFormatter={yFormatter}
            tooltipTitleFormatter={tooltipTitleFormatter}
            chartHeight={CHART_HEIGHT}
        />
    )
}

interface StateProps {
    data: PopulationTrendsData | undefined
    loading: boolean
    error: string | null
    children: (data: PopulationTrendsData) => React.ReactNode
}

const ChartState = ({ data, loading, error, children }: StateProps) => {
    if (error)
        return (
            <div
                className="trends-chart-status"
                style={{ height: CHART_HEIGHT }}
            >
                Couldn't load this chart. Try again later.
            </div>
        )
    if (loading || !data)
        return <Skeleton variant="rectangular" height={CHART_HEIGHT} />
    if (data.total.length === 0)
        return (
            <div
                className="trends-chart-status"
                style={{ height: CHART_HEIGHT }}
            >
                No data yet.
            </div>
        )
    return <>{children(data)}</>
}

/** Monthly average players per server over everything we have. */
export const LongTermTrendChart = ({ timezone }: { timezone: string }) => {
    const request = usePopulationTrends("all", "month")
    const series = useMemo(
        () =>
            request.data
                ? buildServerSeries(request.data, "players", timezone)
                : [],
        [request.data, timezone]
    )
    return (
        <ChartState {...request}>
            {(data) => (
                <>
                    <TrendLine
                        data={data}
                        series={series}
                        timezone={timezone}
                        yFormatter={formatCount}
                        showLegend
                    />
                    <p className="trends-note">
                        Monthly average players online per server (UTC months).
                        Months with only partial data are marked in the tooltip.
                    </p>
                </>
            )}
        </ChartState>
    )
}

/** Each server's share of the combined population, monthly. */
export const ServerShareChart = ({ timezone }: { timezone: string }) => {
    const request = usePopulationTrends("all", "month")
    const series = useMemo(
        () => (request.data ? buildShareSeries(request.data, timezone) : []),
        [request.data, timezone]
    )
    return (
        <ChartState {...request}>
            {(data) => (
                <>
                    <TrendLine
                        data={data}
                        series={series}
                        timezone={timezone}
                        yFormatter={formatPercent}
                        showLegend
                    />
                    <p className="trends-note">
                        Each server's share of all players online, by month.
                        Shifts here show players moving between servers even
                        when the total stays flat.
                    </p>
                </>
            )}
        </ChartState>
    )
}

/** LFMs per 100 players across all servers, weekly over the last year. */
export const LfmRatioChart = ({ timezone }: { timezone: string }) => {
    const request = usePopulationTrends("year", "week")
    const series = useMemo(
        () =>
            request.data
                ? [buildLfmRatioSeries(request.data, timezone, RATIO_SERIES_ID)]
                : [],
        [request.data, timezone]
    )
    return (
        <ChartState {...request}>
            {(data) => (
                <>
                    <TrendLine
                        data={data}
                        series={series}
                        timezone={timezone}
                        yFormatter={formatRatio}
                        showLegend={false}
                    />
                    <p className="trends-note">
                        Average LFMs posted for every 100 players online, weekly
                        over the last year. It measures how much people group
                        up, independent of how many are playing.
                    </p>
                </>
            )}
        </ChartState>
    )
}
