import React, { useEffect, useRef, useState } from "react"
import { Lfm } from "../../models/Lfm.ts"
import { LFM_HEIGHT } from "../../constants/grouping.ts"
import useRenderLfms from "../../hooks/useRenderLfms.ts"
// @ts-ignore
import LfmSprite from "../../assets/png/lfm_sprite.png"
import { useGroupingContext } from "./GroupingContext.tsx"

interface GroupingCanvasProps {
    serverName?: string
    lfms?: Lfm[]
    raidView?: boolean
}

const GroupingCanvas = ({
    serverName = "",
    lfms = [],
    raidView = false,
}: GroupingCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const { fontSize, panelWidth } = useGroupingContext()

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
                        renderLfmToCanvas(lfm, fontSize)
                        context.translate(0, LFM_HEIGHT)
                    })

                    // reset the context
                    context.setTransform(1, 0, 0, 1, 0, 0)
                }
            }
        }
    }, [image, lfms, raidView, renderLfmToCanvas, fontSize, panelWidth])

    return (
        <canvas
            ref={canvasRef}
            id={serverName}
            width={panelWidth}
            height={LFM_HEIGHT * lfms.length}
            style={{
                maxWidth: "100%",
            }}
        />
    )
}

export default GroupingCanvas
