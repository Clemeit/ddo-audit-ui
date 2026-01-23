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

const formatDurationRange = (startSeconds: number, endSeconds: number) => {
    const intervalSeconds = endSeconds - startSeconds

    // When bins are 30-second wide, label using half-minute precision.
    const useHalfMinute = intervalSeconds === 30

    const formatMinutesLabel = (minutes: number) => {
        return minutes % 1 === 0 ? String(minutes) : minutes.toFixed(1)
    }

    if (useHalfMinute) {
        // For smaller values, prefer seconds up to 2 minutes.
        if (endSeconds <= 120) {
            const s = Math.round(startSeconds)
            const e = Math.round(endSeconds)
            return `${s}-${e} sec`
        }

        const startMinutes = Math.round((startSeconds / 60) * 2) / 2
        const endMinutes = Math.round((endSeconds / 60) * 2) / 2
        return `${formatMinutesLabel(startMinutes)}-${formatMinutesLabel(endMinutes)} min`
    }

    const startMinutes = Math.round(startSeconds / 60)
    const endMinutes = Math.round(endSeconds / 60)
    return `${startMinutes}-${endMinutes} min`
}

const QuestLengthHistogram = ({ questMetrics, isLoading }: Props) => {
    const histogramData = useMemo(() => {
        const bins = questMetrics?.analytics_data?.histogram ?? []

        return bins
            .filter(
                (bin) =>
                    bin.bin_start != null &&
                    bin.bin_end != null &&
                    bin.count != null
            )
            .map((bin) => ({
                start: bin.bin_start ?? 0,
                index: formatDurationRange(
                    bin.bin_start ?? 0,
                    bin.bin_end ?? 0
                ),
                runs: bin.count ?? 0,
            }))
            .sort((a, b) => a.start - b.start)
            .map(({ index, runs }) => ({ index, runs }))
    }, [questMetrics])

    const renderContent = () => {
        if (isLoading) {
            return <Skeleton height={CHART_HEIGHT} variant="rectangular" />
        }

        if (!histogramData.length) {
            return <p>No data available.</p>
        }

        return (
            <div className="line-container" style={{ height: CHART_HEIGHT }}>
                <ResponsiveBar
                    data={histogramData}
                    indexBy="index"
                    keys={["runs"]}
                    margin={{ ...LINE_CHART_MARGIN, left: 80, bottom: 80 }}
                    padding={0.25}
                    colors={[SERVER_COLORS[0]]}
                    theme={BAR_THEME}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -30,
                        legend: "Run Duration (minutes)",
                        legendOffset: 70,
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
            <h3 style={{ margin: 0 }}>Quest Length Distribution</h3>
            {renderContent()}
        </Stack>
    )
}

export default QuestLengthHistogram
