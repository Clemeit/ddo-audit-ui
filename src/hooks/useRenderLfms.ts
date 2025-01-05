import { useCallback } from "react"
import { Lfm } from "../models/Lfm"
import { LFM_WIDTH, LFM_HEIGHT, LFM_SPRITE_MAP } from "../constants/lfm.ts"

interface UseRenderLfmsProps {
    lfmSprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
}

const useRenderLfms = ({ lfmSprite, context }: UseRenderLfmsProps) => {
    const renderLfmToCanvas = useCallback(
        (lfm: Lfm) => {
            if (!context || !lfmSprite) return

            // TODO: remove this:
            // context.clearRect(0, 0, LFM_WIDTH, LFM_HEIGHT)
            // context.beginPath()
            // context.moveTo(0, 0)
            // context.lineTo(LFM_WIDTH, LFM_HEIGHT)
            // context.stroke()
            // context.strokeStyle = "black"
            // context.strokeRect(1, 1, LFM_WIDTH - 2, LFM_HEIGHT - 2)
            // context.strokeStyle = "red"
            // context.strokeRect(10, 10, 50, 50)
            context.fillStyle = "white"
            context.font = "20px Arial"
            context.textBaseline = "middle"
            context.textAlign = "center"
            context.fillText(lfm.quest?.name, LFM_WIDTH / 2, LFM_HEIGHT / 2)
            // =======

            // left
            context.drawImage(
                lfmSprite,
                LFM_SPRITE_MAP.CONTENT_LEFT[0],
                LFM_SPRITE_MAP.CONTENT_LEFT[1],
                LFM_SPRITE_MAP.CONTENT_LEFT[2],
                LFM_SPRITE_MAP.CONTENT_LEFT[3],
                0,
                0,
                LFM_SPRITE_MAP.CONTENT_LEFT[2],
                LFM_HEIGHT
            )

            // right
            context.drawImage(
                lfmSprite,
                LFM_SPRITE_MAP.CONTENT_RIGHT[0],
                LFM_SPRITE_MAP.CONTENT_RIGHT[1],
                LFM_SPRITE_MAP.CONTENT_RIGHT[2],
                LFM_SPRITE_MAP.CONTENT_RIGHT[3],
                LFM_WIDTH - LFM_SPRITE_MAP.CONTENT_RIGHT[2],
                0,
                LFM_SPRITE_MAP.CONTENT_RIGHT[2],
                LFM_HEIGHT
            )
        },
        [lfmSprite, context]
    )

    return { renderLfmToCanvas }
}

export default useRenderLfms
