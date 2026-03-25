import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Lfm } from "../../models/Lfm.ts"
import useRenderLfm from "../../hooks/useRenderLfm.ts"
import useRenderLfmPanel from "../../hooks/useRenderLfmPanel.ts"
import LfmOverlay, { RenderType } from "./LfmOverlay.tsx"
import LfmSprite from "../../assets/png/lfm_sprite_6.webp"
import { useLfmContext } from "../../contexts/LfmContext.tsx"
import {
    areLfmsEquivalent,
    calculateCommonBoundingBoxes,
} from "../../utils/lfmUtils.ts"
import {
    DOUBLE_CLICK_DELAY,
    DOUBLE_CLICK_DISTANCE_THRESHOLD,
    FONTS,
    LFM_AREA_PADDING,
    LFM_COLORS,
    LFM_HEIGHT,
    LFM_LEFT_PADDING,
    MINIMUM_LFM_COUNT,
    SORT_HEADER_HEIGHT,
    SORT_HEADERS,
} from "../../constants/lfmPanel.ts"
import { SPRITE_MAP } from "../../constants/spriteMap.ts"
import useCanvasViewport from "../../hooks/useCanvasViewport.ts"
import { useAppContext } from "../../contexts/AppContext.tsx"

interface Props {
    serverName: string
    lfms: Lfm[]
    raidView: boolean
    excludedLfmCount?: number
    isLoading: boolean
}

// In raidView there is no panel chrome, sort headers start at 0
// Include CONTENT_TOP height so sort headers render below the decorative border
const SORT_HEADER_AREA_HEIGHT =
    SPRITE_MAP.CONTENT_TOP.height + LFM_AREA_PADDING.top + SORT_HEADER_HEIGHT

const LfmCanvas: React.FC<Props> = ({
    lfms,
    raidView,
    excludedLfmCount = 0,
    isLoading,
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
    const { isFullScreen } = useAppContext()

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

    // The total logical height of the full content
    const headerHeight = raidView ? 0 : SORT_HEADER_AREA_HEIGHT + 1
    const footerHeight = raidView
        ? 0
        : SPRITE_MAP.CONTENT_BOTTOM.height + LFM_AREA_PADDING.bottom
    const canvasWidth = raidView
        ? panelWidth -
          SPRITE_MAP.CONTENT_LEFT.width -
          SPRITE_MAP.CONTENT_RIGHT.width -
          LFM_AREA_PADDING.left -
          LFM_AREA_PADDING.right
        : panelWidth

    const {
        scrollOffset,
        viewportHeight,
        totalLogicalHeight,
        scrollContainerRef,
        canvasRef: mainCanvasRef,
        canvasScaleWidth,
        canvasScaleHeight,
    } = useCanvasViewport({
        itemHeight: LFM_HEIGHT,
        itemCount: Math.max(
            raidView ? lfms.length : MINIMUM_LFM_COUNT,
            lfms.length
        ),
        headerHeight,
        footerHeight,
        panelWidth,
    })

    // CSS scaling compensation (same pattern as WhoCanvas)
    const [containerWidth, setContainerWidth] = useState<number>(panelWidth)
    const scaleFactor = Math.min(1, containerWidth / panelWidth) || 1
    const adjustedViewportHeight = Math.ceil(viewportHeight / scaleFactor)

    const maxScrollOffset = Math.max(0, totalLogicalHeight - viewportHeight)
    const clampedScrollOffset = Math.min(scrollOffset, maxScrollOffset)
    const adjustedScrollOffset = clampedScrollOffset / scaleFactor
    const adjustedFirstVisible = Math.max(
        0,
        Math.floor((adjustedScrollOffset - headerHeight) / LFM_HEIGHT)
    )
    const adjustedLastVisible = Math.min(
        lfms.length - 1,
        Math.ceil(
            (adjustedScrollOffset + adjustedViewportHeight - headerHeight) /
                LFM_HEIGHT
        )
    )
    const scaledSpacerHeight = totalLogicalHeight * scaleFactor

    // Update panelHeight in context
    useEffect(() => {
        setPanelHeight(totalLogicalHeight)
    }, [totalLogicalHeight, setPanelHeight])

    // Image and canvas refs
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const headerCanvasRef = useRef<HTMLCanvasElement>(null)
    const borderCanvasRef = useRef<HTMLCanvasElement>(null)
    const contentWrapperRef = useRef<HTMLDivElement>(null)
    const [contentHeight, setContentHeight] = useState(0)

    // Render hooks - use main canvas context
    const { renderLfm } = useRenderLfm({
        lfmSprite: image,
        context: mainCanvasRef.current?.getContext("2d"),
        raidView,
    })
    const { renderSortHeaders, renderBackground } = useRenderLfmPanel({
        sprite: image,
        context: mainCanvasRef.current?.getContext("2d"),
        raidView,
    })

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

    // Overlay state
    const mouseMoveTimeout = useRef<number | null>(null)
    const lastClickPositionRef = useRef({ x: 0, y: 0 })
    const lastClickTimestampRef = useRef(new Date().getTime())
    const lastClickIndexRef = useRef(-1)
    const lastClickRenderTypeRef = useRef<RenderType | null>(null)

    const [overlayRenderType, setOverlayRenderType] =
        useState<RenderType | null>(null)
    const [overlayRenderIndex, setOverlayRenderIndex] = useState<number | null>(
        null
    )
    const [overlayRenderPosition, setOverlayRenderPosition] = useState<{
        x: number
        y: number
    } | null>(null)
    const overlayData = useMemo<{ lfm: Lfm; type: RenderType } | null>(() => {
        if (
            overlayRenderIndex === null ||
            overlayRenderType === null ||
            overlayRenderIndex < 0 ||
            overlayRenderIndex >= lfms.length
        ) {
            return null
        }
        return { lfm: lfms[overlayRenderIndex], type: overlayRenderType }
    }, [lfms, overlayRenderIndex, overlayRenderType])

    // Load the lfm sprite
    useEffect(() => {
        const img = new Image()
        img.src = LfmSprite
        img.onload = () => {
            setImage(img)
        }
    }, [])

    // Observe content wrapper height for border overlay
    useEffect(() => {
        const el = contentWrapperRef.current
        if (!el) return
        const ro = new ResizeObserver(() => {
            setContentHeight(el.clientHeight)
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const borderLogicalHeight = Math.ceil(contentHeight / scaleFactor)

    // Render sprite-based header bar (above the border)
    useEffect(() => {
        if (!image || !headerCanvasRef.current || raidView) return
        const ctx = headerCanvasRef.current.getContext("2d")
        if (!ctx) return
        ctx.imageSmoothingEnabled = false

        const w = panelWidth
        const h = SPRITE_MAP.HEADER_BAR.height

        // Tile the header bar
        for (let i = 0; i <= Math.round(w / SPRITE_MAP.HEADER_BAR.width); i++) {
            ctx.drawImage(
                image,
                SPRITE_MAP.HEADER_BAR.x,
                SPRITE_MAP.HEADER_BAR.y,
                SPRITE_MAP.HEADER_BAR.width,
                SPRITE_MAP.HEADER_BAR.height,
                SPRITE_MAP.HEADER_LEFT.width + SPRITE_MAP.HEADER_BAR.width * i,
                0,
                SPRITE_MAP.HEADER_BAR.width,
                SPRITE_MAP.HEADER_BAR.height
            )
        }
        ctx.drawImage(
            image,
            SPRITE_MAP.HEADER_LEFT.x,
            SPRITE_MAP.HEADER_LEFT.y,
            SPRITE_MAP.HEADER_LEFT.width,
            SPRITE_MAP.HEADER_LEFT.height,
            0,
            0,
            SPRITE_MAP.HEADER_LEFT.width,
            SPRITE_MAP.HEADER_LEFT.height
        )
        ctx.drawImage(
            image,
            SPRITE_MAP.HEADER_RIGHT.x,
            SPRITE_MAP.HEADER_RIGHT.y,
            SPRITE_MAP.HEADER_RIGHT.width,
            SPRITE_MAP.HEADER_RIGHT.height,
            w - SPRITE_MAP.HEADER_RIGHT.width,
            0,
            SPRITE_MAP.HEADER_RIGHT.width,
            SPRITE_MAP.HEADER_RIGHT.height
        )
        ctx.fillStyle = "white"
        ctx.font = fonts.MAIN_HEADER
        ctx.textBaseline = "middle"
        ctx.textAlign = "center"
        ctx.fillText("Grouping Panel - DDO Audit", w / 2, h / 2 + 3)
    }, [image, panelWidth, raidView])

    // Render sprite border around the full content area
    useEffect(() => {
        if (
            !image ||
            !borderCanvasRef.current ||
            borderLogicalHeight === 0 ||
            raidView
        )
            return
        const ctx = borderCanvasRef.current.getContext("2d")
        if (!ctx) return
        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, panelWidth, borderLogicalHeight)

        const w = panelWidth
        const h = borderLogicalHeight

        // Top edge
        for (let i = 0; i < Math.ceil(w / SPRITE_MAP.CONTENT_TOP.width); i++) {
            ctx.drawImage(
                image,
                SPRITE_MAP.CONTENT_TOP.x,
                SPRITE_MAP.CONTENT_TOP.y,
                SPRITE_MAP.CONTENT_TOP.width,
                SPRITE_MAP.CONTENT_TOP.height,
                Math.min(
                    i * SPRITE_MAP.CONTENT_TOP.width,
                    w - SPRITE_MAP.CONTENT_TOP.width
                ),
                0,
                SPRITE_MAP.CONTENT_TOP.width,
                SPRITE_MAP.CONTENT_TOP.height
            )
        }
        // Bottom edge
        for (
            let i = 0;
            i < Math.ceil(w / SPRITE_MAP.CONTENT_BOTTOM.width);
            i++
        ) {
            ctx.drawImage(
                image,
                SPRITE_MAP.CONTENT_BOTTOM.x,
                SPRITE_MAP.CONTENT_BOTTOM.y,
                SPRITE_MAP.CONTENT_BOTTOM.width,
                SPRITE_MAP.CONTENT_BOTTOM.height,
                Math.min(
                    i * SPRITE_MAP.CONTENT_BOTTOM.width,
                    w - SPRITE_MAP.CONTENT_BOTTOM.width
                ),
                h - SPRITE_MAP.CONTENT_BOTTOM.height,
                SPRITE_MAP.CONTENT_BOTTOM.width,
                SPRITE_MAP.CONTENT_BOTTOM.height
            )
        }
        // Left edge
        for (
            let i = 0;
            i < Math.ceil(h / SPRITE_MAP.CONTENT_LEFT.height);
            i++
        ) {
            ctx.drawImage(
                image,
                SPRITE_MAP.CONTENT_LEFT.x,
                SPRITE_MAP.CONTENT_LEFT.y,
                SPRITE_MAP.CONTENT_LEFT.width,
                SPRITE_MAP.CONTENT_LEFT.height,
                0,
                Math.min(
                    i * SPRITE_MAP.CONTENT_LEFT.height,
                    h - SPRITE_MAP.CONTENT_LEFT.height
                ),
                SPRITE_MAP.CONTENT_LEFT.width,
                SPRITE_MAP.CONTENT_LEFT.height
            )
        }
        // Right edge
        for (
            let i = 0;
            i < Math.ceil(h / SPRITE_MAP.CONTENT_RIGHT.height);
            i++
        ) {
            ctx.drawImage(
                image,
                SPRITE_MAP.CONTENT_RIGHT.x,
                SPRITE_MAP.CONTENT_RIGHT.y,
                SPRITE_MAP.CONTENT_RIGHT.width,
                SPRITE_MAP.CONTENT_RIGHT.height,
                w - SPRITE_MAP.CONTENT_RIGHT.width,
                Math.min(
                    i * SPRITE_MAP.CONTENT_RIGHT.height,
                    h - SPRITE_MAP.CONTENT_RIGHT.height
                ),
                SPRITE_MAP.CONTENT_RIGHT.width,
                SPRITE_MAP.CONTENT_RIGHT.height
            )
        }
        // Corners
        ctx.drawImage(
            image,
            SPRITE_MAP.CONTENT_TOP_LEFT.x,
            SPRITE_MAP.CONTENT_TOP_LEFT.y,
            SPRITE_MAP.CONTENT_TOP_LEFT.width,
            SPRITE_MAP.CONTENT_TOP_LEFT.height,
            0,
            0,
            SPRITE_MAP.CONTENT_TOP_LEFT.width,
            SPRITE_MAP.CONTENT_TOP_LEFT.height
        )
        ctx.drawImage(
            image,
            SPRITE_MAP.CONTENT_TOP_RIGHT.x,
            SPRITE_MAP.CONTENT_TOP_RIGHT.y,
            SPRITE_MAP.CONTENT_TOP_RIGHT.width,
            SPRITE_MAP.CONTENT_TOP_RIGHT.height,
            w - SPRITE_MAP.CONTENT_TOP_RIGHT.width,
            0,
            SPRITE_MAP.CONTENT_TOP_RIGHT.width,
            SPRITE_MAP.CONTENT_TOP_RIGHT.height
        )
        ctx.drawImage(
            image,
            SPRITE_MAP.CONTENT_BOTTOM_LEFT.x,
            SPRITE_MAP.CONTENT_BOTTOM_LEFT.y,
            SPRITE_MAP.CONTENT_BOTTOM_LEFT.width,
            SPRITE_MAP.CONTENT_BOTTOM_LEFT.height,
            0,
            h - SPRITE_MAP.CONTENT_BOTTOM_LEFT.height,
            SPRITE_MAP.CONTENT_BOTTOM_LEFT.width,
            SPRITE_MAP.CONTENT_BOTTOM_LEFT.height
        )
        ctx.drawImage(
            image,
            SPRITE_MAP.CONTENT_BOTTOM_RIGHT.x,
            SPRITE_MAP.CONTENT_BOTTOM_RIGHT.y,
            SPRITE_MAP.CONTENT_BOTTOM_RIGHT.width,
            SPRITE_MAP.CONTENT_BOTTOM_RIGHT.height,
            w - SPRITE_MAP.CONTENT_BOTTOM_RIGHT.width,
            h - SPRITE_MAP.CONTENT_BOTTOM_RIGHT.height,
            SPRITE_MAP.CONTENT_BOTTOM_RIGHT.width,
            SPRITE_MAP.CONTENT_BOTTOM_RIGHT.height
        )
    }, [image, panelWidth, borderLogicalHeight, raidView])

    // Previous state for dirty-checking (useRef avoids extra render cycle from setState)
    const previousStateRef = useRef({
        lfms: [] as Lfm[],
        lfmCount: 0,
        panelWidth: 0,
        sortBy,
        scrollOffset: -1,
        viewportHeight: -1,
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
        excludedLfmCount: 0,
        isLoading: false,
    })

    // Main render effect — single-pass drawing of visible LFMs
    useEffect(() => {
        if (!image) return
        if (!mainCanvasRef.current) return

        const context = mainCanvasRef.current.getContext("2d")
        if (!context) return

        const prev = previousStateRef.current
        const displaySettingsChanged =
            prev.showRaidTimerIndicator !== showRaidTimerIndicator ||
            prev.showMemberCount !== showMemberCount ||
            prev.showQuestGuesses !== showQuestGuesses ||
            prev.showQuestTips !== showQuestTips ||
            prev.showCharacterGuildNames !== showCharacterGuildNames ||
            prev.showLfmPostedTime !== showLfmPostedTime ||
            prev.fontSize !== fontSize ||
            prev.highlightRaids !== highlightRaids ||
            prev.raidView !== raidView ||
            prev.showEligibilityDividers !== showEligibilityDividers ||
            prev.excludedLfmCount !== excludedLfmCount ||
            prev.isLoading !== isLoading

        const dataChanged =
            prev.lfmCount !== lfms.length ||
            prev.panelWidth !== panelWidth ||
            prev.sortBy !== sortBy ||
            !areLfmArraysEqual(
                prev.lfms,
                lfms,
                adjustedFirstVisible,
                adjustedLastVisible
            )

        const scrollChanged =
            prev.scrollOffset !== adjustedScrollOffset ||
            prev.viewportHeight !== adjustedViewportHeight

        if (!displaySettingsChanged && !dataChanged && !scrollChanged) return

        // 1. Draw background
        renderBackground(adjustedViewportHeight)

        // 2. Draw visible LFMs (clipped to content area)
        const clipX = raidView ? 0 : SPRITE_MAP.CONTENT_LEFT.width
        const clipY = raidView ? 0 : SORT_HEADER_AREA_HEIGHT
        const clipW = raidView
            ? canvasWidth
            : panelWidth -
              SPRITE_MAP.CONTENT_LEFT.width -
              SPRITE_MAP.CONTENT_RIGHT.width
        const clipH = raidView
            ? adjustedViewportHeight
            : adjustedViewportHeight -
              SORT_HEADER_AREA_HEIGHT -
              SPRITE_MAP.CONTENT_BOTTOM.height

        context.save()
        context.beginPath()
        context.rect(clipX, clipY, clipW, clipH)
        context.clip()

        for (
            let i = adjustedFirstVisible;
            i <= adjustedLastVisible && i < lfms.length;
            i++
        ) {
            const lfm = lfms[i]
            const lfmY = headerHeight + i * LFM_HEIGHT - adjustedScrollOffset

            const isEligibilityBoundary =
                doLfmsHaveDifferentEligibleCharacters(lfm, lfms[i + 1]) &&
                !showNotEligible &&
                showEligibilityDividers

            context.save()
            context.translate(
                Math.floor(raidView ? 0 : LFM_LEFT_PADDING),
                Math.floor(lfmY)
            )
            renderLfm(lfm, isEligibilityBoundary)
            context.restore()
        }

        context.restore() // end clip

        // 3. Draw sort headers and info messages on top (pinned at top, not affected by scroll)
        if (!raidView) {
            renderSortHeaders(
                adjustedViewportHeight,
                lfms.length,
                excludedLfmCount,
                isLoading
            )
        }

        // 4. Loading message
        if (isLoading && !raidView) {
            context.fillStyle = LFM_COLORS.SECONDARY_TEXT
            context.font = fonts.MISC_INFO_MESSAGE
            context.textAlign = "center"
            context.fillText("Content loading...", panelWidth / 2, 150)
        }

        previousStateRef.current = {
            lfms: [...lfms],
            lfmCount: lfms.length,
            panelWidth,
            sortBy,
            scrollOffset: adjustedScrollOffset,
            viewportHeight: adjustedViewportHeight,
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
            excludedLfmCount,
            isLoading,
        }
    }, [
        image,
        lfms,
        panelWidth,
        sortBy,
        scrollOffset,
        viewportHeight,
        containerWidth,
        raidView,
        isLoading,
        excludedLfmCount,
        showRaidTimerIndicator,
        showMemberCount,
        showQuestGuesses,
        showQuestTips,
        showCharacterGuildNames,
        showLfmPostedTime,
        fontSize,
        highlightRaids,
        showEligibilityDividers,
        showNotEligible,
        renderLfm,
        renderSortHeaders,
        renderBackground,
        doLfmsHaveDifferentEligibleCharacters,
    ])

    // Mouse event handlers
    const handleCanvasClick = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>, isHover = false) => {
            if (raidView) return
            const rect = mainCanvasRef.current?.getBoundingClientRect()
            if (!rect || !mainCanvasRef.current) return

            const x = (e.clientX - rect.left) * canvasScaleWidth
            const y = (e.clientY - rect.top) * canvasScaleHeight

            // Account for scroll offset to get logical y
            const logicalY = y + adjustedScrollOffset

            const lfmIndex = Math.floor((logicalY - headerHeight) / LFM_HEIGHT)
            const renderType =
                x <
                commonBoundingBoxes.mainPanelBoundingBox.right() +
                    LFM_LEFT_PADDING
                    ? RenderType.LFM
                    : RenderType.QUEST

            const isDoubleClick =
                new Date().getTime() - lastClickTimestampRef.current <
                    DOUBLE_CLICK_DELAY &&
                Math.abs(x - lastClickPositionRef.current.x) <
                    DOUBLE_CLICK_DISTANCE_THRESHOLD &&
                Math.abs(y - lastClickPositionRef.current.y) <
                    DOUBLE_CLICK_DISTANCE_THRESHOLD &&
                lastClickIndexRef.current === lfmIndex &&
                lastClickRenderTypeRef.current === renderType &&
                !isHover
            if (!isHover) {
                lastClickPositionRef.current = { x, y }
                lastClickTimestampRef.current = new Date().getTime()
                lastClickIndexRef.current = lfmIndex
                lastClickRenderTypeRef.current = renderType
            }

            if (!isHover) {
                // Check if the mouse is over a sort header (pinned at top of viewport)
                const sortHeaderIndex = sortHeaders.findIndex((header) => {
                    return (
                        x > header.boundingBox.left() &&
                        x < header.boundingBox.right() &&
                        y >
                            SPRITE_MAP.CONTENT_TOP.height +
                                LFM_AREA_PADDING.top &&
                        y <
                            SPRITE_MAP.CONTENT_TOP.height +
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
            if (
                x > LFM_LEFT_PADDING &&
                x <
                    LFM_LEFT_PADDING +
                        commonBoundingBoxes.questPanelBoundingBox.right() &&
                lfmIndex >= 0 &&
                lfmIndex < lfms.length
            ) {
                if (renderType === RenderType.QUEST && isDoubleClick) {
                    const lfm = lfms[lfmIndex]
                    if (lfm && lfm.quest_id) {
                        if (lfm.quest && lfm.quest.name) {
                            window.open(
                                "https://ddowiki.com/page/" +
                                    lfm.quest.name.replace(/ /g, "_"),
                                "_blank"
                            )
                            return
                        }
                    }
                }

                if (
                    lfmIndex !== overlayRenderIndex ||
                    renderType !== overlayRenderType
                ) {
                    setOverlayRenderPosition({ x, y })
                }
                setOverlayRenderType(renderType)
                setOverlayRenderIndex(lfmIndex)
            } else {
                setOverlayRenderType(null)
                setOverlayRenderIndex(null)
                setOverlayRenderPosition(null)
            }
        },
        [
            raidView,
            canvasScaleWidth,
            canvasScaleHeight,
            adjustedScrollOffset,
            headerHeight,
            sortHeaders,
            sortBy,
            setSortBy,
            commonBoundingBoxes,
            lfms,
            overlayRenderIndex,
            overlayRenderType,
        ]
    )

    const handleCanvasMouseLeave = useCallback(() => {
        if (raidView) return
        setOverlayRenderIndex(null)
        setOverlayRenderType(null)
        setOverlayRenderPosition(null)
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

    // Dynamically measure available viewport space for the scroll container
    const [scrollAreaHeight, setScrollAreaHeight] = useState<number>(600)
    const measureRafRef = useRef<number | null>(null)
    const measureScrollAreaCore = useCallback(() => {
        const el = scrollContainerRef.current
        if (!el) return
        const top = el.getBoundingClientRect().top
        const elWidth = el.clientWidth
        if (elWidth > 0) setContainerWidth(elWidth)
        let belowHeight = 0
        let bottomSpacing = 0 // margin/padding that may overlap with nav
        let sibling = el.nextElementSibling
        while (sibling) {
            const pos = getComputedStyle(sibling).position
            if (pos !== "absolute" && pos !== "fixed") {
                belowHeight += sibling.getBoundingClientRect().height
            }
            sibling = sibling.nextElementSibling
        }
        let ancestor: HTMLElement | null = el.parentElement
        while (ancestor && !ancestor.classList.contains("page")) {
            const style = getComputedStyle(ancestor)
            bottomSpacing += parseFloat(style.paddingBottom) || 0
            bottomSpacing += parseFloat(style.marginBottom) || 0
            // Skip sibling walk if parent is a flex row — siblings are
            // beside this element, not below it.
            const parentDir = ancestor.parentElement
                ? getComputedStyle(ancestor.parentElement).flexDirection
                : ""
            if (parentDir !== "row" && parentDir !== "row-reverse") {
                let parentSibling = ancestor.nextElementSibling
                while (parentSibling) {
                    const pos = getComputedStyle(parentSibling).position
                    if (pos !== "absolute" && pos !== "fixed") {
                        belowHeight +=
                            parentSibling.getBoundingClientRect().height
                    }
                    parentSibling = parentSibling.nextElementSibling
                }
            }
            ancestor = ancestor.parentElement
        }
        if (ancestor) {
            const pageStyle = getComputedStyle(ancestor)
            bottomSpacing += parseFloat(pageStyle.paddingBottom) || 0
        }
        // A fixed bottom nav overlaps ancestor margin/padding that was
        // added to reserve space for it, so take the larger of the two.
        const navMenu = document.querySelector(".nav-menu")
        let navHeight = 0
        if (navMenu) {
            const navStyle = getComputedStyle(navMenu)
            if (navStyle.position === "fixed" && navStyle.bottom === "0px") {
                navHeight = navMenu.getBoundingClientRect().height
            }
        }
        belowHeight += Math.max(bottomSpacing, navHeight)
        const available = window.innerHeight - top - belowHeight
        if (available > 100) {
            setScrollAreaHeight(available)
        }
    }, [scrollContainerRef])

    const measureScrollArea = useCallback(() => {
        if (measureRafRef.current !== null) return
        measureRafRef.current = requestAnimationFrame(() => {
            measureRafRef.current = null
            measureScrollAreaCore()
        })
    }, [measureScrollAreaCore])

    useEffect(() => {
        measureScrollAreaCore()
        window.addEventListener("resize", measureScrollArea)

        // Re-measure after short delays to catch layout settling
        const t1 = setTimeout(measureScrollAreaCore, 100)
        const t2 = setTimeout(measureScrollAreaCore, 500)
        let cancelled = false
        document.fonts?.ready?.then(() => {
            if (!cancelled) measureScrollAreaCore()
        })

        // Re-measure when the panel's own dimensions change (e.g.
        // a secondary panel is added/removed in split view).
        const wrapper = contentWrapperRef.current
        let ro: ResizeObserver | undefined
        if (wrapper) {
            ro = new ResizeObserver(measureScrollArea)
            ro.observe(wrapper)
        }

        return () => {
            cancelled = true
            window.removeEventListener("resize", measureScrollArea)
            clearTimeout(t1)
            clearTimeout(t2)
            ro?.disconnect()
            if (measureRafRef.current !== null) {
                cancelAnimationFrame(measureRafRef.current)
            }
        }
    }, [measureScrollArea, measureScrollAreaCore])

    useEffect(() => {
        measureScrollArea()
    }, [isFullScreen, measureScrollArea])

    // Scroll fade indicators
    const canScrollUp = clampedScrollOffset > 0
    const canScrollDown = clampedScrollOffset < maxScrollOffset - 1

    // Clear overlay when scroll happens
    useEffect(() => {
        setOverlayRenderIndex(null)
        setOverlayRenderType(null)
        setOverlayRenderPosition(null)
    }, [scrollOffset])

    if (raidView) {
        // Raid view: show all raids at natural height, no scroll constraint
        // Extra vertical buffer per LFM to account for row border/spacing in raid view
        const RAID_ROW_SPACING_BUFFER = 4
        const raidContentHeight =
            Math.ceil(totalLogicalHeight * scaleFactor) +
            lfms.length * RAID_ROW_SPACING_BUFFER

        return (
            <div
                style={{
                    position: "relative",
                    width: "fit-content",
                }}
            >
                <div
                    ref={scrollContainerRef}
                    className="hide-scrollbar"
                    style={{
                        height: raidContentHeight,
                        overflow: "hidden",
                        position: "relative",
                        maxWidth: "100%",
                        width: isDynamicWidth ? "100%" : "unset",
                        scrollbarWidth: "none",
                    }}
                >
                    <div
                        style={{
                            height: scaledSpacerHeight,
                            pointerEvents: "none",
                        }}
                    />
                    <canvas
                        ref={mainCanvasRef}
                        id="lfm-canvas"
                        width={canvasWidth}
                        height={adjustedViewportHeight}
                        style={{
                            position: "sticky",
                            top: 0,
                            maxWidth: "100%",
                            width: isDynamicWidth ? "100%" : "unset",
                            display: "block",
                            marginTop: -scaledSpacerHeight,
                        }}
                    />
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Sprite-based decorative header bar (above the border) */}
            <canvas
                ref={headerCanvasRef}
                width={panelWidth}
                height={SPRITE_MAP.HEADER_BAR.height}
                style={{
                    display: "block",
                    maxWidth: "100%",
                    width: isDynamicWidth ? "100%" : "unset",
                }}
            />
            {/* Content area: scroll area with border overlay */}
            <div
                ref={contentWrapperRef}
                style={{
                    position: "relative",
                    background: LFM_COLORS.BLACK_BACKGROUND,
                }}
            >
                {/* Border overlay canvas */}
                <canvas
                    ref={borderCanvasRef}
                    width={panelWidth}
                    height={borderLogicalHeight}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        maxWidth: "100%",
                        width: isDynamicWidth ? "100%" : "unset",
                        pointerEvents: "none",
                        zIndex: 1,
                    }}
                />
                <div
                    ref={scrollContainerRef}
                    className="hide-scrollbar"
                    style={{
                        height: scrollAreaHeight,
                        overflowY: "auto",
                        position: "relative",
                        maxWidth: "100%",
                        width: isDynamicWidth ? "100%" : "unset",
                        scrollbarWidth: "none",
                    }}
                >
                    {/* Spacer div to create scrollable area */}
                    <div
                        style={{
                            height: scaledSpacerHeight,
                            pointerEvents: "none",
                        }}
                    />
                    <canvas
                        ref={mainCanvasRef}
                        id="lfm-canvas"
                        width={panelWidth}
                        height={adjustedViewportHeight}
                        style={{
                            position: "sticky",
                            top: 0,
                            maxWidth: "100%",
                            width: isDynamicWidth ? "100%" : "unset",
                            display: "block",
                            marginTop: -scaledSpacerHeight,
                        }}
                        onClick={handleCanvasClick}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseLeave={handleCanvasMouseLeave}
                    />
                </div>
                {/* Scroll fade indicators */}
                {canScrollUp && (
                    <div
                        style={{
                            position: "absolute",
                            top: SORT_HEADER_AREA_HEIGHT * scaleFactor,
                            left: SPRITE_MAP.CONTENT_LEFT.width * scaleFactor,
                            right: SPRITE_MAP.CONTENT_RIGHT.width * scaleFactor,
                            height: 30 * scaleFactor,
                            background:
                                "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)",
                            pointerEvents: "none",
                            zIndex: 1,
                        }}
                    />
                )}
                {canScrollDown && (
                    <div
                        style={{
                            position: "absolute",
                            bottom:
                                SPRITE_MAP.CONTENT_BOTTOM.height * scaleFactor,
                            left: SPRITE_MAP.CONTENT_LEFT.width * scaleFactor,
                            right: SPRITE_MAP.CONTENT_RIGHT.width * scaleFactor,
                            height: 30 * scaleFactor,
                            background:
                                "linear-gradient(to top, rgba(0,0,0,0.45), transparent)",
                            pointerEvents: "none",
                            zIndex: 1,
                        }}
                    />
                )}
                {/* DOM overlay - positioned absolutely within the content wrapper */}
                {overlayData && overlayRenderPosition && (
                    <LfmOverlay
                        lfm={overlayData.lfm}
                        renderType={overlayData.type}
                        position={overlayRenderPosition}
                        containerWidth={containerWidth}
                        containerHeight={scrollAreaHeight}
                        scaleFactor={scaleFactor}
                    />
                )}
            </div>
        </div>
    )
}

// Shallow compare visible portion of two lfm arrays
function areLfmArraysEqual(
    previous: Lfm[],
    current: Lfm[],
    firstVisible: number,
    lastVisible: number
): boolean {
    if (previous.length !== current.length) return false
    const start = Math.max(0, firstVisible)
    const end = Math.min(previous.length - 1, lastVisible)
    for (let i = start; i <= end; i++) {
        if (!areLfmsEquivalent(previous[i], current[i])) return false
    }
    return true
}

export default LfmCanvas
