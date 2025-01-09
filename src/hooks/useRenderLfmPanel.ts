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
import { useGroupingContext } from "../components/grouping/GroupingContext.tsx"
import { calculateCommonBoundingBoxes } from "../utils/lfmUtils.ts"
import { BoundingBox } from "../models/Geometry.ts"

interface UseRenderLfmPanelProps {
    lfmSprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
}

const useRenderLfmPanel = ({ lfmSprite, context }: UseRenderLfmPanelProps) => {
    const { panelWidth } = useGroupingContext()
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
            const panels: [BoundingBox, string][] = [
                [commonBoundingBoxes.mainPanelBoundingBox, "Leader Name"],
                [commonBoundingBoxes.questPanelBoundingBox, "Quest"],
                [commonBoundingBoxes.classPanelBoundingBox, "Classes Needed"],
                [commonBoundingBoxes.levelPanelBoundingBox, "Lvl"],
            ]
            panels.forEach((panel, index) => {
                context.translate(
                    panel[0].x +
                        GROUPING_SPRITE_MAP.CONTENT_LEFT.width +
                        LFM_AREA_PADDING.left,
                    panel[0].y +
                        GROUPING_PANEL_TOP_BORDER_HEIGHT +
                        LFM_AREA_PADDING.top
                )
                context.drawImage(
                    lfmSprite,
                    GROUPING_SPRITE_MAP.SORT_HEADER.LEFT.x,
                    GROUPING_SPRITE_MAP.SORT_HEADER.LEFT.y,
                    GROUPING_SPRITE_MAP.SORT_HEADER.LEFT.width,
                    GROUPING_SPRITE_MAP.SORT_HEADER.LEFT.height,
                    0,
                    0,
                    GROUPING_SPRITE_MAP.SORT_HEADER.LEFT.width,
                    GROUPING_SPRITE_MAP.SORT_HEADER.LEFT.height
                )
                context.drawImage(
                    lfmSprite,
                    GROUPING_SPRITE_MAP.SORT_HEADER.CENTER.x,
                    GROUPING_SPRITE_MAP.SORT_HEADER.CENTER.y,
                    GROUPING_SPRITE_MAP.SORT_HEADER.CENTER.width,
                    GROUPING_SPRITE_MAP.SORT_HEADER.CENTER.height,
                    GROUPING_SPRITE_MAP.SORT_HEADER.LEFT.width,
                    0,
                    panel[0].width,
                    GROUPING_SPRITE_MAP.SORT_HEADER.CENTER.height
                )
                context.drawImage(
                    lfmSprite,
                    GROUPING_SPRITE_MAP.SORT_HEADER.RIGHT.x,
                    GROUPING_SPRITE_MAP.SORT_HEADER.RIGHT.y,
                    GROUPING_SPRITE_MAP.SORT_HEADER.RIGHT.width,
                    GROUPING_SPRITE_MAP.SORT_HEADER.RIGHT.height,
                    panel[0].width - (index === panels.length - 1 ? 0 : 2),
                    0,
                    GROUPING_SPRITE_MAP.SORT_HEADER.RIGHT.width,
                    GROUPING_SPRITE_MAP.SORT_HEADER.RIGHT.height
                )
                context.fillText(
                    panel[1],
                    20,
                    GROUPING_SPRITE_MAP.SORT_HEADER.CENTER.height / 2
                )
                context.setTransform(1, 0, 0, 1, 0, 0)
            })
        },
        [lfmSprite, context, panelWidth, commonBoundingBoxes, fonts]
    )

    return { renderLfmPanelToCanvas }
}

export default useRenderLfmPanel
