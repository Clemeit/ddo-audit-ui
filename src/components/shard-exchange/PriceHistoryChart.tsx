import { useMemo } from "react"
import { ResponsiveLine } from "@nivo/line"
import {
    ShardExchangePriceBucket,
    ShardExchangePricePoint,
} from "../../models/ShardExchange.ts"
import Skeleton from "../global/Skeleton.tsx"
import LineChartTooltip from "../charts/LineChartTooltip.tsx"
import { SERVER_COLORS } from "../../constants/charts.ts"
import {
    LINE_CHART_DEFAULTS,
    LINE_CHART_MARGIN,
    LINE_CHART_THEME,
    OVER_MONTH_CHART_X_SCALE,
    OVER_WEEK_CHART_X_SCALE,
} from "../charts/lineChartConfig.ts"
import { formatShards } from "../../utils/shardExchangeUtils.ts"
import "../charts/Charts.css"

const CHART_HEIGHT = "340px"

const SERIES: {
    id: string
    field: keyof ShardExchangePricePoint
    color: string
}[] = [
    {
        id: "Lowest buyout",
        field: "min_buyout_unit",
        color: SERVER_COLORS[1],
    },
    {
        id: "Median buyout",
        field: "median_buyout_unit",
        color: SERVER_COLORS[0],
    },
    {
        id: "Lowest current price",
        field: "min_bid_unit",
        color: SERVER_COLORS[3],
    },
]

const colorOf = (id: string) =>
    SERIES.find((s) => s.id === id)?.color ?? SERVER_COLORS[0]

interface Props {
    points: ShardExchangePricePoint[]
    bucket: ShardExchangePriceBucket
    isLoading?: boolean
}

const PriceHistoryChart = ({ points, bucket, isLoading = false }: Props) => {
    const data = useMemo(
        () =>
            SERIES.map((series) => ({
                id: series.id,
                data: points
                    .map((point) => ({
                        x: new Date(point.time),
                        y: point[series.field] as number | null,
                    }))
                    .filter(
                        (p): p is { x: Date; y: number } =>
                            p.y != null && !Number.isNaN(p.x.getTime())
                    ),
            })).filter((series) => series.data.length > 0),
        [points]
    )

    if (isLoading && points.length === 0) {
        return <Skeleton height={CHART_HEIGHT} variant="rectangular" />
    }
    if (data.length === 0) {
        return <p>No price history for this period.</p>
    }

    const isDaily = bucket === "day"
    return (
        <div className="line-container" style={{ height: CHART_HEIGHT }}>
            <ResponsiveLine
                data={data}
                margin={{ ...LINE_CHART_MARGIN, left: 60, bottom: 50 }}
                colors={data.map((series) => colorOf(series.id))}
                xScale={
                    isDaily ? OVER_MONTH_CHART_X_SCALE : OVER_WEEK_CHART_X_SCALE
                }
                yScale={{
                    type: "linear",
                    min: 0,
                    max: "auto",
                    stacked: false,
                    reverse: false,
                }}
                theme={LINE_CHART_THEME}
                curve="linear"
                enableGridX={LINE_CHART_DEFAULTS.enableGridX}
                enablePoints={points.length < 40}
                pointSize={6}
                lineWidth={LINE_CHART_DEFAULTS.lineWidth}
                enableSlices="x"
                useMesh={false}
                axisBottom={{
                    format: isDaily ? "%b %d" : "%b %d %H:%M",
                    tickValues: 6,
                    tickRotation: 0,
                }}
                axisLeft={{
                    legend: "Shards each",
                    legendOffset: -50,
                    legendPosition: "middle",
                    format: (value: number) => formatShards(value),
                }}
                sliceTooltip={({ slice }) => (
                    <LineChartTooltip
                        slice={slice}
                        getServerColor={colorOf}
                        tooltipTitleFormatter={(value: unknown) => {
                            const date =
                                value instanceof Date
                                    ? value
                                    : new Date(String(value))
                            if (Number.isNaN(date.getTime())) return ""
                            return isDaily
                                ? date.toLocaleDateString(undefined, {
                                      timeZone: "UTC",
                                  })
                                : date.toLocaleString()
                        }}
                        yFormatter={(value: number) => formatShards(value)}
                    />
                )}
            />
        </div>
    )
}

export default PriceHistoryChart
