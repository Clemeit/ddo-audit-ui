import React from "react"
import { LineCustomSvgLayerProps } from "@nivo/line"
import { TrendsBucket, TrendsRange } from "../../models/Trends.ts"
import { BandPoint } from "../../utils/trendsUtils.ts"
import { GenericLineSeries } from "../charts/GenericLine.tsx"
import {
    LINE_CHART_AXIS_BOTTOM,
    LINE_CHART_MARGIN,
    LINE_CHART_X_SCALE,
} from "../charts/lineChartConfig.ts"

export const TREND_CHART_MARGIN = {
    ...LINE_CHART_MARGIN,
    left: 55,
    right: 20,
    bottom: 75,
}

const TICKS: Record<
    TrendsRange,
    { desktop: string; mobile: string; format: string }
> = {
    week: {
        desktop: "every 1 day",
        mobile: "every 2 days",
        format: "%a %b %d",
    },
    month: { desktop: "every 3 days", mobile: "every 7 days", format: "%b %d" },
    quarter: {
        desktop: "every 1 week",
        mobile: "every 3 weeks",
        format: "%b %d",
    },
    year: {
        desktop: "every 1 month",
        mobile: "every 2 months",
        format: "%b %Y",
    },
    all: {
        desktop: "every 1 month",
        mobile: "every 3 months",
        format: "%b %Y",
    },
}

// "All" grows over time, so its tick spacing follows the span instead of being fixed.
function allRangeTicks(spanMonths: number) {
    if (spanMonths <= 15)
        return {
            desktop: "every 1 month",
            mobile: "every 3 months",
            format: "%b %Y",
        }
    if (spanMonths <= 36)
        return {
            desktop: "every 3 months",
            mobile: "every 6 months",
            format: "%b %Y",
        }
    return { desktop: "every 1 year", mobile: "every 1 year", format: "%Y" }
}

export function trendAxisBottom(
    range: TrendsRange,
    bucket: TrendsBucket,
    isMobile: boolean,
    spanMonths = 0
) {
    const ticks = range === "all" ? allRangeTicks(spanMonths) : TICKS[range]
    return {
        ...LINE_CHART_AXIS_BOTTOM,
        tickValues: isMobile ? ticks.mobile : ticks.desktop,
        format: ticks.format,
        legend: bucket === "hour" ? "Time (your timezone)" : "Date (UTC)",
        legendOffset: 65,
    }
}

export function trendXScale(bucket: TrendsBucket) {
    return {
        ...LINE_CHART_X_SCALE,
        precision: bucket === "hour" ? ("hour" as const) : ("day" as const),
    }
}

export const trendYScale = (max?: number) => ({
    type: "linear" as const,
    min: 0,
    max: max && max > 0 ? max * 1.05 : ("auto" as const),
    stacked: false,
    reverse: false,
})

/**
 * Shaded area between each bucket's min and max, drawn beneath the lines. Breaks at gaps.
 * Returns a stable layer component for a given band (memoize on `band`).
 */
export function makeBandLayer(band: BandPoint[]) {
    const BandLayer = ({
        xScale,
        yScale,
    }: LineCustomSvgLayerProps<GenericLineSeries>) => {
        const segments: BandPoint[][] = []
        let current: BandPoint[] = []
        band.forEach((point) => {
            if (point.min === null || point.max === null) {
                if (current.length) segments.push(current)
                current = []
            } else current.push(point)
        })
        if (current.length) segments.push(current)

        return (
            <g aria-hidden="true">
                {segments
                    .filter((segment) => segment.length > 1)
                    .map((segment) => {
                        const top = segment.map(
                            (p) =>
                                `${xScale(p.x as never)},${yScale(p.max as never)}`
                        )
                        const bottom = [...segment]
                            .reverse()
                            .map(
                                (p) =>
                                    `${xScale(p.x as never)},${yScale(p.min as never)}`
                            )
                        return (
                            <path
                                key={segment[0].x.getTime()}
                                d={`M${top.join("L")}L${bottom.join("L")}Z`}
                                style={{
                                    fill: "var(--text)",
                                    fillOpacity: 0.12,
                                }}
                            />
                        )
                    })}
            </g>
        )
    }
    return BandLayer
}
