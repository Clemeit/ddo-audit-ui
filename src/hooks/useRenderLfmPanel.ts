import React, { useCallback } from "react"
import {
    LFM_HEIGHT,
    LFM_PADDING,
    GROUPING_SPRITE_MAP,
    GROUPING_COLORS,
    FONTS,
} from "../constants/grouping.ts"
import { useGroupingContext } from "../components/grouping/GroupingContext.tsx"

interface UseRenderLfmPanelProps {
    lfmSprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
}

const useRenderLfmPanel = ({ lfmSprite, context }: UseRenderLfmPanelProps) => {
    const { panelWidth } = useGroupingContext()

    const renderLfmPanelToCanvas = useCallback(
        (lfmCount: number) => {
            if (!context || !lfmSprite) return

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

            // draw footer
        },
        [lfmSprite, context, panelWidth]
    )

    return { renderLfmPanelToCanvas }
}

export default useRenderLfmPanel
