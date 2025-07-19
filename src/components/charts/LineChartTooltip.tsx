import React from "react"
import Stack from "../global/Stack.tsx"
import { dateToLongStringWithTime } from "../../utils/dateUtils.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import { SliceData, Point } from "@nivo/line"
import { NivoSeries } from "../../utils/nivoUtils.ts"

interface LineChartTooltipProps {
    slice: SliceData<NivoSeries>
    getServerColor: (serverId: string) => string
    dateFormatter?: (date: Date) => string
    yFormatter?: (value: number) => string
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
    dateFormatter = dateToLongStringWithTime,
    yFormatter = (value: number) => value.toString(),
}) => {
    const viewportWidth = window.innerWidth
    const mouseX = slice.points[0].x
    const transform = calculateTooltipPosition(mouseX)

    return (
        <div
            style={{
                background: "var(--soft-highlight)",
                padding: "8px 12px",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                color: "var(--text)",
                fontSize: "14px",
                maxWidth: `${Math.min(TOOLTIP_WIDTH, viewportWidth - 2 * VIEWPORT_PADDING)}px`,
                minWidth: "0",
                width: "fit-content",
                position: "relative",
                transform: transform,
                wordWrap: "break-word",
                overflow: "hidden",
                boxSizing: "border-box",
                whiteSpace: "nowrap",
            }}
        >
            <div
                style={{
                    marginBottom: "4px",
                    fontWeight: "bold",
                }}
            >
                {dateFormatter(new Date(slice.points[0].data.x))}
                <hr style={{ margin: "4px 0 10px 0" }} />
            </div>
            <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
                {[...slice.points]
                    .sort((a, b) => Number(b.data.y) - Number(a.data.y))
                    .map((point) => (
                        <div
                            key={point.id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <Stack direction="row" gap="5px">
                                <div
                                    style={{
                                        backgroundColor: getServerColor(
                                            point.seriesId
                                        ),
                                        width: "15px",
                                        height: "15px",
                                        borderRadius: "50%",
                                    }}
                                    aria-hidden="true"
                                />
                                <span>{toSentenceCase(point.seriesId)}</span>
                            </Stack>
                            <span>{yFormatter(Number(point.data.y))}</span>
                        </div>
                    ))}
            </div>
        </div>
    )
}

export default LineChartTooltip
