import { useMemo } from "react"
import { LineCustomSvgLayerProps, ResponsiveLine } from "@nivo/line"
import {
    ShardExchangePriceBucket,
    ShardExchangePricePoint,
} from "../../models/ShardExchange.ts"
import { formatShards } from "../../utils/shardExchangeUtils.ts"

// x is a timestamp (ms). The chart gets plain numbers: its time scale shifted some series.
type Series = { id: string; data: { x: number; y: number }[] }

const SERIES: {
    id: string
    field: keyof ShardExchangePricePoint
    color: string
}[] = [
    { id: "Lowest buyout", field: "min_buyout_unit", color: "#5b8cff" },
    { id: "Median buyout", field: "median_buyout_unit", color: "#e8c95c" },
    { id: "Lowest current price", field: "min_bid_unit", color: "#6fcf6f" },
]

const colorOf = (id: string | number) =>
    SERIES.find((s) => s.id === id)?.color ?? "#e8c95c"

const FONT = 'Verdana, Tahoma, "DejaVu Sans", sans-serif'
const GOLD_LINE = "rgba(196, 179, 131, 0.22)"

// Dim gold lines and parchment labels on the window's dark panel
const GAME_CHART_THEME = {
    background: "transparent",
    text: { fontFamily: FONT, fontSize: 11, fill: "#d8cfb0" },
    axis: {
        domain: {
            line: { stroke: "rgba(196, 179, 131, 0.5)", strokeWidth: 1 },
        },
        ticks: {
            line: { stroke: "rgba(196, 179, 131, 0.5)", strokeWidth: 1 },
            text: { fontFamily: FONT, fontSize: 11, fill: "#d8cfb0" },
        },
        legend: {
            text: { fontFamily: FONT, fontSize: 11, fill: "#b9b9b3" },
        },
    },
    grid: { line: { stroke: GOLD_LINE, strokeWidth: 1 } },
    crosshair: {
        line: {
            stroke: "#e2d6a8",
            strokeWidth: 1,
            strokeOpacity: 0.6,
            strokeDasharray: "4 4",
        },
    },
}

// The share of the plot's height the volume bars may fill, at the bottom
const VOLUME_HEIGHT = 0.22

// The count at the time closest to `t` (the chart may round its x values)
function nearest(byTime: Map<number, number>, t: number): number | undefined {
    let best: number | undefined
    let bestGap = Infinity
    byTime.forEach((count, time) => {
        const gap = Math.abs(time - t)
        if (gap < bestGap) {
            bestGap = gap
            best = count
        }
    })
    return best
}

interface Props {
    points: ShardExchangePricePoint[]
    bucket: ShardExchangePriceBucket
}

/** Asking prices per unit over time, with faint bars for how many listings there were. */
const PriceHistoryChart = ({ points, bucket }: Props) => {
    const isDaily = bucket === "day"

    const data = useMemo(
        (): Series[] =>
            SERIES.map((series) => ({
                id: series.id,
                data: points
                    .map((point) => ({
                        x: Date.parse(point.time),
                        y: point[series.field] as number | null,
                    }))
                    .filter(
                        (p): p is { x: number; y: number } =>
                            p.y != null && !Number.isNaN(p.x)
                    ),
            })).filter((series) => series.data.length > 0),
        [points]
    )

    // Listings at each time, for the bars and the tooltip
    const volume = useMemo(() => {
        const byTime = new Map<number, number>()
        for (const point of points) {
            const t = Date.parse(point.time)
            if (!Number.isNaN(t)) byTime.set(t, point.listing_count)
        }
        return byTime
    }, [points])

    const VolumeBars = ({
        xScale,
        innerHeight,
        innerWidth,
    }: LineCustomSvgLayerProps<Series>) => {
        const entries = Array.from(volume.entries()).sort((a, b) => a[0] - b[0])
        const max = Math.max(1, ...entries.map(([, count]) => count))
        const xs = entries.map(([t]) => xScale(t))
        let gap = innerWidth
        for (let i = 1; i < xs.length; i++)
            gap = Math.min(gap, xs[i] - xs[i - 1])
        const width = Math.max(1, Math.min(24, gap * 0.7))
        const room = innerHeight * VOLUME_HEIGHT
        return (
            <g aria-hidden="true">
                {entries.map(([t, count], i) => {
                    const h = (count / max) * room
                    return (
                        <rect
                            key={t}
                            x={xs[i] - width / 2}
                            y={innerHeight - h}
                            width={width}
                            height={h}
                            fill="rgba(196, 179, 131, 0.2)"
                        />
                    )
                })}
            </g>
        )
    }

    if (data.length === 0) {
        return <p className="sxh-empty">No price history for this period.</p>
    }

    // A tick on every point when there are only a few, else on five spread across them
    const times = Array.from(volume.keys()).sort((a, b) => a - b)
    const ticks =
        times.length <= 6
            ? times
            : Array.from(
                  new Set(
                      [0, 1, 2, 3, 4].map(
                          (i) => times[Math.round((i * (times.length - 1)) / 4)]
                      )
                  )
              )

    const formatTick = (t: number) => {
        const value = new Date(t)
        return isDaily
            ? value.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
              })
            : value.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
              })
    }

    const formatTime = (value: Date) =>
        isDaily
            ? value.toLocaleDateString(undefined, { timeZone: "UTC" })
            : value.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
              })

    return (
        <div className="sxh-chart">
            <ul className="sxh-legend" aria-label="Lines on the chart">
                {data.map((series) => (
                    <li key={series.id}>
                        <span
                            className="sxh-swatch"
                            style={{ background: colorOf(series.id) }}
                        />
                        {series.id}
                    </li>
                ))}
                <li>
                    <span className="sxh-swatch bars" />
                    Listings
                </li>
            </ul>
            <div className="sxh-plot">
                <ResponsiveLine<Series>
                    data={data}
                    margin={{ top: 10, right: 16, bottom: 34, left: 58 }}
                    colors={data.map((series) => colorOf(series.id))}
                    xScale={{ type: "linear", min: "auto", max: "auto" }}
                    yScale={{
                        type: "linear",
                        min: 0,
                        max: "auto",
                        stacked: false,
                        reverse: false,
                    }}
                    theme={GAME_CHART_THEME}
                    curve="linear"
                    enableGridX={false}
                    enablePoints={points.length < 40}
                    pointSize={5}
                    pointBorderWidth={1}
                    pointBorderColor="#000"
                    lineWidth={2}
                    enableSlices="x"
                    useMesh={false}
                    layers={[
                        "grid",
                        VolumeBars,
                        "axes",
                        "lines",
                        "crosshair",
                        "points",
                        "slices",
                    ]}
                    axisBottom={{
                        format: formatTick,
                        // Few points: a tick on each, so no label repeats
                        tickValues: ticks,
                        tickSize: 4,
                        tickPadding: 6,
                    }}
                    axisLeft={{
                        tickSize: 4,
                        tickPadding: 6,
                        tickValues: 5,
                        legend: "Shards each",
                        legendOffset: -50,
                        legendPosition: "middle",
                        format: (value: number) => formatShards(value),
                    }}
                    sliceTooltip={({ slice }) => {
                        const time = slice.points[0]?.data.x
                        const listed =
                            typeof time === "number"
                                ? nearest(volume, time)
                                : undefined
                        return (
                            <div className="gw-tooltip">
                                <div className="gw-tooltip-title">
                                    {typeof time === "number"
                                        ? formatTime(new Date(time))
                                        : ""}
                                </div>
                                {slice.points.map((point) => (
                                    <div
                                        key={point.id}
                                        className="gw-tooltip-row"
                                    >
                                        <span
                                            className="sxh-swatch"
                                            style={{
                                                background: colorOf(
                                                    point.seriesId
                                                ),
                                            }}
                                        />
                                        <span>{point.seriesId}</span>
                                        <b>
                                            {formatShards(
                                                point.data.y as number
                                            )}
                                        </b>
                                    </div>
                                ))}
                                {listed != null && (
                                    <div className="gw-tooltip-row">
                                        <span className="sxh-swatch bars" />
                                        <span>Listings</span>
                                        <b>{listed.toLocaleString()}</b>
                                    </div>
                                )}
                            </div>
                        )
                    }}
                />
            </div>
        </div>
    )
}

export default PriceHistoryChart
