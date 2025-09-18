import React from "react"
import { NivoBarSlice, NivoPieSlice } from "../../utils/nivoUtils.ts"
import Stack from "../global/Stack.tsx"
import { ResponsiveBar, BarDatum, BarCustomLayerProps } from "@nivo/bar"
import { getServerColor } from "../../utils/chartUtils.ts"
import GenericLegend from "./GenericLegend.tsx"
import { LINE_CHART_MARGIN } from "./lineChartConfig.ts"

interface GenericBarProps {
    nivoData: NivoBarSlice[]
    showLegend?: boolean
    xScale?: any
    axisBottom?: any
    margin?: any
    indexBy?: string
    tooltipTitleFormatter?: (data: any) => string
    yFormatter?: (value: number) => string
    spotlightSeries?: string[]
    chartHeight?: string
    groupMode?: "stacked" | "grouped"
}

const GenericBar = ({
    nivoData,
    showLegend,
    // xScale = LINE_CHART_X_SCALE,
    // axisBottom = LINE_CHART_AXIS_BOTTOM,
    // margin = LINE_CHART_MARGIN,
    indexBy = "index",
    tooltipTitleFormatter,
    yFormatter = (value: number) => value.toFixed(2),
    spotlightSeries = [],
    chartHeight = "400px",
    groupMode = "stacked",
}: GenericBarProps) => {
    return (
        <Stack direction="column" gap="10px">
            <div className="line-container" style={{ height: chartHeight }}>
                <ResponsiveBar
                    data={nivoData}
                    indexBy="index"
                    keys={[
                        ...(nivoData.length > 0
                            ? Object.keys(nivoData[0]).filter(
                                  (key) => key !== "index"
                              )
                            : []),
                    ]}
                    theme={{
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
                    }}
                    enableTotals
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    groupMode={groupMode}
                    margin={{ ...LINE_CHART_MARGIN, left: 50 }}
                    colors={(d) => getServerColor(d.id.toString())}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        legendOffset: 50,
                        legend: "Day of Week",
                    }}
                    valueFormat={yFormatter}
                />
            </div>
        </Stack>
    )
}

export default GenericBar
