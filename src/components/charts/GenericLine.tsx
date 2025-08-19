import { ResponsiveLine } from "@nivo/line"
import { useMemo, useState } from "react"
import { NivoSeries } from "../../utils/nivoUtils.ts"
import Stack from "../global/Stack.tsx"
import GenericLegend from "./GenericLegend.tsx"
import LineChartTooltip from "./LineChartTooltip.tsx"
import { createHighlightColorFunction } from "./chartColorUtils.ts"
import {
    LINE_CHART_MARGIN,
    LINE_CHART_Y_SCALE,
    LINE_CHART_X_SCALE,
    LINE_CHART_THEME,
    LINE_CHART_AXIS_BOTTOM,
    LINE_CHART_DEFAULTS,
} from "./lineChartConfig.ts"
import { dateToLongStringWithTime } from "../../utils/dateUtils.ts"
import "./Charts.css"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"

interface GenericLineProps {
    nivoData: NivoSeries[]
    showLegend?: boolean
    xScale?: any
    axisBottom?: any
    margin?: any
    tooltipTitleFormatter?: (data: any) => string
    yFormatter?: (value: number) => string
    spotlightSeries?: string[]
    showTotalInTooltip?: boolean
}

const GenericLine = ({
    nivoData,
    showLegend,
    xScale = LINE_CHART_X_SCALE,
    axisBottom = LINE_CHART_AXIS_BOTTOM,
    margin = LINE_CHART_MARGIN,
    tooltipTitleFormatter = (data: any) => dateToLongStringWithTime(data),
    yFormatter = (value: number) => value.toString(),
    spotlightSeries = [],
    showTotalInTooltip = false,
}: GenericLineProps) => {
    const [excludedSeries, setExcludedSeries] = useState<string[]>([])
    const [highlightedSeries, setHighlightedSeries] =
        useState<string[]>(spotlightSeries)

    const handleItemClick = (serverId: string) => {
        setExcludedSeries((prev) =>
            prev.includes(serverId)
                ? prev.filter((id) => id !== serverId)
                : [...prev, serverId]
        )
    }

    const handleItemHover = (serverId: string) => {
        if (!serverId) {
            setHighlightedSeries([])
            return
        }
        setHighlightedSeries([serverId])
    }

    const getServerColor = createHighlightColorFunction(highlightedSeries)

    const filteredData = useMemo(() => {
        return nivoData.filter(
            (series) =>
                !excludedSeries.includes(series.id) &&
                SERVER_NAMES_LOWER.includes(series.id.toLowerCase())
        )
    }, [nivoData, excludedSeries])

    return (
        <Stack direction="column" gap="10px">
            <div className="line-container">
                <ResponsiveLine
                    data={filteredData}
                    margin={margin}
                    colors={(d) => getServerColor(d.id)}
                    yScale={LINE_CHART_Y_SCALE}
                    xScale={xScale}
                    xFormat={LINE_CHART_DEFAULTS.xFormat}
                    curve={LINE_CHART_DEFAULTS.curve}
                    theme={LINE_CHART_THEME}
                    enableGridX={LINE_CHART_DEFAULTS.enableGridX}
                    enablePoints={LINE_CHART_DEFAULTS.enablePoints}
                    lineWidth={LINE_CHART_DEFAULTS.lineWidth}
                    enableSlices={LINE_CHART_DEFAULTS.enableSlices}
                    useMesh={LINE_CHART_DEFAULTS.useMesh}
                    sliceTooltip={({ slice }) => (
                        <LineChartTooltip
                            slice={slice}
                            getServerColor={getServerColor}
                            tooltipTitleFormatter={tooltipTitleFormatter}
                            yFormatter={yFormatter}
                            showTotal={showTotalInTooltip}
                        />
                    )}
                    axisBottom={axisBottom}
                />
            </div>
            {showLegend && (
                <GenericLegend
                    nivoData={nivoData}
                    onItemClick={handleItemClick}
                    onItemHover={handleItemHover}
                    excludedSeries={excludedSeries}
                />
            )}
        </Stack>
    )
}

export default GenericLine
