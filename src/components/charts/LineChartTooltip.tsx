import React from "react"
import Stack from "../global/Stack.tsx"
import { dateToLongStringWithTime } from "../../utils/dateUtils.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import { SliceData } from "@nivo/line"
import { NivoDateSeries } from "../../utils/nivoUtils.ts"
import "./LineChartTooltip.css"

interface LineChartTooltipProps {
    slice: SliceData<NivoDateSeries>
    getServerColor: (serverId: string) => string
    tooltipTitleFormatter?: (data: any) => string
    yFormatter?: (value: number) => string
    showTotal?: boolean
}

const TOOLTIP_WIDTH = 300
const VIEWPORT_PADDING = 20

const calculateTooltipPosition = (mouseX: number): string => {
    const viewportWidth = window.innerWidth

    // Calculate the absolute position of the mouse on the page
    const chartRect = document
        .querySelector('[role="img"]')
        ?.getBoundingClientRect()
    const absoluteMouseX = chartRect ? chartRect.left + mouseX : mouseX

    // Default: left of mouse
    let transform = "translateX(0%)"

    // Check if centering would cause overflow on the left
    if (absoluteMouseX - TOOLTIP_WIDTH - 20 < VIEWPORT_PADDING) {
        transform = "translateX(calc(100% + 30px))" // Position to the right of mouse
    }

    // For very small screens, ensure the tooltip doesn't exceed viewport
    if (viewportWidth < TOOLTIP_WIDTH * 2 + 2 * VIEWPORT_PADDING) {
        if (absoluteMouseX - TOOLTIP_WIDTH / 2 < VIEWPORT_PADDING) {
            transform = "translateX(calc(100% + 30px))" // Position to the right of mouse
        } else if (absoluteMouseX - TOOLTIP_WIDTH < VIEWPORT_PADDING) {
            transform = `translateX(${Math.max(
                VIEWPORT_PADDING - absoluteMouseX + TOOLTIP_WIDTH,
                Math.min(
                    viewportWidth -
                        VIEWPORT_PADDING -
                        absoluteMouseX -
                        TOOLTIP_WIDTH / 2,
                    0
                )
            )}px)`
        } else {
            transform = "translateX(0%)"
        }
    }

    return transform
}

const LineChartTooltip: React.FC<LineChartTooltipProps> = ({
    slice,
    getServerColor,
    tooltipTitleFormatter = (data: any) =>
        dateToLongStringWithTime(new Date(data)),
    yFormatter = (value: number) => value.toString(),
    showTotal = false,
}) => {
    const viewportWidth = window.innerWidth
    const mouseX = slice.points[0].x
    const transform = calculateTooltipPosition(mouseX)

    const total = slice.points.reduce(
        (sum, point) => sum + Number(point.data.y ?? 0),
        0
    )

    return (
        <div
            className="tooltip-container"
            style={{
                maxWidth: `${Math.min(TOOLTIP_WIDTH, viewportWidth - 2 * VIEWPORT_PADDING)}px`,
                transform: transform,
            }}
        >
            <div className="tooltip-header">
                {tooltipTitleFormatter(slice.points[0].data.x)}
                <hr style={{ margin: "4px 0 10px 0" }} />
            </div>
            <div className="tooltip-content">
                {[...slice.points]
                    .sort((a, b) => Number(b.data.y) - Number(a.data.y))
                    .map((point) => (
                        <Stack key={point.id} justify="space-between">
                            <Stack direction="row" gap="5px">
                                <div
                                    className="tooltip-series-color"
                                    style={{
                                        backgroundColor: getServerColor(
                                            point.seriesId
                                        ),
                                    }}
                                    aria-hidden="true"
                                />
                                <span>{toSentenceCase(point.seriesId)}</span>
                            </Stack>
                            <span>{yFormatter(Number(point.data.y))}</span>
                        </Stack>
                    ))}
                {showTotal && (
                    <>
                        <hr style={{ margin: "4px 0 4px 0" }} />
                        <Stack justify="space-between" align="center">
                            <span>Total</span>
                            <span>{yFormatter(total)}</span>
                        </Stack>
                    </>
                )}
            </div>
        </div>
    )
}

export default LineChartTooltip
