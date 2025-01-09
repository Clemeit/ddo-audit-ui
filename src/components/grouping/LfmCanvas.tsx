import React, { useEffect, useMemo, useRef, useState } from "react"
import { Lfm } from "../../models/Lfm.ts"
import {
    LFM_HEIGHT,
    TOTAL_LFM_PANEL_BORDER_HEIGHT,
    LFM_PANEL_TOP_BORDER_HEIGHT,
    SORT_HEADER_HEIGHT,
    LFM_AREA_PADDING,
    LFM_SPRITE_MAP,
    MINIMUM_LFM_COUNT,
    LFM_PADDING,
    SORT_HEADERS,
} from "../../constants/lfmPanel.ts"
import useRenderLfm from "../../hooks/useRenderLfm.ts"
// @ts-ignore
import LfmSprite from "../../assets/png/lfm_sprite.png"
import { useLfmContext } from "../../contexts/LfmContext.tsx"
import useRenderLfmPanel from "../../hooks/useRenderLfmPanel.ts"
import {
    calculateCommonBoundingBoxes,
    shouldLfmRerender,
} from "../../utils/lfmUtils.ts"

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
    const { fontSize, panelWidth, sortBy, setSortBy } = useLfmContext()
    const commonBoundingBoxes = useMemo(
        () => calculateCommonBoundingBoxes(panelWidth),
        [panelWidth]
    )
    const sortHeaders = useMemo(
        () => SORT_HEADERS(commonBoundingBoxes),
        [commonBoundingBoxes]
    )

    const previousLfms = useRef<Lfm[]>([])
    const previousFontSize = useRef<number>(fontSize)
    const previousPanelWidth = useRef<number>(panelWidth)
    const previousSortBy = useRef(sortBy)

    useEffect(() => {
        const img = new Image()
        img.src = LfmSprite
        img.onload = () => {
            setImage(img)
        }
    }, [])

    const { renderLfmToCanvas } = useRenderLfm({
        lfmSprite: image,
        context: canvasRef?.current?.getContext("2d"),
        raidView: raidView,
    })
    const { renderLfmPanelToCanvas } = useRenderLfmPanel({
        lfmSprite: image,
        context: canvasRef?.current?.getContext("2d"),
        raidView: raidView,
    })

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (raidView) return
        // get x and y coordinates of the click
        const canvas = canvasRef.current
        if (canvas) {
            const rect = canvas.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top

            sortHeaders.forEach(({ type, boundingBox }) => {
                if (
                    x >= boundingBox.x &&
                    x <= boundingBox.x + boundingBox.width &&
                    y >= boundingBox.y + LFM_PANEL_TOP_BORDER_HEIGHT &&
                    y <=
                        boundingBox.y +
                            LFM_SPRITE_MAP.SORT_HEADER.CENTER.height +
                            LFM_PANEL_TOP_BORDER_HEIGHT +
                            LFM_AREA_PADDING.top
                ) {
                    setSortBy({
                        type: type,
                        direction:
                            sortBy.type === type && sortBy.direction === "asc"
                                ? "desc"
                                : "asc",
                    })
                }
            })
        }
    }

    useEffect(() => {
        if (image) {
            const canvasElement = canvasRef.current
            if (canvasElement) {
                const context = canvasElement.getContext("2d")
                if (context) {
                    const shouldForceRender =
                        fontSize !== previousFontSize.current ||
                        panelWidth !== previousPanelWidth.current ||
                        lfms.length !== previousLfms.current.length ||
                        sortBy !== previousSortBy.current

                    if (shouldForceRender) {
                        renderLfmPanelToCanvas(lfms.length)
                    }
                    context.translate(
                        LFM_SPRITE_MAP.CONTENT_LEFT.width +
                            LFM_AREA_PADDING.left,
                        raidView
                            ? 0
                            : LFM_PANEL_TOP_BORDER_HEIGHT +
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
                    previousSortBy.current = sortBy
                }
            }
        }
    }, [
        image,
        lfms,
        raidView,
        fontSize,
        panelWidth,
        sortHeaders,
        sortBy,
        renderLfmToCanvas,
        renderLfmPanelToCanvas,
    ])

    return (
        <canvas
            ref={canvasRef}
            id={serverName}
            width={panelWidth}
            height={
                raidView
                    ? LFM_HEIGHT * lfms.length
                    : LFM_HEIGHT * Math.max(MINIMUM_LFM_COUNT, lfms.length) +
                      TOTAL_LFM_PANEL_BORDER_HEIGHT +
                      SORT_HEADER_HEIGHT +
                      LFM_AREA_PADDING.top +
                      LFM_AREA_PADDING.bottom
            }
            style={{
                maxWidth: "100%",
            }}
            onClick={handleCanvasClick}
        />
    )
}

export default GroupingCanvas
