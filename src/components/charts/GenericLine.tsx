import { ResponsiveLine, SliceTooltipProps } from "@nivo/line"
import React, { useCallback, useMemo, useState } from "react"
import { NivoDateSeries, NivoNumberSeries } from "../../utils/nivoUtils.ts"
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
import "./Charts.css"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import TimezoneSelect from "../global/TimezoneSelect.tsx"

interface GenericLineProps {
    nivoData: NivoDateSeries[] | NivoNumberSeries[]
    showLegend?: boolean
    xScale?: any
    axisBottom?: any
    margin?: any
    tooltipTitleFormatter?: (data: any) => string
    yFormatter?: (value: number) => string
    spotlightSeries?: string[]
    showTotalInTooltip?: boolean
    chartHeight?: string
    showTimezoneDisplay?: boolean
}

// Module-level so the default is referentially stable across renders.
const defaultYFormatter = (value: number) => value.toString()

const GenericLine = ({
    nivoData,
    showLegend,
    xScale = LINE_CHART_X_SCALE,
    axisBottom = LINE_CHART_AXIS_BOTTOM,
    margin = LINE_CHART_MARGIN,
    tooltipTitleFormatter,
    yFormatter = defaultYFormatter,
    spotlightSeries = [],
    showTotalInTooltip = false,
    chartHeight = "400px",
    showTimezoneDisplay = false,
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

    const getServerColor = useMemo(
        () => createHighlightColorFunction(highlightedSeries),
        [highlightedSeries]
    )

    const filteredData = useMemo(() => {
        return nivoData.filter(
            (series) =>
                !excludedSeries.includes(series.id) &&
                SERVER_NAMES_LOWER.includes(series.id.toLowerCase())
        )
    }, [nivoData, excludedSeries])

    // Every prop handed to ResponsiveLine must be referentially stable. A new
    // `colors` or `sliceTooltip` function makes nivo rebuild every series and
    // re-render every line; each line re-render allocates a react-spring
    // interpolation sized to its SVG path. Those are only released on the next
    // animation frame, which never comes while the tab is hidden or occluded,
    // so the 10s server-info poll on the Live page leaked ~2MB per poll.
    const getLineColor = useCallback(
        (series: { id: string | number }) => getServerColor(String(series.id)),
        [getServerColor]
    )

    const sliceTooltip = useCallback(
        ({ slice }: SliceTooltipProps<NivoDateSeries | NivoNumberSeries>) => (
            <LineChartTooltip
                slice={slice}
                getServerColor={getServerColor}
                tooltipTitleFormatter={tooltipTitleFormatter}
                yFormatter={yFormatter}
                showTotal={showTotalInTooltip}
            />
        ),
        [getServerColor, tooltipTitleFormatter, yFormatter, showTotalInTooltip]
    )

    return (
        <Stack direction="column" gap="10px">
            <div className="line-container" style={{ height: chartHeight }}>
                <ResponsiveLine
                    data={filteredData}
                    margin={margin}
                    colors={getLineColor}
                    yScale={LINE_CHART_Y_SCALE}
                    xScale={xScale}
                    curve={LINE_CHART_DEFAULTS.curve}
                    theme={LINE_CHART_THEME}
                    enableGridX={LINE_CHART_DEFAULTS.enableGridX}
                    enablePoints={LINE_CHART_DEFAULTS.enablePoints}
                    lineWidth={LINE_CHART_DEFAULTS.lineWidth}
                    enableSlices={LINE_CHART_DEFAULTS.enableSlices}
                    useMesh={LINE_CHART_DEFAULTS.useMesh}
                    animate={false}
                    sliceTooltip={sliceTooltip}
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
            {showTimezoneDisplay && <TimezoneSelect />}
        </Stack>
    )
}

// Memoized so parent re-renders (e.g. the Live page's 10s poll) skip the chart
// entirely when its props haven't changed.
export default React.memo(GenericLine)
