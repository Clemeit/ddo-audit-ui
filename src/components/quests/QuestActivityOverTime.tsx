import { useMemo } from "react"
import { ResponsiveLine } from "@nivo/line"
import { QuestAnalyticsApiData } from "../../models/Lfm"
import Skeleton from "../global/Skeleton"
import Stack from "../global/Stack"
import { SERVER_COLORS } from "../../constants/charts"
import {
    LINE_CHART_MARGIN,
    LINE_CHART_THEME,
    LINE_CHART_Y_SCALE,
    LINE_CHART_DEFAULTS,
    OVER_MONTH_CHART_X_SCALE,
    OVER_MONTH_LINE_CHART_AXIS_BOTTOM,
} from "../charts/lineChartConfig"
import "../charts/Charts.css"

interface Props {
    questMetrics?: QuestAnalyticsApiData
    isLoading?: boolean
}

const CHART_HEIGHT = "360px"

const QuestActivityOverTime = ({ questMetrics, isLoading }: Props) => {
    const lineData = useMemo(() => {
        const points =
            questMetrics?.analytics_data?.activity_over_time
                ?.map((entry) => ({
                    x: entry.date ? new Date(entry.date) : null,
                    y: entry.count ?? 0,
                }))
                .filter((point) => point.x && !isNaN(point.x.getTime()))
                .sort((a, b) => (a.x?.getTime() ?? 0) - (b.x?.getTime() ?? 0))
                .map((point) => ({ x: point.x as Date, y: point.y })) ?? []

        if (!points.length) return []
        return [
            {
                id: "activity",
                data: points,
            },
        ]
    }, [questMetrics])

    const renderContent = () => {
        if (isLoading) {
            return <Skeleton height={CHART_HEIGHT} variant="rectangular" />
        }

        if (!lineData.length) {
            return <p>No data available.</p>
        }

        return (
            <div className="line-container" style={{ height: CHART_HEIGHT }}>
                <ResponsiveLine
                    data={lineData}
                    margin={{ ...LINE_CHART_MARGIN, left: 60, bottom: 60 }}
                    colors={[SERVER_COLORS[0]]}
                    yScale={LINE_CHART_Y_SCALE}
                    xScale={OVER_MONTH_CHART_X_SCALE}
                    theme={LINE_CHART_THEME}
                    curve={LINE_CHART_DEFAULTS.curve}
                    enableGridX={LINE_CHART_DEFAULTS.enableGridX}
                    enablePoints={LINE_CHART_DEFAULTS.enablePoints}
                    lineWidth={LINE_CHART_DEFAULTS.lineWidth}
                    enableSlices={LINE_CHART_DEFAULTS.enableSlices}
                    useMesh={LINE_CHART_DEFAULTS.useMesh}
                    xFormat="time:%Y-%m-%d"
                    axisBottom={{
                        ...OVER_MONTH_LINE_CHART_AXIS_BOTTOM,
                        legend: "Date",
                        tickValues: "every 7 day",
                        tickRotation: 0,
                        legendOffset: 50,
                    }}
                    axisLeft={{
                        legend: "Sessions",
                        legendOffset: -45,
                        legendPosition: "middle",
                    }}
                />
            </div>
        )
    }

    return (
        <Stack direction="column" gap="10px">
            <h3 style={{ margin: 0 }}>Activity Over Time</h3>
            {renderContent()}
        </Stack>
    )
}

export default QuestActivityOverTime
