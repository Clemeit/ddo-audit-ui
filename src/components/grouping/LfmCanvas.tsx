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
    SORT_HEADERS,
    MINIMUM_LFM_PANEL_WIDTH,
    LFM_TOP_PADDING,
    LFM_LEFT_PADDING,
    FONTS,
    LFM_COLORS,
} from "../../constants/lfmPanel.ts"
import useRenderLfm from "../../hooks/useRenderLfm.ts"
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '../../assets/png/lfm_sprite.png'.
import LfmSprite from "../../assets/png/lfm_sprite.png"
import { useLfmContext } from "../../contexts/LfmContext.tsx"
import useRenderLfmPanel from "../../hooks/useRenderLfmPanel.ts"
import {
    calculateCommonBoundingBoxes,
    shouldLfmRerender,
} from "../../utils/lfmUtils.ts"
import { debounce } from "../../utils/functionUtils.ts"
import useRenderLfmOverlay, {
    RenderType,
} from "../../hooks/useRenderLfmOverlay.ts"

interface GroupingCanvasProps {
    serverName?: string
    lfms?: Lfm[]
    raidView?: boolean
    excludedLfmCount?: number
}

interface SelectedLfmInfo {
    lfm: Lfm
    index: number
    renderType: RenderType
    position: { x: number; y: number }
}

const LfmCanvas = ({
    serverName = "",
    lfms = [],
    raidView = false,
    excludedLfmCount = 0,
}: GroupingCanvasProps) => {
    const mainCanvasRef = useRef<HTMLCanvasElement>(null)
    const lfmCanvasRef = useRef<HTMLCanvasElement>(
        document.createElement("canvas")
    )
    const overlayCanvasRef = useRef<HTMLCanvasElement>(
        document.createElement("canvas")
    )
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const {
        fontSize,
        panelWidth,
        setPanelWidth,
        setPanelHeight,
        sortBy,
        setSortBy,
        isDynamicWidth,
        mouseOverDelay,
    } = useLfmContext()
    const commonBoundingBoxes = useMemo(
        () => calculateCommonBoundingBoxes(panelWidth),
        [panelWidth]
    )
    const sortHeaders = useMemo(
        () => SORT_HEADERS(commonBoundingBoxes),
        [commonBoundingBoxes]
    )
    const fonts = useMemo(() => FONTS(fontSize), [fontSize])
    const panelHeight = useMemo(() => {
        const height = raidView
            ? LFM_HEIGHT * lfms.length
            : LFM_HEIGHT * Math.max(MINIMUM_LFM_COUNT, lfms.length) +
              TOTAL_LFM_PANEL_BORDER_HEIGHT +
              SORT_HEADER_HEIGHT +
              LFM_AREA_PADDING.top +
              LFM_AREA_PADDING.bottom
        setPanelHeight(height)
        return height
    }, [lfms, raidView])
    const [selectedLfmInfo, setSelectedLfmInfo] =
        useState<SelectedLfmInfo | null>(null)

    useEffect(() => {
        // update the sizes of the lfm and overlay canvases
        lfmCanvasRef.current.width = panelWidth
        lfmCanvasRef.current.height = panelHeight
        overlayCanvasRef.current.width = panelWidth
        overlayCanvasRef.current.height = panelHeight
    }, [panelWidth, panelHeight])

    // TODO: this is disgusting and shouldn't be used in prod
    const previousLfms = useRef<Lfm[]>([])
    const previousServerName = useRef<string>("")
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

    const { renderLfm } = useRenderLfm({
        lfmSprite: image,
        context: lfmCanvasRef?.current?.getContext("2d"),
    })
    const { renderLfmPanelToCanvas } = useRenderLfmPanel({
        lfmSprite: image,
        context: lfmCanvasRef?.current?.getContext("2d"),
        raidView: raidView,
    })
    const { renderLfmOverlay, clearOverlay } = useRenderLfmOverlay({
        lfmSprite: image,
        context: overlayCanvasRef?.current?.getContext("2d"),
    })

    const mouseMoveTimeout = useRef<number | null>(null)
    const handleCanvasMouseMove = (
        event: React.MouseEvent<HTMLCanvasElement>
    ) => {
        if (mouseMoveTimeout.current) {
            clearTimeout(mouseMoveTimeout.current)
        }
        mouseMoveTimeout.current = window.setTimeout(() => {
            handleCanvasClick(event, true)
        }, mouseOverDelay)
    }

    const handleCanvasMouseLeave = () => {
        if (mouseMoveTimeout.current) {
            clearTimeout(mouseMoveTimeout.current)
        }
        clearOverlay()
        setSelectedLfmInfo(null)
    }

    const handleCanvasClick = (
        event: React.MouseEvent<HTMLCanvasElement>,
        isHover: boolean = false
    ) => {
        if (raidView) return
        // get x and y coordinates of the click
        const canvas = mainCanvasRef.current
        if (canvas) {
            const rect = canvas.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top

            const scalingFactor = panelWidth / rect.width
            const scaledX = x * scalingFactor
            const scaledY = y * scalingFactor

            // clicked a header
            if (!isHover) {
                sortHeaders.forEach(({ type, boundingBox }) => {
                    if (
                        scaledX >= boundingBox.x &&
                        scaledX <= boundingBox.x + boundingBox.width &&
                        scaledY >=
                            boundingBox.y + LFM_PANEL_TOP_BORDER_HEIGHT &&
                        scaledY <=
                            boundingBox.y +
                                LFM_SPRITE_MAP.SORT_HEADER.CENTER.height +
                                LFM_PANEL_TOP_BORDER_HEIGHT +
                                LFM_AREA_PADDING.top
                    ) {
                        setSortBy({
                            type: type,
                            direction:
                                sortBy.type === type &&
                                sortBy.direction === "asc"
                                    ? "desc"
                                    : "asc",
                        })
                    }
                })
            }

            // clicked an lfm
            const lfmIndex = Math.floor(
                (scaledY - LFM_TOP_PADDING) / LFM_HEIGHT
            )
            if (
                scaledY >= LFM_TOP_PADDING &&
                lfmIndex < lfms.length &&
                scaledX >=
                    LFM_LEFT_PADDING +
                        commonBoundingBoxes.mainPanelBoundingBox.x &&
                scaledX <=
                    LFM_LEFT_PADDING +
                        commonBoundingBoxes.questPanelBoundingBox.right()
            ) {
                let renderType: RenderType
                if (
                    scaledX - LFM_LEFT_PADDING <=
                    commonBoundingBoxes.mainPanelBoundingBox.right()
                ) {
                    renderType = RenderType.LFM
                } else {
                    renderType = RenderType.QUEST
                }
                if (
                    selectedLfmInfo?.index !== lfmIndex ||
                    selectedLfmInfo?.renderType !== renderType
                ) {
                    clearOverlay()
                    if (
                        renderType === RenderType.QUEST &&
                        lfms[lfmIndex].quest == null
                    ) {
                        setSelectedLfmInfo(null)
                    } else {
                        setSelectedLfmInfo({
                            lfm: lfms[lfmIndex],
                            index: lfmIndex,
                            renderType: renderType,
                            position: { x: scaledX, y: scaledY },
                        })
                    }
                }
            } else {
                clearOverlay()
                setSelectedLfmInfo(null)
            }
        }
    }

    useEffect(() => {
        const handleCanvasResize = debounce(() => {
            if (!isDynamicWidth) return
            const canvas = mainCanvasRef.current
            if (canvas) {
                const width = canvas.getBoundingClientRect().width
                setPanelWidth(Math.max(width, MINIMUM_LFM_PANEL_WIDTH))
            }
        }, 20)

        window.addEventListener("resize", handleCanvasResize)
        handleCanvasResize()
        return () => {
            window.removeEventListener("resize", handleCanvasResize)
        }
    }, [isDynamicWidth, setPanelWidth])

    useEffect(() => {
        if (!image) return
        const mainContext = mainCanvasRef.current?.getContext("2d")
        const lfmPanelContext = lfmCanvasRef.current?.getContext("2d")
        const overlayContext = overlayCanvasRef.current?.getContext("2d")
        if (!mainContext || !lfmPanelContext || !overlayContext) return

        const shouldForceRender =
            fontSize !== previousFontSize.current ||
            panelWidth !== previousPanelWidth.current ||
            lfms.length !== previousLfms.current.length ||
            sortBy !== previousSortBy.current ||
            serverName !== previousServerName.current

        // draw the lfm panel
        if (shouldForceRender) {
            renderLfmPanelToCanvas(lfms.length)
        }

        // draw the lfms
        lfmPanelContext.translate(
            LFM_LEFT_PADDING,
            raidView ? 0 : LFM_TOP_PADDING
        )
        // let totalLfmsRendered = 0
        lfms.forEach((lfm, index) => {
            const shouldRenderLfm =
                index >= previousLfms.current.length ||
                shouldLfmRerender(previousLfms.current[index], lfm)
            if (shouldForceRender || shouldRenderLfm) {
                renderLfm(lfm)
                // totalLfmsRendered += 1
            }
            lfmPanelContext.translate(0, LFM_HEIGHT)
        })

        // draw the overlay
        let totalOverlayWidth = 0
        let totalOverlayHeight = 0
        if (selectedLfmInfo !== null) {
            overlayContext.setTransform(1, 0, 0, 1, 0, 0)
            const { width: overlayWidth, height: overlayHeight } =
                renderLfmOverlay(
                    selectedLfmInfo.lfm,
                    selectedLfmInfo.renderType
                )
            totalOverlayWidth = overlayWidth
            totalOverlayHeight = overlayHeight
        }

        // show message if all lfms are excluded
        if (lfms.length === 0 && excludedLfmCount > 0) {
            lfmPanelContext.fillStyle = LFM_COLORS.BLACK_BACKGROUND
            lfmPanelContext.fillRect(
                0,
                LFM_PANEL_TOP_BORDER_HEIGHT,
                commonBoundingBoxes.lfmBoundingBox.width,
                LFM_HEIGHT
            )

            lfmPanelContext.font = fonts.GROUPS_HIDDEN_MESSAGE
            lfmPanelContext.fillStyle = LFM_COLORS.LEADER_NAME
            lfmPanelContext.textAlign = "center"
            lfmPanelContext.fillText(
                `${excludedLfmCount} groups have been hidden by your filter settings`,
                panelWidth / 2,
                LFM_HEIGHT
            )
        }

        lfmPanelContext.setTransform(1, 0, 0, 1, 0, 0)

        // Draw the lfm canvas and overlay canvas to the main canvas
        const lfmCanvas = lfmCanvasRef.current
        const overlayCanvas = overlayCanvasRef.current
        if (lfmCanvas) mainContext.drawImage(lfmCanvas, 0, 0)
        if (overlayCanvas && selectedLfmInfo !== null) {
            const overlayXPosition = Math.max(
                0,
                Math.min(
                    selectedLfmInfo.position.x,
                    panelWidth - totalOverlayWidth
                )
            )
            const overlayYPosition = Math.max(
                0,
                Math.min(
                    selectedLfmInfo.position.y,
                    panelHeight - totalOverlayHeight
                )
            )
            mainContext.drawImage(
                overlayCanvas,
                Math.round(overlayXPosition),
                Math.round(overlayYPosition)
            )
        }

        previousLfms.current = lfms
        previousFontSize.current = fontSize
        previousPanelWidth.current = panelWidth
        previousSortBy.current = sortBy
        previousServerName.current = serverName
    }, [
        image,
        lfms,
        excludedLfmCount,
        raidView,
        fontSize,
        panelWidth,
        sortHeaders,
        sortBy,
        isDynamicWidth,
        commonBoundingBoxes,
        fonts,
        previousServerName,
        serverName,
        selectedLfmInfo,
        renderLfm,
        renderLfmPanelToCanvas,
        renderLfmOverlay,
    ])

    return (
        <canvas
            ref={mainCanvasRef}
            id={serverName}
            width={panelWidth}
            height={panelHeight}
            style={{
                maxWidth: "100%",
                width: isDynamicWidth ? "100%" : "unset",
            }}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
        />
    )
}

export default LfmCanvas
