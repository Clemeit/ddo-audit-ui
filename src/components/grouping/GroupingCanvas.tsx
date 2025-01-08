import React, { useEffect, useRef, useState } from "react"
import { Lfm } from "../../models/Lfm.ts"
import {
    LFM_HEIGHT,
    GROUPING_SPRITE_MAP,
    TOTAL_GROUPING_PANEL_BORDER_HEIGHT,
} from "../../constants/grouping.ts"
import useRenderLfms from "../../hooks/useRenderLfms.ts"
// @ts-ignore
import LfmSprite from "../../assets/png/lfm_sprite.png"
import { useGroupingContext } from "./GroupingContext.tsx"
import useRenderLfmPanel from "../../hooks/useRenderLfmPanel.ts"

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
    const { renderLfmPanelToCanvas } = useRenderLfmPanel({
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

                    renderLfmPanelToCanvas(1)
                    context.translate(
                        0,
                        GROUPING_SPRITE_MAP.HEADER_BAR.height +
                            GROUPING_SPRITE_MAP.CONTENT_TOP.height
                    )
                    lfms.forEach((lfm) => {
                        renderLfmToCanvas(lfm)
                        context.translate(0, LFM_HEIGHT)
                    })

                    // reset the context
                    context.setTransform(1, 0, 0, 1, 0, 0)
                }
            }
        }
    }, [image, lfms, renderLfmToCanvas, renderLfmPanelToCanvas])

    return (
        <canvas
            ref={canvasRef}
            id={serverName}
            width={panelWidth}
            height={
                LFM_HEIGHT * lfms.length + TOTAL_GROUPING_PANEL_BORDER_HEIGHT
            }
            style={{
                maxWidth: "100%",
            }}
        />
    )
}

export default GroupingCanvas
