import { useCallback } from "react"
import { useLfmContext } from "../contexts/LfmContext.tsx"
import { Lfm } from "../models/Lfm.ts"

interface Props {
    lfmSprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
}

export enum RenderType {
    LFM,
    QUEST,
}

const useRenderLfmOverlay = ({ lfmSprite, context }: Props) => {
    const {
        panelWidth,
        panelHeight,
        // fontSize,
        // showRaidTimerIndicator,
        // showMemberCount,
    } = useLfmContext()

    const renderLfmOverlay = useCallback(
        (lfm: Lfm, renderType: RenderType) => {
            if (!context || !lfmSprite) return

            if (renderType === RenderType.LFM) {
                // Render LFM
                context.clearRect(0, 0, panelWidth, panelHeight)
                context.fillStyle = "red"
                context.fillRect(0, 0, 300, 200)
                context.fillStyle = "black"
                context.font = "20px Arial"
                context.fillText(lfm.leader?.name || "", 10, 50)
            } else {
                // Render Quest
                context.clearRect(0, 0, panelWidth, panelHeight)
                context.fillStyle = "red"
                context.fillRect(0, 0, 300, 200)
                context.fillStyle = "black"
                context.font = "20px Arial"
                context.fillText(lfm.quest?.name || "", 10, 50)
            }
        },
        [context, lfmSprite]
    )

    const clearOverlay = useCallback(() => {
        if (!context) return
        context.clearRect(0, 0, panelWidth, panelHeight)
    }, [context, panelWidth, panelHeight])

    return { renderLfmOverlay, clearOverlay }
}

export default useRenderLfmOverlay
