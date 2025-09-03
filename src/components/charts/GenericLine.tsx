import { ResponsiveLine } from "@nivo/line"
import { useMemo, useState } from "react"
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
import { useAppContext } from "../../contexts/AppContext.tsx"
import ColoredText from "../global/ColoredText.tsx"
import FauxLink from "../global/FauxLink.tsx"
import { ReactComponent as CloseSVG } from "../../assets/svg/close.svg"
import { DEFAULT_TIMEZONE } from "../../constants/client.ts"

interface IntlWithSupportedValuesOf extends Partial<typeof Intl> {
    supportedValuesOf?: (key: string) => string[]
}

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

const GenericLine = ({
    nivoData,
    showLegend,
    xScale = LINE_CHART_X_SCALE,
    axisBottom = LINE_CHART_AXIS_BOTTOM,
    margin = LINE_CHART_MARGIN,
    tooltipTitleFormatter,
    yFormatter = (value: number) => value.toString(),
    spotlightSeries = [],
    showTotalInTooltip = false,
    chartHeight = "400px",
    showTimezoneDisplay = false,
}: GenericLineProps) => {
    const [excludedSeries, setExcludedSeries] = useState<string[]>([])
    const [highlightedSeries, setHighlightedSeries] =
        useState<string[]>(spotlightSeries)
    const [isTimezoneSelectShown, setIsTimezoneSelectShown] = useState(false)
    const { timezoneOverride, setTimezoneOverride } = useAppContext()

    const getTimezoneDisplay = () => {
        if (isTimezoneSelectShown) {
            return (
                <Stack
                    direction="row"
                    gap="5px"
                    align="center"
                    style={{ lineHeight: "1.7rem" }}
                >
                    <span>Timezone:</span>
                    <select
                        className="full-width-mobile"
                        id="timezoneSelect"
                        value={
                            timezoneOverride ||
                            Intl.DateTimeFormat().resolvedOptions().timeZone
                        }
                        onChange={(e) => {
                            setTimezoneOverride(e.target.value)
                            setIsTimezoneSelectShown(false)
                        }}
                    >
                        <option value="">(Use browser setting)</option>
                        {typeof (Intl as IntlWithSupportedValuesOf)
                            .supportedValuesOf === "function"
                            ? (Intl as IntlWithSupportedValuesOf)
                                  .supportedValuesOf!("timeZone").map(
                                  (tz: string) => (
                                      <option key={tz} value={tz}>
                                          {tz}
                                      </option>
                                  )
                              )
                            : [
                                  "UTC",
                                  "America/New_York",
                                  "America/Chicago",
                                  "America/Denver",
                                  "America/Los_Angeles",
                                  "Europe/London",
                                  "Europe/Paris",
                                  "Asia/Tokyo",
                                  "Australia/Sydney",
                              ].map((tz) => (
                                  <option key={tz} value={tz}>
                                      {tz}
                                  </option>
                              ))}
                    </select>
                    <CloseSVG
                        className="clickable-icon"
                        onClick={() => setIsTimezoneSelectShown(false)}
                    />
                </Stack>
            )
        }

        return (
            <Stack
                direction="row"
                gap="5px"
                align="center"
                style={{ lineHeight: "1.7rem" }}
            >
                <ColoredText color="secondary">Timezone:</ColoredText>
                <ColoredText color="secondary">
                    <FauxLink onClick={() => setIsTimezoneSelectShown(true)}>
                        {timezoneOverride ||
                            Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </FauxLink>
                </ColoredText>
            </Stack>
        )
    }

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

    // Helper to format x-axis labels with timezoneOverride
    const formatXAxis = (value: Date | string | number) => {
        if (!value) return ""
        try {
            const date = new Date(value)
            const dateWithTimezone = date.toLocaleString("en-US", {
                timeZone: timezoneOverride || DEFAULT_TIMEZONE,
            })
            return dateWithTimezone
        } catch {
            return value.toString()
        }
    }

    return (
        <Stack direction="column" gap="10px">
            <div className="line-container" style={{ height: chartHeight }}>
                <ResponsiveLine
                    data={filteredData}
                    margin={margin}
                    colors={(d) => getServerColor(d.id)}
                    yScale={LINE_CHART_Y_SCALE}
                    xScale={xScale}
                    xFormat={formatXAxis}
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
            {showTimezoneDisplay && getTimezoneDisplay()}
        </Stack>
    )
}

export default GenericLine
