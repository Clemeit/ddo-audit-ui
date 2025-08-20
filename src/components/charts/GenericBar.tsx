import React from "react"
import { NivoBarSlice, NivoPieSlice } from "../../utils/nivoUtils.ts"
import Stack from "../global/Stack.tsx"
import { ResponsiveBar } from "@nivo/bar"
import { getServerColor } from "../../utils/chartUtils.ts"
import GenericLegend from "./GenericLegend.tsx"

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
}

const GenericBar = ({
    nivoData,
    showLegend,
    // xScale = LINE_CHART_X_SCALE,
    // axisBottom = LINE_CHART_AXIS_BOTTOM,
    // margin = LINE_CHART_MARGIN,
    indexBy = "index",
    tooltipTitleFormatter,
    yFormatter = (value: number) => value.toString(),
    spotlightSeries = [],
    chartHeight = "400px",
}: GenericBarProps) => {
    return (
        <Stack direction="column" gap="10px">
            <div className="line-container" style={{ height: chartHeight }}>
                <ResponsiveBar
                    data={nivoData}
                    indexBy={indexBy}
                    // margin={margin}
                    colors={(d) => getServerColor(d.data.index)}
                    // yScale={LINE_CHART_Y_SCALE}
                    // xScale={xScale}
                    // xFormat={LINE_CHART_DEFAULTS.xFormat}
                    // curve={LINE_CHART_DEFAULTS.curve}
                    // theme={LINE_CHART_THEME}
                    // enableGridX={LINE_CHART_DEFAULTS.enableGridX}
                    // enablePoints={LINE_CHART_DEFAULTS.enablePoints}
                    // lineWidth={LINE_CHART_DEFAULTS.lineWidth}
                    // enableSlices={LINE_CHART_DEFAULTS.enableSlices}
                    // useMesh={LINE_CHART_DEFAULTS.useMesh}
                    // sliceTooltip={({ slice }) => (
                    //     <LineChartTooltip
                    //         slice={slice}
                    //         getServerColor={getServerColor}
                    //         tooltipTitleFormatter={tooltipTitleFormatter}
                    //         yFormatter={yFormatter}
                    //         showTotal={showTotalInTooltip}
                    //     />
                    // )}
                    // axisBottom={axisBottom}
                />
            </div>
            {showLegend && (
                <GenericLegend
                    nivoData={nivoData}
                    // onItemClick={handleItemClick}
                    // onItemHover={handleItemHover}
                    // excludedSeries={excludedSeries}
                />
            )}
        </Stack>
    )
}

export default GenericBar
