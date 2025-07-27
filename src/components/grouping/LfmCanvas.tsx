import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Lfm } from "../../models/Lfm.ts"
import useRenderLfm from "../../hooks/useRenderLfm.ts"
import useRenderLfmPanel from "../../hooks/useRenderLfmPanel.ts"
import useRenderLfmOverlay, {
    RenderType,
} from "../../hooks/useRenderLfmOverlay.ts"
import LfmSprite from "../../assets/png/lfm_sprite_6.webp"
import { useLfmContext } from "../../contexts/LfmContext.tsx"
import {
    areLfmsEquivalent,
    calculateCommonBoundingBoxes,
} from "../../utils/lfmUtils.ts"
import {
    DEFAULT_LFM_PANEL_WIDTH,
    DOUBLE_CLICK_DELAY,
    DOUBLE_CLICK_DISTANCE_THRESHOLD,
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
import { useQuestContext } from "../../contexts/QuestContext.tsx"
import { useAreaContext } from "../../contexts/AreaContext.tsx"

interface Props {
    serverName: string
    lfms: Lfm[]
    raidView: boolean
    excludedLfmCount?: number
    isLoading: boolean
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
    isLoading = false,
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
        highlightRaids,
        showNotEligible,
        showEligibilityDividers,
    } = useLfmContext()

    const areaContext = useAreaContext()
    const questContext = useQuestContext()

    // Memoized values
    const commonBoundingBoxes = useMemo(
        () => calculateCommonBoundingBoxes(panelWidth),
        [panelWidth]
    )

    const sortHeaders = useMemo(
        () => SORT_HEADERS(commonBoundingBoxes),
        [commonBoundingBoxes]
    )

    const fonts = useMemo(() => FONTS(), [])

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
    }, [lfms.length, raidView, setPanelHeight])

    // State
    const [selectedLfmInfo, setSelectedLfmInfo] =
        useState<SelectedLfmInfo | null>(null)
    const [overlayDimensions, setOverlayDimensions] = useState({
        width: 0,
        height: 0,
    })
    const [previousLfms, setPreviousLfms] = useState<Lfm[]>([])
    const [previousLfmCount, setPreviousLfmCount] = useState(0)
    const lastRenderTimesRef = useRef<Map<string, number>>(new Map())
    const previousDisplaySettingsRef = useRef({
        showRaidTimerIndicator,
        showMemberCount,
        showQuestGuesses,
        showQuestTips,
        showCharacterGuildNames,
        showLfmPostedTime,
        fontSize,
        highlightRaids,
        raidView,
        showEligibilityDividers,
    })
    const previousAreaContextRef = useRef(areaContext)
    const previousQuestContextRef = useRef(questContext)

    // Canvas refs
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const mainCanvasRef = useRef<HTMLCanvasElement>(
        document.createElement("canvas")
    )
    const backBufferCanvasRef = useRef<HTMLCanvasElement>(
        document.createElement("canvas")
    )
    const lfmPanelCanvasRef = useRef<HTMLCanvasElement>(
        document.createElement("canvas")
    )
    const lfmCanvasRef = useRef<HTMLCanvasElement>(
        document.createElement("canvas")
    )
    const overlayCanvasRef = useRef<HTMLCanvasElement>(
        document.createElement("canvas")
    )
    const mouseMoveTimeout = useRef<number | null>(null)

    const physicalCanvasWidth = useRef<number>(DEFAULT_LFM_PANEL_WIDTH)
    const physicalCanvasHeight = useRef<number>(200)

    // Canvas scaling
    const [canvasScaleWidth, setCanvasScaleWidth] = useState(1)
    const [canvasScaleHeight, setCanvasScaleHeight] = useState(1)

    // Hooks to do the rendering
    const { renderLfm } = useRenderLfm({
        lfmSprite: image,
        context: lfmCanvasRef.current?.getContext("2d"),
        raidView: raidView,
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

    // Helper function to generate a unique key for an LFM for tracking render times
    const getLfmKey = useCallback((lfm: Lfm): string => {
        return `${lfm.leader.name}_${lfm.quest_id}_${lfm.comment}_${lfm.members.length}`
    }, [])

    // Helper function to check if two consecutive LFMs have different eligible characters
    const doLfmsHaveDifferentEligibleCharacters = useCallback(
        (lfm1: Lfm | undefined, lfm2: Lfm | undefined): boolean => {
            if (!lfm1 || !lfm2) return false
            const eligible1 = new Set(
                lfm1?.metadata?.eligibleCharacters?.map((c) => c.id) || []
            )
            const eligible2 = new Set(
                lfm2?.metadata?.eligibleCharacters?.map((c) => c.id) || []
            )
            if (eligible1.size !== eligible2.size) return true
            for (const id of eligible1) {
                if (!eligible2.has(id)) return true
            }
            return false
        },
        []
    )

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
        if (
            backBufferCanvasRef.current &&
            lfmPanelCanvasRef.current &&
            lfmCanvasRef.current &&
            overlayCanvasRef.current
        ) {
            backBufferCanvasRef.current.width = panelWidth
            backBufferCanvasRef.current.height = panelHeight
            lfmPanelCanvasRef.current.width = panelWidth
            lfmPanelCanvasRef.current.height = panelHeight
            lfmCanvasRef.current.width = panelWidth
            lfmCanvasRef.current.height = panelHeight
            overlayCanvasRef.current.width = panelWidth
            overlayCanvasRef.current.height = panelHeight
        }
    }, [panelWidth, panelHeight])

    // Handle canvas scaling
    useEffect(() => {
        const handleResize = () => {
            if (mainCanvasRef.current) {
                const rect = mainCanvasRef.current.getBoundingClientRect()
                setCanvasScaleWidth(mainCanvasRef.current.width / rect.width)
                setCanvasScaleHeight(mainCanvasRef.current.height / rect.height)
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
    }, [])

    const { quests } = useQuestContext()
    const lastClickPositionRef = useRef({ x: 0, y: 0 })
    const lastClickTimestampRef = useRef(new Date().getTime())

    // Mouse event handlers
    const handleCanvasClick = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>, isHover = false) => {
            if (raidView) return
            const rect = mainCanvasRef.current?.getBoundingClientRect()
            if (!rect || !mainCanvasRef.current) return

            const x = (e.clientX - rect.left) * canvasScaleWidth
            const y = (e.clientY - rect.top) * canvasScaleHeight

            const isDoubleClick =
                new Date().getTime() - lastClickTimestampRef.current <
                    DOUBLE_CLICK_DELAY &&
                Math.abs(x - lastClickPositionRef.current.x) <
                    DOUBLE_CLICK_DISTANCE_THRESHOLD &&
                Math.abs(y - lastClickPositionRef.current.y) <
                    DOUBLE_CLICK_DISTANCE_THRESHOLD &&
                !isHover
            if (!isHover) {
                lastClickPositionRef.current = { x, y }
                lastClickTimestampRef.current = new Date().getTime()
            }

            if (!isHover) {
                // Check if the mouse is over a sort header
                const sortHeaderIndex = sortHeaders.findIndex((header) => {
                    return (
                        x > header.boundingBox.left() &&
                        x < header.boundingBox.right() &&
                        y >
                            LFM_PANEL_TOP_BORDER_HEIGHT +
                                LFM_AREA_PADDING.top &&
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

                if (renderType === RenderType.QUEST && isDoubleClick) {
                    // Launch the Wiki!
                    const lfm = lfms[lfmIndex]
                    if (lfm && lfm.quest_id) {
                        const quest = quests[lfm.quest_id] ?? null
                        if (quest && quest.name) {
                            window.open(
                                "https://ddowiki.com/page/" +
                                    quest.name.replace(/ /g, "_"),
                                "_blank"
                            )
                            return
                        }
                    }
                }

                if (
                    renderType === RenderType.QUEST &&
                    !lfms[lfmIndex].quest_id
                ) {
                    setSelectedLfmInfo(null)
                    return
                }

                if (
                    !selectedLfmInfo ||
                    lfmIndex !== selectedLfmInfo.index ||
                    renderType !== selectedLfmInfo.renderType
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
        },
        [
            raidView,
            canvasScaleWidth,
            canvasScaleHeight,
            sortHeaders,
            sortBy,
            setSortBy,
            commonBoundingBoxes,
            lfms,
            selectedLfmInfo,
        ]
    )

    const handleCanvasMouseLeave = useCallback(() => {
        if (raidView) return
        setSelectedLfmInfo(null)
        if (mouseMoveTimeout.current) {
            clearTimeout(mouseMoveTimeout.current)
        }
    }, [raidView])

    const handleCanvasMouseMove = useCallback(
        (event: React.MouseEvent<HTMLCanvasElement>) => {
            if (raidView) return
            if (mouseMoveTimeout.current) {
                clearTimeout(mouseMoveTimeout.current)
            }
            mouseMoveTimeout.current = window.setTimeout(() => {
                handleCanvasClick(event, true)
            }, mouseOverDelay)
        },
        [raidView, mouseOverDelay, handleCanvasClick]
    )

    // Render the panel when panel-related props change
    useEffect(() => {
        if (!image) return
        renderLfmPanelToCanvas(panelHeight, lfms.length, excludedLfmCount)
    }, [
        image,
        renderLfmPanelToCanvas,
        panelHeight,
        raidView,
        sortBy,
        isLoading,
        lfms.length,
        excludedLfmCount,
    ])

    // Memoize current display settings to detect changes
    const currentDisplaySettings = useMemo(
        () => ({
            showRaidTimerIndicator,
            showMemberCount,
            showQuestGuesses,
            showQuestTips,
            showCharacterGuildNames,
            showLfmPostedTime,
            fontSize,
            highlightRaids,
            raidView,
            showEligibilityDividers,
        }),
        [
            showRaidTimerIndicator,
            showMemberCount,
            showQuestGuesses,
            showQuestTips,
            showCharacterGuildNames,
            showLfmPostedTime,
            fontSize,
            highlightRaids,
            raidView,
            showEligibilityDividers,
        ]
    )

    // Render LFMs when LFM data or display settings change
    useEffect(() => {
        if (!image) return

        const lfmContext = lfmCanvasRef.current?.getContext("2d")
        if (!lfmContext) return

        // Restore lastRenderTime values from our persistent map
        lfms.forEach((lfm) => {
            const lfmKey = getLfmKey(lfm)
            const savedLastRenderTime = lastRenderTimesRef.current.get(lfmKey)
            if (savedLastRenderTime) {
                lfm.metadata = {
                    ...lfm.metadata,
                    lastRenderTime: savedLastRenderTime,
                }
            }
        })

        // Check if display settings have changed (requiring full re-render)
        const displaySettingsChanged =
            JSON.stringify(currentDisplaySettings) !==
            JSON.stringify(previousDisplaySettingsRef.current)

        // Check if contexts have changed
        const areaContextChanged =
            areaContext !== previousAreaContextRef.current
        const questContextChanged =
            questContext !== previousQuestContextRef.current

        // Check if we need to render all LFMs
        const shouldRenderAll =
            lfms.length !== previousLfmCount ||
            displaySettingsChanged ||
            areaContextChanged ||
            questContextChanged ||
            previousLfms.length === 0 // First render

        if (shouldRenderAll) {
            // Clear entire canvas and render all LFMs
            lfmContext.clearRect(0, 0, panelWidth, panelHeight)
            lfmContext.save()
            lfmContext.translate(
                Math.floor(LFM_LEFT_PADDING),
                raidView ? 0 : Math.floor(LFM_TOP_PADDING)
            )

            lfms.forEach((lfm, index) => {
                const isEligibilityBoundary =
                    doLfmsHaveDifferentEligibleCharacters(
                        lfm,
                        lfms[index + 1]
                    ) &&
                    !showNotEligible &&
                    showEligibilityDividers
                const lfmKey = getLfmKey(lfm)
                const now = Date.now()
                renderLfm(lfm, isEligibilityBoundary)
                lfm.metadata = { ...lfm.metadata, lastRenderTime: now }
                lastRenderTimesRef.current.set(lfmKey, now)
                lfmContext.translate(0, Math.floor(LFM_HEIGHT))
            })

            lfmContext.restore()
            setPreviousLfms([...lfms])
            setPreviousLfmCount(lfms.length)
            previousDisplaySettingsRef.current = { ...currentDisplaySettings }
            previousAreaContextRef.current = areaContext
            previousQuestContextRef.current = questContext
        } else {
            // Only render LFMs that have changed
            lfmContext.save()
            lfmContext.translate(
                Math.floor(LFM_LEFT_PADDING),
                raidView ? 0 : Math.floor(LFM_TOP_PADDING)
            )

            let renderedCount = 0
            lfms.forEach((lfm, index) => {
                const needsRender =
                    !previousLfms[index] ||
                    !areLfmsEquivalent(lfm, previousLfms[index]) ||
                    lfm.metadata?.lastRenderTime === null ||
                    Date.now() - (lfm.metadata?.lastRenderTime || 0) > 60000

                if (needsRender) {
                    renderedCount++
                    const isEligibilityBoundary =
                        doLfmsHaveDifferentEligibleCharacters(
                            lfm,
                            lfms[index + 1]
                        ) &&
                        !showNotEligible &&
                        showEligibilityDividers
                    // Clear only this LFM's area and re-render it
                    lfmContext.save()
                    lfmContext.clearRect(
                        0,
                        0,
                        panelWidth - LFM_LEFT_PADDING,
                        LFM_HEIGHT
                    )
                    const lfmKey = getLfmKey(lfm)
                    const now = Date.now()
                    renderLfm(lfm, isEligibilityBoundary)
                    lfm.metadata = {
                        ...lfm.metadata,
                        lastRenderTime: now,
                    }
                    lastRenderTimesRef.current.set(lfmKey, now)
                    lfmContext.restore()
                }

                lfmContext.translate(0, Math.floor(LFM_HEIGHT))
            })

            lfmContext.restore()
            setPreviousLfms([...lfms])
        }
    }, [
        image,
        lfms,
        renderLfm,
        panelWidth,
        panelHeight,
        currentDisplaySettings,
        previousLfmCount,
        getLfmKey,
        doLfmsHaveDifferentEligibleCharacters,
    ])

    // Handle loading state
    useEffect(() => {
        if (!image || !isLoading) return

        const context = lfmCanvasRef.current?.getContext("2d")
        if (!context) return

        context.clearRect(0, 0, panelWidth, panelHeight)
        context.fillStyle = LFM_COLORS.SECONDARY_TEXT
        context.font = fonts.MISC_INFO_MESSAGE
        context.textAlign = "center"
        context.fillText("Content loading...", panelWidth / 2, 150)
    }, [image, isLoading, panelWidth, panelHeight, fonts])

    // Handle overlay rendering
    useEffect(() => {
        if (!image) return

        if (selectedLfmInfo && selectedLfmInfo.index < lfms.length) {
            const { index, renderType } = selectedLfmInfo
            const { width, height } = renderLfmOverlay(lfms[index], renderType)
            setOverlayDimensions({ width, height })
        } else {
            clearOverlay()
            setOverlayDimensions({ width: 0, height: 0 })
        }
    }, [image, selectedLfmInfo, lfms, renderLfmOverlay, clearOverlay])

    // Track when we need to re-composite
    const [needsComposite, setNeedsComposite] = useState(true)

    // Trigger composite when any rendering layer changes
    useEffect(() => {
        setNeedsComposite(true)
    }, [
        image,
        panelWidth,
        panelHeight,
        selectedLfmInfo,
        overlayDimensions,
        lfms.length, // Only track length changes
        isLoading,
        excludedLfmCount,
        currentDisplaySettings,
    ])

    // Composite all canvases to main canvas using the back buffer as an intermediary
    useEffect(() => {
        if (!needsComposite) return
        const canvasHeight = raidView
            ? LFM_HEIGHT * lfms.length
            : LFM_HEIGHT * Math.max(MINIMUM_LFM_COUNT, lfms.length) +
              TOTAL_LFM_PANEL_BORDER_HEIGHT +
              SORT_HEADER_HEIGHT +
              LFM_AREA_PADDING.top +
              LFM_AREA_PADDING.bottom

        const backBufferContext = backBufferCanvasRef.current?.getContext("2d")
        if (!backBufferContext || !image) return

        backBufferContext.imageSmoothingEnabled = false
        backBufferContext.clearRect(0, 0, panelWidth, panelHeight)

        // Draw panel
        backBufferContext.drawImage(lfmPanelCanvasRef.current, 0, 0)

        // Draw LFMs
        backBufferContext.drawImage(lfmCanvasRef.current, 0, 0)

        // Draw overlay if selected
        if (selectedLfmInfo) {
            const { position } = selectedLfmInfo
            const positionX = Math.max(
                Math.min(position.x, panelWidth - overlayDimensions.width),
                0
            )
            const positionY = Math.max(
                Math.min(position.y, panelHeight - overlayDimensions.height),
                0
            )
            backBufferContext.drawImage(
                overlayCanvasRef.current,
                positionX,
                positionY
            )
        }

        const mainContext = mainCanvasRef.current?.getContext("2d")
        mainContext.drawImage(backBufferCanvasRef.current, 0, 0)
        physicalCanvasHeight.current = canvasHeight

        setNeedsComposite(false)
    }, [
        needsComposite,
        image,
        panelWidth,
        panelHeight,
        selectedLfmInfo,
        overlayDimensions,
    ])

    return (
        <canvas
            ref={mainCanvasRef}
            id="lfm-canvas"
            width={physicalCanvasWidth.current}
            height={physicalCanvasHeight.current}
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
