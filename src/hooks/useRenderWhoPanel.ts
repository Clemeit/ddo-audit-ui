import { useCallback, useMemo } from "react"
import { SPRITE_MAP } from "../constants/spriteMap.ts"
import { useWhoContext } from "../contexts/WhoContext.tsx"
import { CHARACTER_HEIGHT, FONTS } from "../constants/whoPanel.ts"

interface Props {
    sprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
    minimumCharacterCount?: number
}

const useRenderWhoPanel = ({
    sprite,
    context,
    minimumCharacterCount = 0,
}: Props) => {
    const { panelWidth, panelHeight } = useWhoContext()
    const fonts = useMemo(() => FONTS(0), [])

    const renderWhoPanel = useCallback(() => {
        if (!context || !sprite) return
        context.imageSmoothingEnabled = false

        context.clearRect(0, 0, panelWidth, panelHeight)

        // render the header
        context.drawImage(
            sprite,
            SPRITE_MAP.HEADER_LEFT.x,
            SPRITE_MAP.HEADER_LEFT.y,
            SPRITE_MAP.HEADER_LEFT.width,
            SPRITE_MAP.HEADER_LEFT.height,
            0,
            0,
            SPRITE_MAP.HEADER_LEFT.width,
            SPRITE_MAP.HEADER_LEFT.height
        )
        for (
            let i = 0;
            i <= Math.round(panelWidth / SPRITE_MAP.HEADER_BAR.width);
            i++
        ) {
            context.drawImage(
                sprite,
                SPRITE_MAP.HEADER_BAR.x,
                SPRITE_MAP.HEADER_BAR.y,
                SPRITE_MAP.HEADER_BAR.width,
                SPRITE_MAP.HEADER_BAR.height,
                SPRITE_MAP.HEADER_LEFT.width + SPRITE_MAP.HEADER_BAR.width * i,
                0,
                SPRITE_MAP.HEADER_BAR.width,
                SPRITE_MAP.HEADER_BAR.height
            )
        }
        context.drawImage(
            sprite,
            SPRITE_MAP.HEADER_RIGHT.x,
            SPRITE_MAP.HEADER_RIGHT.y,
            SPRITE_MAP.HEADER_RIGHT.width,
            SPRITE_MAP.HEADER_RIGHT.height,
            panelWidth - SPRITE_MAP.HEADER_RIGHT.width,
            0,
            SPRITE_MAP.HEADER_RIGHT.width,
            SPRITE_MAP.HEADER_RIGHT.height
        )
        context.fillStyle = "white"
        context.font = fonts.MAIN_HEADER
        context.textBaseline = "middle"
        context.textAlign = "center"
        context.fillText(
            "Who Panel - DDO Audit",
            panelWidth / 2,
            SPRITE_MAP.HEADER_BAR.height / 2 + 3
        )

        // render the top border
        for (
            let i = 0;
            i <= Math.round(panelWidth / SPRITE_MAP.CONTENT_TOP.width);
            i++
        ) {
            context.drawImage(
                sprite,
                SPRITE_MAP.CONTENT_TOP.x,
                SPRITE_MAP.CONTENT_TOP.y,
                SPRITE_MAP.CONTENT_TOP.width,
                SPRITE_MAP.CONTENT_TOP.height,
                SPRITE_MAP.CONTENT_TOP.width * i,
                SPRITE_MAP.HEADER_BAR.height,
                SPRITE_MAP.CONTENT_TOP.width,
                SPRITE_MAP.CONTENT_TOP.height
            )
        }
        context.drawImage(
            sprite,
            SPRITE_MAP.CONTENT_TOP_LEFT.x,
            SPRITE_MAP.CONTENT_TOP_LEFT.y,
            SPRITE_MAP.CONTENT_TOP_LEFT.width,
            SPRITE_MAP.CONTENT_TOP_LEFT.height,
            0,
            SPRITE_MAP.HEADER_BAR.height,
            SPRITE_MAP.CONTENT_TOP_LEFT.width,
            SPRITE_MAP.CONTENT_TOP_LEFT.height
        )
        context.drawImage(
            sprite,
            SPRITE_MAP.CONTENT_TOP_RIGHT.x,
            SPRITE_MAP.CONTENT_TOP_RIGHT.y,
            SPRITE_MAP.CONTENT_TOP_RIGHT.width,
            SPRITE_MAP.CONTENT_TOP_RIGHT.height,
            panelWidth - SPRITE_MAP.CONTENT_TOP_RIGHT.width,
            SPRITE_MAP.HEADER_BAR.height,
            SPRITE_MAP.CONTENT_TOP_RIGHT.width,
            SPRITE_MAP.CONTENT_TOP_RIGHT.height
        )

        // render left and right borders
        context.translate(
            0,
            SPRITE_MAP.HEADER_BAR.height + SPRITE_MAP.CONTENT_TOP.height
        )
        for (let i = 0; i < Math.round(panelHeight / CHARACTER_HEIGHT); i++) {
            context.drawImage(
                sprite,
                SPRITE_MAP.CONTENT_LEFT.x,
                SPRITE_MAP.CONTENT_LEFT.y,
                SPRITE_MAP.CONTENT_LEFT.width,
                SPRITE_MAP.CONTENT_LEFT.height,
                0,
                CHARACTER_HEIGHT * i,
                SPRITE_MAP.CONTENT_LEFT.width,
                CHARACTER_HEIGHT
            )

            context.drawImage(
                sprite,
                SPRITE_MAP.CONTENT_RIGHT.x,
                SPRITE_MAP.CONTENT_RIGHT.y,
                SPRITE_MAP.CONTENT_RIGHT.width,
                SPRITE_MAP.CONTENT_RIGHT.height,
                panelWidth - SPRITE_MAP.CONTENT_RIGHT.width,
                CHARACTER_HEIGHT * i,
                SPRITE_MAP.CONTENT_RIGHT.width,
                CHARACTER_HEIGHT
            )
        }
        context.setTransform(1, 0, 0, 1, 0, 0)

        // render the bottom border
        for (
            let i = 0;
            i <= Math.round(panelWidth / SPRITE_MAP.CONTENT_BOTTOM.width);
            i++
        ) {
            context.drawImage(
                sprite,
                SPRITE_MAP.CONTENT_BOTTOM.x,
                SPRITE_MAP.CONTENT_BOTTOM.y,
                SPRITE_MAP.CONTENT_BOTTOM.width,
                SPRITE_MAP.CONTENT_BOTTOM.height,
                SPRITE_MAP.CONTENT_BOTTOM.width * i,
                panelHeight - SPRITE_MAP.CONTENT_BOTTOM.height,
                SPRITE_MAP.CONTENT_BOTTOM.width,
                SPRITE_MAP.CONTENT_BOTTOM.height
            )
        }
        context.drawImage(
            sprite,
            SPRITE_MAP.CONTENT_BOTTOM_LEFT.x,
            SPRITE_MAP.CONTENT_BOTTOM_LEFT.y,
            SPRITE_MAP.CONTENT_BOTTOM_LEFT.width,
            SPRITE_MAP.CONTENT_BOTTOM_LEFT.height,
            0,
            panelHeight - SPRITE_MAP.CONTENT_BOTTOM.height,
            SPRITE_MAP.CONTENT_BOTTOM_LEFT.width,
            SPRITE_MAP.CONTENT_BOTTOM_LEFT.height
        )
        context.drawImage(
            sprite,
            SPRITE_MAP.CONTENT_BOTTOM_RIGHT.x,
            SPRITE_MAP.CONTENT_BOTTOM_RIGHT.y,
            SPRITE_MAP.CONTENT_BOTTOM_RIGHT.width,
            SPRITE_MAP.CONTENT_BOTTOM_RIGHT.height,
            panelWidth - SPRITE_MAP.CONTENT_BOTTOM_RIGHT.width,
            panelHeight - SPRITE_MAP.CONTENT_BOTTOM.height,
            SPRITE_MAP.CONTENT_BOTTOM_RIGHT.width,
            SPRITE_MAP.CONTENT_BOTTOM_RIGHT.height
        )
    }, [sprite, context, minimumCharacterCount, panelWidth, panelHeight])

    return renderWhoPanel
}

export default useRenderWhoPanel
