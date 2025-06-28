import React, { useEffect, useMemo, useRef, useState } from "react"
import { Lfm } from "../../models/Lfm.ts"
import useRenderLfm from "../../hooks/useRenderLfm.ts"
import useRenderLfmPanel from "../../hooks/useRenderLfmPanel.ts"
import useRenderLfmOverlay, {
    RenderType,
} from "../../hooks/useRenderLfmOverlay.ts"
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '../../assets/png/lfm_sprite.png'.
import LfmSprite from "../../assets/png/lfm_sprite_2.png"
import { useLfmContext } from "../../contexts/LfmContext.tsx"
import {
    areLfmArraysEqual,
    areLfmOverlaysEquivalent,
    areLfmsEquivalent,
    calculateCommonBoundingBoxes,
} from "../../utils/lfmUtils.ts"
import {
    FONTS,
    LFM_AREA_PADDING,
    LFM_COLORS,
    LFM_HEIGHT,
    LFM_LEFT_PADDING,
    LFM_PANEL_TOP_BORDER_HEIGHT,
    LFM_TOP_PADDING,
    MINIMUM_LFM_COUNT,
    SORT_HEADER_HEIGHT,
    SORT_HEADERS,
    TOTAL_LFM_PANEL_BORDER_HEIGHT,
} from "../../constants/lfmPanel.ts"
import { SPRITE_MAP } from "../../constants/spriteMap.ts"

interface Props {
    serverName: string
    lfms: Lfm[]
    raidView: boolean
    excludedLfmCount?: number
}

interface SelectedLfmInfo {
    index: number
    renderType: RenderType
    position: { x: number; y: number }
}

const LfmCanvas: React.FC<Props> = ({
    serverName,
    lfms,
    raidView,
    excludedLfmCount = 0,
}) => {
    const {
        panelWidth,
        setPanelHeight,
        sortBy,
        setSortBy,
        isDynamicWidth,
        mouseOverDelay,
        showRaidTimerIndicator,
        showMemberCount,
        showQuestGuesses,
        showQuestTips,
        showCharacterGuildNames,
        showLfmPostedTime,
        fontSize,
    } = useLfmContext()
    const commonBoundingBoxes = useMemo(
        () => calculateCommonBoundingBoxes(panelWidth),
        [panelWidth]
    )
    const sortHeaders = useMemo(
        () => SORT_HEADERS(commonBoundingBoxes),
        [commonBoundingBoxes]
    )
    // const fonts = useMemo(() => FONTS(fontSize), [fontSize])
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
    const [isFirstRender, setIsFirstRender] = useState(true)
    const [selectedLfmInfo, setSelectedLfmInfo] =
        useState<SelectedLfmInfo | null>(null)
    const [previousState, setPreviousState] = React.useState({
        lfms,
        raidView,
        excludedLfmCount,
        panelWidth,
        panelHeight,
        selectedLfmInfo,
        sortBy,
        overlayWidth: 0,
        overlayHeight: 0,
        showRaidTimerIndicator,
        showMemberCount,
        showQuestGuesses,
        showQuestTips,
        showCharacterGuildNames,
        showLfmPostedTime,
        fontSize,
    })
    const fonts = useMemo(() => FONTS(), [])

    // Separate canvases for the lfms and overlay
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const mainCanvasRef = useRef<HTMLCanvasElement>(null)
    const lfmPanelCanvasRef = useRef<HTMLCanvasElement>(
        document.createElement("canvas")
    )
    const lfmCanvasRef = useRef<HTMLCanvasElement>(
        document.createElement("canvas")
    )
    const overlayCanvasRef = useRef<HTMLCanvasElement>(
        document.createElement("canvas")
    )

    // Hooks to do the rendering
    const { renderLfm } = useRenderLfm({
        lfmSprite: image,
        context: lfmCanvasRef.current?.getContext("2d"),
    })
    const { renderLfmPanelToCanvas } = useRenderLfmPanel({
        sprite: image,
        context: lfmPanelCanvasRef?.current?.getContext("2d"),
        raidView: raidView,
    })
    const { renderLfmOverlay, clearOverlay } = useRenderLfmOverlay({
        lfmSprite: image,
        context: overlayCanvasRef?.current?.getContext("2d"),
    })

    // Load the lfm sprite
    useEffect(() => {
        const img = new Image()
        img.src = LfmSprite
        img.onload = () => {
            setImage(img)
        }
    }, [])

    // Set the canvases to the correct size
    useEffect(() => {
        lfmPanelCanvasRef.current.width = panelWidth
        lfmPanelCanvasRef.current.height = panelHeight
        lfmCanvasRef.current.width = panelWidth
        lfmCanvasRef.current.height = panelHeight
        overlayCanvasRef.current.width = panelWidth
        overlayCanvasRef.current.height = panelHeight
    }, [panelWidth, panelHeight])

    // calculate the scale of the canvas
    const [canvasScaleWidth, setCanvasScaleWidth] = useState(1)
    const [canvasScaleHeight, setCanvasScaleHeight] = useState(1)
    useEffect(() => {
        const handleResize = () => {
            if (mainCanvasRef.current) {
                const rect = mainCanvasRef.current.getBoundingClientRect()
                setCanvasScaleWidth(mainCanvasRef.current.width / rect.width)
                setCanvasScaleHeight(mainCanvasRef.current.height / rect.height)
                // console.log(
                //     `canvasScaleWidth: ${canvasScaleWidth}, canvasScaleHeight: ${canvasScaleHeight}`
                // )
            }
        }

        const resizeObserver = new ResizeObserver(handleResize)
        if (mainCanvasRef.current) {
            resizeObserver.observe(mainCanvasRef.current)
        }

        handleResize()
        return () => {
            resizeObserver.disconnect()
        }
    }, [mainCanvasRef.current])

    // Handle mouse events
    const handleCanvasClick = (
        e: React.MouseEvent<HTMLCanvasElement>,
        isHover = false
    ) => {
        if (raidView) return
        const rect = mainCanvasRef.current?.getBoundingClientRect()
        if (!rect) return
        if (!mainCanvasRef.current) return

        const x = (e.clientX - rect.left) * canvasScaleWidth
        const y = (e.clientY - rect.top) * canvasScaleHeight

        if (isHover === false) {
            // check if the mouse is over a sort header
            const sortHeaderIndex = sortHeaders.findIndex((header) => {
                return (
                    x > header.boundingBox.left() &&
                    x < header.boundingBox.right() &&
                    y > LFM_PANEL_TOP_BORDER_HEIGHT + LFM_AREA_PADDING.top &&
                    y <
                        LFM_PANEL_TOP_BORDER_HEIGHT +
                            LFM_AREA_PADDING.top +
                            SPRITE_MAP.SORT_HEADER.CENTER.height
                )
            })
            if (sortHeaderIndex > -1) {
                const previousDirection = sortBy.ascending
                const previousType = sortBy.type
                let newAscending = true
                const newType = sortHeaders[sortHeaderIndex].type
                if (previousType === sortHeaders[sortHeaderIndex].type) {
                    newAscending = !previousDirection
                }
                setSortBy({ type: newType, ascending: newAscending })

                return
            }
        }

        // Check if the mouse is over an lfm
        const lfmIndex = Math.floor(
            (y - (raidView ? 0 : LFM_TOP_PADDING)) / LFM_HEIGHT
        )
        if (
            x > LFM_LEFT_PADDING &&
            x <
                LFM_LEFT_PADDING +
                    commonBoundingBoxes.questPanelBoundingBox.right() &&
            lfmIndex >= 0 &&
            lfmIndex < lfms.length
        ) {
            const renderType =
                x <
                commonBoundingBoxes.mainPanelBoundingBox.right() +
                    LFM_LEFT_PADDING
                    ? RenderType.LFM
                    : RenderType.QUEST
            if (renderType === RenderType.QUEST && !lfms[lfmIndex].quest_id) {
                setSelectedLfmInfo(null)
                clearOverlay()
                return
            }
            if (
                lfmIndex !== previousState.selectedLfmInfo?.index ||
                renderType !== previousState.selectedLfmInfo?.renderType
            ) {
                setSelectedLfmInfo({
                    index: lfmIndex,
                    renderType: renderType,
                    position: { x, y },
                })
            }
        } else {
            setSelectedLfmInfo(null)
        }
    }
    const handleCanvasMouseLeave = () => {
        if (raidView) return
        setSelectedLfmInfo(null)
        if (mouseMoveTimeout.current) {
            clearTimeout(mouseMoveTimeout.current)
        }
    }
    const mouseMoveTimeout = useRef<number | null>(null)
    const handleCanvasMouseMove = (
        event: React.MouseEvent<HTMLCanvasElement>
    ) => {
        if (raidView) return
        if (mouseMoveTimeout.current) {
            clearTimeout(mouseMoveTimeout.current)
        }
        mouseMoveTimeout.current = window.setTimeout(() => {
            handleCanvasClick(event, true)
        }, mouseOverDelay)
    }

    React.useEffect(() => {
        // Where the main logic will happen

        // Don't try to render unless the sprite map is loaded
        if (!image) return

        // Check if global render is needed. This happens when the panel size changes.
        const globalRenderNeeded =
            isFirstRender ||
            panelWidth !== previousState.panelWidth ||
            panelHeight !== previousState.panelHeight

        const shouldRenderPanel =
            raidView !== previousState.raidView ||
            sortBy !== previousState.sortBy

        const shouldRenderAllLfms =
            lfms.length !== previousState.lfms.length ||
            previousState.showRaidTimerIndicator !== showRaidTimerIndicator ||
            previousState.showMemberCount !== showMemberCount ||
            previousState.showQuestGuesses !== showQuestGuesses ||
            previousState.showQuestTips !== showQuestTips ||
            previousState.showCharacterGuildNames !== showCharacterGuildNames ||
            previousState.showLfmPostedTime !== showLfmPostedTime ||
            previousState.fontSize !== fontSize

        const shouldRenderFilterMessage =
            excludedLfmCount !== previousState.excludedLfmCount

        const shouldRenderOverlay =
            selectedLfmInfo !== previousState.selectedLfmInfo ||
            (selectedLfmInfo &&
                !areLfmOverlaysEquivalent(
                    previousState.lfms[selectedLfmInfo.index],
                    lfms[selectedLfmInfo.index]
                ))

        // Don't render if there are no lfm changes
        const hasLfmChanges = !areLfmArraysEqual(
            lfms,
            previousState.lfms,
            areLfmsEquivalent
        )

        if (
            !globalRenderNeeded &&
            !hasLfmChanges &&
            !shouldRenderOverlay &&
            !shouldRenderPanel &&
            !shouldRenderFilterMessage &&
            !shouldRenderAllLfms
        ) {
            // console.log("Skipping render.")
            return
        }

        const lfmContext = lfmCanvasRef.current?.getContext("2d")

        let wasPanelRendered = false
        let wasLfmRendered = false
        let numberOfLfmsRendered = 0
        let wasOverlayRendered = false
        let wasFilterMessageRendered = false

        // Render the panel
        if (globalRenderNeeded || shouldRenderPanel || shouldRenderOverlay) {
            renderLfmPanelToCanvas(panelHeight)
            wasPanelRendered = true
        }

        if (globalRenderNeeded || shouldRenderAllLfms) {
            // console.log("Rendering all LFMs")
            lfmContext?.clearRect(0, 0, panelWidth, panelHeight)
        }
        lfmContext?.translate(
            Math.floor(LFM_LEFT_PADDING),
            raidView ? 0 : Math.floor(LFM_TOP_PADDING)
        )
        // Loop through the lfms, and render the ones that changed
        lfms.forEach((lfm, index) => {
            // If the lfm has changed, or if the lfm hasn't been rendered in the last 60 seconds, then render it
            if (
                globalRenderNeeded ||
                shouldRenderAllLfms ||
                !areLfmsEquivalent(lfm, previousState.lfms[index]) ||
                lfm.last_render_time === null ||
                Date.now() - lfm.last_render_time > 60000
            ) {
                // Render the lfm
                renderLfm(lfm)
                lfm.last_render_time = Date.now()
                wasLfmRendered = true
                numberOfLfmsRendered++
            }
            lfmContext?.translate(0, Math.floor(LFM_HEIGHT))
        })
        lfmContext?.resetTransform()

        // Render the overlay
        let overlayWidth = 0 // todo these are being set to 0 when overlay rerenders
        let overlayHeight = 0
        if (globalRenderNeeded || shouldRenderOverlay) {
            if (selectedLfmInfo) {
                const { index, renderType } = selectedLfmInfo
                if (index < lfms.length) {
                    const { width, height } = renderLfmOverlay(
                        lfms[index],
                        renderType
                    )
                    overlayWidth = width
                    overlayHeight = height
                    wasOverlayRendered = true
                }
            } else {
                clearOverlay()
                wasOverlayRendered = true
            }
        }

        // If all lfms have been filtered out, render a message
        if (
            shouldRenderFilterMessage &&
            lfms.length === 0 &&
            excludedLfmCount > 0
        ) {
            const context = lfmCanvasRef.current?.getContext("2d")
            if (context) {
                context.clearRect(0, 0, panelWidth, panelHeight)
                context.fillStyle = LFM_COLORS.SECONDARY_TEXT
                context.font = fonts.GROUPS_HIDDEN_MESSAGE
                context.textAlign = "center"
                context.fillText(
                    `${excludedLfmCount} ${excludedLfmCount !== 1 ? "groups were" : "group was"} hidden by your filter settings`,
                    panelWidth / 2,
                    150
                )
                wasFilterMessageRendered = true
            }
        }

        // Draw the lfm and overlay canvases to the main canvas
        if (
            wasPanelRendered ||
            wasLfmRendered ||
            wasOverlayRendered ||
            wasFilterMessageRendered
        ) {
            const mainContext = mainCanvasRef.current?.getContext("2d")
            if (mainContext) {
                // mainContext.clearRect(0, 0, panelWidth, panelHeight)
                mainContext.imageSmoothingEnabled = false
                // if (wasPanelRendered) {
                mainContext.drawImage(lfmPanelCanvasRef.current, 0, 0)
                // }
                // if (wasPanelRendered || wasLfmRendered) {
                mainContext.drawImage(lfmCanvasRef.current, 0, 0)
                // }
                // if (
                //     (wasPanelRendered ||
                //         wasLfmRendered ||
                //         wasOverlayRendered) &&
                //     selectedLfmInfo
                // ) {
                if (selectedLfmInfo) {
                    const { position } = selectedLfmInfo
                    const positionX = Math.max(
                        Math.min(
                            position.x,
                            panelWidth -
                                (overlayWidth !== 0
                                    ? overlayWidth
                                    : previousState.overlayWidth)
                        ),
                        0
                    )
                    const positionY = Math.max(
                        Math.min(
                            position.y,
                            panelHeight -
                                (overlayHeight !== 0
                                    ? overlayHeight
                                    : previousState.overlayHeight)
                        ),
                        0
                    )
                    mainContext.drawImage(
                        overlayCanvasRef.current,
                        positionX,
                        positionY
                    )
                }
                // }
            }
        }

        // if (numberOfLfmsRendered > 0)
        //     console.log(`Number of LFMs rendered: ${numberOfLfmsRendered}`)
        // if (wasOverlayRendered) console.log("Overlay rendered.")

        setPreviousState((prev) => ({
            lfms,
            raidView,
            excludedLfmCount,
            panelWidth,
            panelHeight,
            selectedLfmInfo,
            sortBy,
            overlayWidth: overlayWidth > 0 ? overlayWidth : prev.overlayWidth,
            overlayHeight:
                overlayHeight > 0 ? overlayHeight : prev.overlayHeight,
            showRaidTimerIndicator,
            showMemberCount,
            showQuestGuesses,
            showQuestTips,
            showCharacterGuildNames,
            showLfmPostedTime,
            fontSize,
        }))
        setIsFirstRender(false)
    }, [
        lfms,
        raidView,
        excludedLfmCount,
        image,
        mainCanvasRef,
        lfmCanvasRef,
        overlayCanvasRef,
        renderLfm,
        renderLfmPanelToCanvas,
        renderLfmOverlay,
        panelWidth,
        panelHeight,
        sortBy,
        isDynamicWidth,
        serverName,
        selectedLfmInfo,
        sortBy,
        showRaidTimerIndicator,
        showMemberCount,
        showQuestGuesses,
        showQuestTips,
        showCharacterGuildNames,
        showLfmPostedTime,
        fontSize,
    ])

    return (
        <canvas
            ref={mainCanvasRef}
            id="lfm-canvas"
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
