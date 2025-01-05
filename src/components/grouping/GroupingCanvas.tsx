import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Lfm } from "../../models/Lfm.ts"
import { LFM_HEIGHT, LFM_WIDTH } from "../../constants/lfm.ts"
import useRenderLfms from "../../hooks/useRenderLfms.ts"
import LfmSprite from "../../assets/png/lfm_sprite.png"

const GroupingCanvas = (
    {
        serverName,
        lfms,
        raidView,
    }: { serverName: string; lfms: Lfm[]; raidView: boolean } = {
        serverName: "",
        lfms: [],
        raidView: false,
    }
) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [image, setImage] = useState<HTMLImageElement | null>(null)

    useEffect(() => {
        const img = new Image()
        img.src = LfmSprite
        img.onload = () => {
            setImage(img)
        }
    }, [])

    const { renderLfmToCanvas } = useRenderLfms({
        lfmSprite: image,
        context: canvasRef?.current?.getContext("2d"),
    })

    useEffect(() => {
        if (image) {
            const canvasElement = canvasRef.current
            if (canvasElement) {
                const context = canvasElement.getContext("2d")
                if (context) {
                    context.clearRect(
                        0,
                        0,
                        canvasElement.width,
                        canvasElement.height
                    )

                    lfms.forEach((lfm) => {
                        renderLfmToCanvas(lfm)
                        context.translate(0, LFM_HEIGHT)
                    })
                }
            }
        }
    }, [image, lfms, raidView, renderLfmToCanvas])

    return (
        <canvas
            ref={canvasRef}
            id={serverName}
            width={LFM_WIDTH}
            height={LFM_HEIGHT * lfms.length}
            style={
                {
                    // width: "100%",
                }
            }
        />
    )
}

export default GroupingCanvas
