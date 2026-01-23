import { useMemo } from "react"
import { ResponsiveBar } from "@nivo/bar"
import { QuestAnalyticsApiData } from "../../models/Lfm"
import Skeleton from "../global/Skeleton"
import Stack from "../global/Stack"
import { SERVER_COLORS } from "../../constants/charts"
import { LINE_CHART_MARGIN } from "../charts/lineChartConfig"
import "../charts/Charts.css"

interface Props {
    questMetrics?: QuestAnalyticsApiData
    isLoading?: boolean
}

const BAR_THEME = {
    labels: {
        text: {
            fill: "#fff",
        },
    },
    axis: {
        legend: {
            text: {
                fill: "var(--text)",
                fontSize: 14,
            },
        },
        ticks: {
            text: {
                fill: "var(--text)",
                fontSize: 14,
            },
        },
    },
}

const CHART_HEIGHT = "360px"

const QuestActivityByHour = ({ questMetrics, isLoading }: Props) => {
    const hourlyData = useMemo(() => {
        const byHour = questMetrics?.analytics_data?.activity_by_hour ?? []
        if (!byHour.length) return []

        const base = Array.from({ length: 24 }, (_, hour) => ({
            index: hour.toString().padStart(2, "0"),
            sessions: 0,
        }))

        byHour.forEach((entry) => {
            if (entry.hour == null || entry.count == null) return
            const hour = Math.min(23, Math.max(0, entry.hour))
            base[hour].sessions = entry.count ?? 0
        })

        return base
    }, [questMetrics])

    const renderContent = () => {
        if (isLoading) {
            return <Skeleton height={CHART_HEIGHT} variant="rectangular" />
        }

        if (!hourlyData.length) {
            return <p>No data available.</p>
        }

        return (
            <div className="line-container" style={{ height: CHART_HEIGHT }}>
                <ResponsiveBar
                    data={hourlyData}
                    indexBy="index"
                    keys={["sessions"]}
                    margin={{ ...LINE_CHART_MARGIN, left: 65, bottom: 70 }}
                    padding={0.25}
                    colors={[SERVER_COLORS[0]]}
                    theme={BAR_THEME}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Hour of Day",
                        legendOffset: 50,
                    }}
                    axisLeft={{
                        legend: "Sessions",
                        legendOffset: -50,
                        legendPosition: "middle",
                    }}
                    valueFormat={(value) => Number(value).toLocaleString()}
                />
            </div>
        )
    }

    return (
        <Stack direction="column" gap="10px">
            <h3 style={{ margin: 0 }}>Activity by Hour</h3>
            {renderContent()}
        </Stack>
    )
}

export default QuestActivityByHour
