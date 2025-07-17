import { ResponsiveLine } from "@nivo/line"
import React, { useMemo } from "react"
import { NivoSeries } from "../../utils/nivoUtils.ts"
import Stack from "../global/Stack.tsx"
import { ResponsiveContainer } from "recharts"
import GenericLegend from "./GenericLegend.tsx"
import { getServerColor } from "../../utils/chartUtils.ts"

interface GenericLineProps {
    nivoData: NivoSeries[]
    showLegend?: boolean
}

const GenericLine = ({ nivoData, showLegend }: GenericLineProps) => {
    const [excludedSeries, setExcludedSeries] = React.useState<string[]>([])

    const handleItemClick = (serverId: string) => {
        setExcludedSeries((prev) =>
            prev.includes(serverId)
                ? prev.filter((id) => id !== serverId)
                : [...prev, serverId]
        )
    }

    const filteredData = useMemo(() => {
        return nivoData.filter((series) => !excludedSeries.includes(series.id))
    }, [nivoData, excludedSeries])

    return (
        <Stack direction="column" gap="10px">
            <ResponsiveContainer width="100%" height={400}>
                <ResponsiveLine
                    data={filteredData}
                    margin={{
                        bottom: 60,
                        left: 40,
                        right: 10,
                        top: 30,
                    }}
                    colors={(d) => getServerColor(d.id)}
                    yScale={{
                        type: "linear",
                        min: 0,
                        max: "auto",
                        stacked: false,
                        reverse: false,
                    }}
                    xScale={{
                        type: "time",
                        format: "%Y-%m-%dT%H:%M:%SZ",
                        useUTC: true,
                        precision: "minute",
                    }}
                    xFormat="time:%Y-%m-%d %H:%M"
                    curve="catmullRom"
                    theme={{
                        axis: {
                            ticks: {
                                text: {
                                    fill: "var(--text)",
                                    fontSize: 14,
                                },
                            },
                            legend: {
                                text: {
                                    fill: "var(--text)",
                                    fontSize: 14,
                                },
                            },
                        },
                    }}
                    enableGridX={true}
                    enablePoints={false}
                    lineWidth={3}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: "Time",
                        legendOffset: 50,
                        format: "%H:%M",
                        tickValues: "every 1 hour",
                    }}
                />
            </ResponsiveContainer>
            {showLegend && (
                <GenericLegend
                    nivoData={nivoData}
                    onItemClick={handleItemClick}
                    excludedSeries={excludedSeries}
                />
            )}
        </Stack>
    )
}

export default GenericLine
