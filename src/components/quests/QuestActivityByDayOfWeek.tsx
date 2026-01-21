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
const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
]

const QuestActivityByDayOfWeek = ({ questMetrics, isLoading }: Props) => {
    const byDayData = useMemo(() => {
        const byDay =
            questMetrics?.analytics_data?.activity_by_day_of_week ?? []
        if (!byDay.length) return []

        const base = DAY_NAMES.map((name) => ({ index: name, sessions: 0 }))

        byDay.forEach((entry) => {
            const dayIndex =
                entry.day != null && entry.day >= 0 && entry.day <= 6
                    ? entry.day
                    : null

            if (dayIndex == null) return

            const label = entry.day_name ?? DAY_NAMES[dayIndex]
            base[dayIndex] = {
                index: label,
                sessions: entry.count ?? 0,
            }
        })

        return base
    }, [questMetrics])

    const renderContent = () => {
        if (isLoading) {
            return <Skeleton height={CHART_HEIGHT} variant="rectangular" />
        }

        if (!byDayData.length) {
            return <p>No data available.</p>
        }

        return (
            <div className="line-container" style={{ height: CHART_HEIGHT }}>
                <ResponsiveBar
                    data={byDayData}
                    indexBy="index"
                    keys={["sessions"]}
                    margin={{ ...LINE_CHART_MARGIN, left: 80, bottom: 70 }}
                    padding={0.25}
                    colors={[SERVER_COLORS[0]]}
                    theme={BAR_THEME}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Day of Week",
                        legendOffset: 50,
                    }}
                    axisLeft={{
                        legend: "Sessions",
                        legendOffset: -65,
                        legendPosition: "middle",
                    }}
                    valueFormat={(value) => Number(value).toLocaleString()}
                />
            </div>
        )
    }

    return (
        <Stack direction="column" gap="10px">
            <h3 style={{ margin: 0 }}>Activity by Day of Week</h3>
            {renderContent()}
        </Stack>
    )
}

export default QuestActivityByDayOfWeek
