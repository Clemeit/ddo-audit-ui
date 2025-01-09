import { useCallback, useMemo } from "react"
import {
    LFM_HEIGHT,
    GROUPING_SPRITE_MAP,
    GROUPING_COLORS,
    FONTS,
    GROUPING_PANEL_TOP_BORDER_HEIGHT,
    SORT_HEADER_HEIGHT,
    LFM_AREA_PADDING,
} from "../constants/grouping.ts"
import { useGroupingContext } from "../contexts/GroupingContext.tsx"
import { calculateCommonBoundingBoxes } from "../utils/lfmUtils.ts"
import { BoundingBox } from "../models/Geometry.ts"

interface UseRenderLfmPanelProps {
    lfmSprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
}

const useRenderLfmPanel = ({ lfmSprite, context }: UseRenderLfmPanelProps) => {
    const { panelWidth, sortBy } = useGroupingContext()
    const commonBoundingBoxes = useMemo(
        () => calculateCommonBoundingBoxes(panelWidth),
        [panelWidth]
    )
    const fonts = useMemo(() => FONTS(0), [])

    const renderLfmPanelToCanvas = useCallback(
        (lfmCount: number) => {
            if (!context || !lfmSprite) return

            const panelBottom =
                GROUPING_PANEL_TOP_BORDER_HEIGHT +
                SORT_HEADER_HEIGHT +
                LFM_AREA_PADDING.top +
                LFM_AREA_PADDING.bottom +
                lfmCount * LFM_HEIGHT

            context.fillStyle = "black"
            context.fillRect(
                0,
                GROUPING_SPRITE_MAP.HEADER_BAR.height,
                panelWidth,
                panelBottom
            )

            // draw header
            for (
                let i = 0;
                i <=
                Math.round(panelWidth / GROUPING_SPRITE_MAP.HEADER_BAR.width);
                i++
            ) {
                context.drawImage(
                    lfmSprite,
                    GROUPING_SPRITE_MAP.HEADER_BAR.x,
                    GROUPING_SPRITE_MAP.HEADER_BAR.y,
                    GROUPING_SPRITE_MAP.HEADER_BAR.width,
                    GROUPING_SPRITE_MAP.HEADER_BAR.height,
                    GROUPING_SPRITE_MAP.HEADER_LEFT.width +
                        GROUPING_SPRITE_MAP.HEADER_BAR.width * i,
                    0,
                    GROUPING_SPRITE_MAP.HEADER_BAR.width,
                    GROUPING_SPRITE_MAP.HEADER_BAR.height
                )
            }
            context.drawImage(
                lfmSprite,
                GROUPING_SPRITE_MAP.HEADER_LEFT.x,
                GROUPING_SPRITE_MAP.HEADER_LEFT.y,
                GROUPING_SPRITE_MAP.HEADER_LEFT.width,
                GROUPING_SPRITE_MAP.HEADER_LEFT.height,
                0,
                0,
                GROUPING_SPRITE_MAP.HEADER_LEFT.width,
                GROUPING_SPRITE_MAP.HEADER_LEFT.height
            )
            context.drawImage(
                lfmSprite,
                GROUPING_SPRITE_MAP.HEADER_RIGHT.x,
                GROUPING_SPRITE_MAP.HEADER_RIGHT.y,
                GROUPING_SPRITE_MAP.HEADER_RIGHT.width,
                GROUPING_SPRITE_MAP.HEADER_RIGHT.height,
                panelWidth - GROUPING_SPRITE_MAP.HEADER_RIGHT.width,
                0,
                GROUPING_SPRITE_MAP.HEADER_RIGHT.width,
                GROUPING_SPRITE_MAP.HEADER_RIGHT.height
            )
            context.fillStyle = "white"
            context.font = fonts.MAIN_HEADER
            context.textBaseline = "middle"
            context.textAlign = "center"
            context.fillText(
                "Social Panel - DDO Audit",
                panelWidth / 2,
                GROUPING_SPRITE_MAP.HEADER_BAR.height / 2 + 3
            )

            // draw top border
            for (
                let i = 0;
                i <=
                Math.round(panelWidth / GROUPING_SPRITE_MAP.CONTENT_TOP.width);
                i++
            ) {
                context.drawImage(
                    lfmSprite,
                    GROUPING_SPRITE_MAP.CONTENT_TOP.x,
                    GROUPING_SPRITE_MAP.CONTENT_TOP.y,
                    GROUPING_SPRITE_MAP.CONTENT_TOP.width,
                    GROUPING_SPRITE_MAP.CONTENT_TOP.height,
                    GROUPING_SPRITE_MAP.CONTENT_TOP.width * i,
                    GROUPING_SPRITE_MAP.HEADER_BAR.height,
                    GROUPING_SPRITE_MAP.CONTENT_TOP.width,
                    GROUPING_SPRITE_MAP.CONTENT_TOP.height
                )
            }
            context.drawImage(
                lfmSprite,
                GROUPING_SPRITE_MAP.CONTENT_TOP_LEFT.x,
                GROUPING_SPRITE_MAP.CONTENT_TOP_LEFT.y,
                GROUPING_SPRITE_MAP.CONTENT_TOP_LEFT.width,
                GROUPING_SPRITE_MAP.CONTENT_TOP_LEFT.height,
                0,
                GROUPING_SPRITE_MAP.HEADER_BAR.height,
                GROUPING_SPRITE_MAP.CONTENT_TOP_LEFT.width,
                GROUPING_SPRITE_MAP.CONTENT_TOP_LEFT.height
            )
            context.drawImage(
                lfmSprite,
                GROUPING_SPRITE_MAP.CONTENT_TOP_RIGHT.x,
                GROUPING_SPRITE_MAP.CONTENT_TOP_RIGHT.y,
                GROUPING_SPRITE_MAP.CONTENT_TOP_RIGHT.width,
                GROUPING_SPRITE_MAP.CONTENT_TOP_RIGHT.height,
                panelWidth - GROUPING_SPRITE_MAP.CONTENT_TOP_RIGHT.width,
                GROUPING_SPRITE_MAP.HEADER_BAR.height,
                GROUPING_SPRITE_MAP.CONTENT_TOP_RIGHT.width,
                GROUPING_SPRITE_MAP.CONTENT_TOP_RIGHT.height
            )

            // draw left and right borders
            context.translate(0, GROUPING_PANEL_TOP_BORDER_HEIGHT)
            for (let i = 0; i < Math.round(panelBottom / LFM_HEIGHT); i++) {
                context.drawImage(
                    lfmSprite,
                    GROUPING_SPRITE_MAP.CONTENT_LEFT.x,
                    GROUPING_SPRITE_MAP.CONTENT_LEFT.y,
                    GROUPING_SPRITE_MAP.CONTENT_LEFT.width,
                    GROUPING_SPRITE_MAP.CONTENT_LEFT.height,
                    0,
                    LFM_HEIGHT * i,
                    GROUPING_SPRITE_MAP.CONTENT_LEFT.width,
                    LFM_HEIGHT
                )

                context.drawImage(
                    lfmSprite,
                    GROUPING_SPRITE_MAP.CONTENT_RIGHT.x,
                    GROUPING_SPRITE_MAP.CONTENT_RIGHT.y,
                    GROUPING_SPRITE_MAP.CONTENT_RIGHT.width,
                    GROUPING_SPRITE_MAP.CONTENT_RIGHT.height,
                    panelWidth - GROUPING_SPRITE_MAP.CONTENT_RIGHT.width,
                    LFM_HEIGHT * i,
                    GROUPING_SPRITE_MAP.CONTENT_RIGHT.width,
                    LFM_HEIGHT
                )
            }
            context.setTransform(1, 0, 0, 1, 0, 0)

            // draw bottom border
            for (
                let i = 0;
                i <=
                Math.round(
                    panelWidth / GROUPING_SPRITE_MAP.CONTENT_BOTTOM.width
                );
                i++
            ) {
                context.drawImage(
                    lfmSprite,
                    GROUPING_SPRITE_MAP.CONTENT_BOTTOM.x,
                    GROUPING_SPRITE_MAP.CONTENT_BOTTOM.y,
                    GROUPING_SPRITE_MAP.CONTENT_BOTTOM.width,
                    GROUPING_SPRITE_MAP.CONTENT_BOTTOM.height,
                    GROUPING_SPRITE_MAP.CONTENT_BOTTOM.width * i,
                    panelBottom,
                    GROUPING_SPRITE_MAP.CONTENT_BOTTOM.width,
                    GROUPING_SPRITE_MAP.CONTENT_BOTTOM.height
                )
            }
            context.drawImage(
                lfmSprite,
                GROUPING_SPRITE_MAP.CONTENT_BOTTOM_LEFT.x,
                GROUPING_SPRITE_MAP.CONTENT_BOTTOM_LEFT.y,
                GROUPING_SPRITE_MAP.CONTENT_BOTTOM_LEFT.width,
                GROUPING_SPRITE_MAP.CONTENT_BOTTOM_LEFT.height,
                0,
                panelBottom,
                GROUPING_SPRITE_MAP.CONTENT_BOTTOM_LEFT.width,
                GROUPING_SPRITE_MAP.CONTENT_BOTTOM_LEFT.height
            )
            context.drawImage(
                lfmSprite,
                GROUPING_SPRITE_MAP.CONTENT_BOTTOM_RIGHT.x,
                GROUPING_SPRITE_MAP.CONTENT_BOTTOM_RIGHT.y,
                GROUPING_SPRITE_MAP.CONTENT_BOTTOM_RIGHT.width,
                GROUPING_SPRITE_MAP.CONTENT_BOTTOM_RIGHT.height,
                panelWidth - GROUPING_SPRITE_MAP.CONTENT_BOTTOM_RIGHT.width,
                panelBottom,
                GROUPING_SPRITE_MAP.CONTENT_BOTTOM_RIGHT.width,
                GROUPING_SPRITE_MAP.CONTENT_BOTTOM_RIGHT.height
            )

            // draw sorting headers
            context.fillStyle = GROUPING_COLORS.LEADER_NAME
            context.font = fonts.SORT_HEADER
            context.textBaseline = "middle"
            context.textAlign = "left"
            const panels: [string, BoundingBox, string][] = [
                [
                    "leader",
                    commonBoundingBoxes.mainPanelBoundingBox,
                    "Leader Name",
                ],
                ["quest", commonBoundingBoxes.questPanelBoundingBox, "Quest"],
                [
                    "classes",
                    commonBoundingBoxes.classPanelBoundingBox,
                    "Classes Needed",
                ],
                ["level", commonBoundingBoxes.levelPanelBoundingBox, "Lvl"],
            ]
            panels.forEach((panel, index) => {
                context.translate(
                    panel[1].x +
                        GROUPING_SPRITE_MAP.CONTENT_LEFT.width +
                        LFM_AREA_PADDING.left,
                    panel[1].y +
                        GROUPING_PANEL_TOP_BORDER_HEIGHT +
                        LFM_AREA_PADDING.top
                )
                const sourceBox =
                    sortBy.type === panel[0]
                        ? GROUPING_SPRITE_MAP.SORT_HEADER_HIGHLIGHTED
                        : GROUPING_SPRITE_MAP.SORT_HEADER
                context.drawImage(
                    lfmSprite,
                    sourceBox.LEFT.x,
                    sourceBox.LEFT.y,
                    sourceBox.LEFT.width,
                    sourceBox.LEFT.height,
                    0,
                    0,
                    sourceBox.LEFT.width,
                    sourceBox.LEFT.height
                )
                context.drawImage(
                    lfmSprite,
                    sourceBox.CENTER.x,
                    sourceBox.CENTER.y,
                    sourceBox.CENTER.width,
                    sourceBox.CENTER.height,
                    sourceBox.LEFT.width,
                    0,
                    panel[1].width,
                    sourceBox.CENTER.height
                )
                context.drawImage(
                    lfmSprite,
                    sourceBox.RIGHT.x,
                    sourceBox.RIGHT.y,
                    sourceBox.RIGHT.width,
                    sourceBox.RIGHT.height,
                    panel[1].width - (index === panels.length - 1 ? 0 : 2),
                    0,
                    sourceBox.RIGHT.width,
                    sourceBox.RIGHT.height
                )
                context.fillText(panel[2], 20, sourceBox.CENTER.height / 2)
                if (sortBy.type === panel[0]) {
                    // draw a little triangle to indicate sorting
                    context.save()
                    context.shadowBlur = 2
                    context.shadowColor = "black"
                    context.shadowOffsetX = 1
                    context.shadowOffsetY = 1
                    const triangleX = 10
                    if (sortBy.direction === "asc") {
                        const triangleY = sourceBox.CENTER.height / 2 - 3
                        context.beginPath()
                        context.moveTo(triangleX, triangleY + 5)
                        context.lineTo(triangleX + 5, triangleY + 5)
                        context.lineTo(triangleX + 2.5, triangleY)
                        context.fill()
                    } else {
                        const triangleY = sourceBox.CENTER.height / 2 - 2
                        context.beginPath()
                        context.moveTo(triangleX, triangleY)
                        context.lineTo(triangleX + 5, triangleY)
                        context.lineTo(triangleX + 2.5, triangleY + 5)
                        context.fill()
                    }
                    context.restore()
                }
                context.setTransform(1, 0, 0, 1, 0, 0)
            })
        },
        [lfmSprite, context, panelWidth, commonBoundingBoxes, fonts, sortBy]
    )

    return { renderLfmPanelToCanvas }
}

export default useRenderLfmPanel
