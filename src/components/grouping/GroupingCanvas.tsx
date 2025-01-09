import React, { useEffect, useRef, useState } from "react"
import { Lfm } from "../../models/Lfm.ts"
import {
    LFM_HEIGHT,
    TOTAL_GROUPING_PANEL_BORDER_HEIGHT,
    GROUPING_PANEL_TOP_BORDER_HEIGHT,
    SORT_HEADER_HEIGHT,
    LFM_AREA_PADDING,
    GROUPING_SPRITE_MAP,
} from "../../constants/grouping.ts"
import useRenderLfms from "../../hooks/useRenderLfms.ts"
// @ts-ignore
import LfmSprite from "../../assets/png/lfm_sprite.png"
import { useGroupingContext } from "./GroupingContext.tsx"
import useRenderLfmPanel from "../../hooks/useRenderLfmPanel.ts"
import { shouldLfmRerender } from "../../utils/lfmUtils.ts"

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

    const previousLfms = useRef<Lfm[]>([])
    const previousFontSize = useRef<number>(fontSize)
    const previousPanelWidth = useRef<number>(panelWidth)

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
                    const shouldForceRender =
                        fontSize !== previousFontSize.current ||
                        panelWidth !== previousPanelWidth.current ||
                        lfms.length !== previousLfms.current.length

                    if (
                        panelWidth !== previousPanelWidth.current ||
                        lfms.length !== previousLfms.current.length
                    ) {
                        renderLfmPanelToCanvas(lfms.length)
                    }
                    context.translate(
                        GROUPING_SPRITE_MAP.CONTENT_LEFT.width +
                            LFM_AREA_PADDING.left,
                        GROUPING_PANEL_TOP_BORDER_HEIGHT +
                            SORT_HEADER_HEIGHT +
                            LFM_AREA_PADDING.top
                    )
                    let totalLfmsRendered = 0
                    lfms.forEach((lfm, index) => {
                        const shouldRenderLfm =
                            index >= previousLfms.current.length ||
                            shouldLfmRerender(previousLfms.current[index], lfm)
                        if (shouldForceRender || shouldRenderLfm) {
                            renderLfmToCanvas(lfm)
                            totalLfmsRendered += 1
                        }
                        context.translate(0, LFM_HEIGHT)
                    })
                    console.log(
                        `Rendered lfms for ${lfms.length > 0 ? lfms[0].server_name : ""}`,
                        totalLfmsRendered
                    )

                    // reset the context
                    context.setTransform(1, 0, 0, 1, 0, 0)

                    previousLfms.current = lfms
                    previousFontSize.current = fontSize
                    previousPanelWidth.current = panelWidth
                }
            }
        }
    }, [
        image,
        lfms,
        fontSize,
        panelWidth,
        renderLfmToCanvas,
        renderLfmPanelToCanvas,
    ])

    return (
        <canvas
            ref={canvasRef}
            id={serverName}
            width={panelWidth}
            height={
                LFM_HEIGHT * lfms.length +
                TOTAL_GROUPING_PANEL_BORDER_HEIGHT +
                SORT_HEADER_HEIGHT +
                LFM_AREA_PADDING.top +
                LFM_AREA_PADDING.bottom
            }
            style={{
                maxWidth: "100%",
            }}
        />
    )
}

export default GroupingCanvas
