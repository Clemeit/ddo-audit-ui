import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Character, CharacterSortType } from "../../models/Character.ts"
import { useWhoContext } from "../../contexts/WhoContext.tsx"
import {
    CHARACTER_HEIGHT,
    FONTS,
    GROUP_BACKGROUND_COLORS,
    GROUP_EDGE_COLORS,
    SORT_HEADER_AREA_HEIGHT,
    WHO_COLORS,
} from "../../constants/whoPanel.ts"
import { SPRITE_MAP } from "../../constants/spriteMap.ts"
import LfmSprite from "../../assets/png/lfm_sprite_6.webp"
import useRenderWhoPanel from "../../hooks/useRenderWhoPanel.ts"
import useRenderCharacter from "../../hooks/useRenderCharacter.ts"
import { calculateCommonFilterBoundingBoxes } from "../../utils/whoUtils.ts"
import { useAreaContext } from "../../contexts/AreaContext.tsx"
import { useAppContext } from "../../contexts/AppContext.tsx"
import useCanvasViewport from "../../hooks/useCanvasViewport.ts"
import WhoFilterZone from "./WhoFilterZone.tsx"

interface Props {
    allCharacters: Character[]
    curatedCharacters: Character[]
    isLoading: boolean
}

const WhoCanvas = ({
    allCharacters = [],
    curatedCharacters = [],
    isLoading,
}: Props) => {
    const {
        panelWidth,
        isDynamicWidth,
        setPanelHeight,
        sortBy,
        setSortBy,
        isGroupView,
        showInQuestIndicator,
        showQuestName,
    } = useWhoContext()
    const {
        lfmHeaderBoundingBox,
        nameHeaderBoundingBox,
        classHeaderBoundingBox,
        levelHeaderBoundingBox,
        guildHeaderBoundingBox,
    } = useMemo(
        () => calculateCommonFilterBoundingBoxes(panelWidth),
        [panelWidth]
    )

    const { areas } = useAreaContext()
    const { isFullScreen } = useAppContext()

    const {
        scrollOffset,
        viewportHeight,
        totalLogicalHeight,
        scrollContainerRef,
        canvasRef: mainCanvasRef,
        canvasScaleWidth,
        canvasScaleHeight,
    } = useCanvasViewport({
        itemHeight: CHARACTER_HEIGHT,
        itemCount: curatedCharacters.length,
        headerHeight: SORT_HEADER_AREA_HEIGHT,
        footerHeight: SPRITE_MAP.CONTENT_BOTTOM.height,
        panelWidth,
    })

    // When the viewport is narrower than panelWidth, CSS scales the canvas
    // down via maxWidth:100%. Compensate by making the canvas logically taller
    // so its visual height still fills the scroll container.
    const [containerWidth, setContainerWidth] = useState<number>(panelWidth)
    const scaleFactor = Math.min(1, containerWidth / panelWidth) || 1
    const adjustedViewportHeight = Math.ceil(viewportHeight / scaleFactor)

    // Clamp scroll offset so we never render past the end of the list.
    // This prevents a flash when characters decrease while scrolled to bottom:
    // the spacer shrinks before the browser fires a scroll event to clamp scrollTop.
    const maxScrollOffset = Math.max(0, totalLogicalHeight - viewportHeight)
    const clampedScrollOffset = Math.min(scrollOffset, maxScrollOffset)

    const adjustedScrollOffset = clampedScrollOffset / scaleFactor
    const adjustedFirstVisible = Math.max(
        0,
        Math.floor(
            (adjustedScrollOffset - SORT_HEADER_AREA_HEIGHT) / CHARACTER_HEIGHT
        )
    )
    const adjustedLastVisible = Math.min(
        curatedCharacters.length - 1,
        Math.ceil(
            (adjustedScrollOffset +
                adjustedViewportHeight -
                SORT_HEADER_AREA_HEIGHT) /
                CHARACTER_HEIGHT
        )
    )
    const scaledSpacerHeight = totalLogicalHeight * scaleFactor

    // Update panelHeight in context (used by screenshot etc.)
    useEffect(() => {
        setPanelHeight(totalLogicalHeight)
    }, [totalLogicalHeight, setPanelHeight])

    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const headerCanvasRef = useRef<HTMLCanvasElement>(null)
    const borderCanvasRef = useRef<HTMLCanvasElement>(null)
    const contentWrapperRef = useRef<HTMLDivElement>(null)
    const headerFonts = useMemo(() => FONTS(0), [])
    const [contentHeight, setContentHeight] = useState(0)

    const { renderBackground, renderOverlay } = useRenderWhoPanel({
        sprite: image,
        context: mainCanvasRef.current?.getContext("2d") ?? null,
    })
    const renderCharacter = useRenderCharacter({
        sprite: image,
        context: mainCanvasRef.current?.getContext("2d") ?? null,
    })

    const [previousState, setPreviousState] = useState({
        onlineCharacterCount: -1,
        anonymousCharacterCount: 0,
        curatedCharacters,
        panelWidth,
        sortBy,
        isGroupView,
        showInQuestIndicator,
        showQuestName,
        areas,
        scrollOffset: -1,
        viewportHeight: -1,
    })

    // Load the lfm sprite
    useEffect(() => {
        const img = new Image()
        img.src = LfmSprite
        img.onload = () => {
            setImage(img)
        }
    }, [])

    // Render sprite-based header bar
    useEffect(() => {
        if (!image || !headerCanvasRef.current) return
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
        // Left cap
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
        // Right cap
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
        // Title text
        ctx.fillStyle = "white"
        ctx.font = headerFonts.MAIN_HEADER
        ctx.textBaseline = "middle"
        ctx.textAlign = "center"
        ctx.fillText("Who List - DDO Audit", w / 2, h / 2 + 3)
    }, [image, panelWidth])

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

    // Border overlay logical height (compensate for CSS scaling)
    const borderLogicalHeight = Math.ceil(contentHeight / scaleFactor)

    // Render sprite border around the full content area (filter + scroll)
    useEffect(() => {
        if (!image || !borderCanvasRef.current || borderLogicalHeight === 0)
            return
        const ctx = borderCanvasRef.current.getContext("2d")
        if (!ctx) return
        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, panelWidth, borderLogicalHeight)

        const w = panelWidth
        const h = borderLogicalHeight

        // Top edge
        for (let i = 0; i <= w / SPRITE_MAP.CONTENT_TOP.width; i++) {
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
        for (let i = 0; i <= w / SPRITE_MAP.CONTENT_BOTTOM.width; i++) {
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
        for (let i = 0; i <= h / SPRITE_MAP.CONTENT_LEFT.height; i++) {
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
        for (let i = 0; i <= h / SPRITE_MAP.CONTENT_RIGHT.height; i++) {
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
    }, [image, panelWidth, borderLogicalHeight])

    // Render the who list
    useEffect(() => {
        if (!image) return
        if (!mainCanvasRef.current) return

        const context = mainCanvasRef.current.getContext("2d")
        if (!context) return

        const anonymousCharacterCount = allCharacters.filter(
            (c) => c.is_anonymous
        ).length

        const needsFullRedraw =
            isLoading ||
            previousState.onlineCharacterCount !== allCharacters.length ||
            previousState.anonymousCharacterCount !== anonymousCharacterCount ||
            previousState.curatedCharacters !== curatedCharacters ||
            previousState.panelWidth !== panelWidth ||
            previousState.sortBy !== sortBy ||
            previousState.isGroupView !== isGroupView ||
            previousState.showInQuestIndicator !== showInQuestIndicator ||
            previousState.showQuestName !== showQuestName ||
            previousState.areas !== areas ||
            previousState.viewportHeight !== adjustedViewportHeight

        const needsScrollRedraw =
            previousState.scrollOffset !== adjustedScrollOffset

        if (!needsFullRedraw && !needsScrollRedraw) return

        // 1. Draw background fill
        renderBackground(adjustedViewportHeight)

        // 2. Draw visible characters (clipped to content area)
        const leftBound = lfmHeaderBoundingBox.x
        const clipX = SPRITE_MAP.CONTENT_LEFT.width
        const clipY = SORT_HEADER_AREA_HEIGHT
        const clipW =
            panelWidth -
            SPRITE_MAP.CONTENT_LEFT.width -
            SPRITE_MAP.CONTENT_RIGHT.width
        const clipH =
            adjustedViewportHeight -
            SORT_HEADER_AREA_HEIGHT -
            SPRITE_MAP.CONTENT_BOTTOM.height

        context.save()
        context.beginPath()
        context.rect(clipX, clipY, clipW, clipH)
        context.clip()

        // Precompute per-row group metadata so the render
        // loop only iterates visible rows — O(visible) instead
        // of O(totalRows).
        let groupMeta:
            | {
                  bg: string
                  edge: string
                  indexInGroup: number
              }[]
            | undefined = undefined

        if (isGroupView) {
            groupMeta = []
            let colorIndex = 0
            let indexInGroup = 0
            for (let i = 0; i < curatedCharacters.length; i++) {
                if (
                    i > 0 &&
                    curatedCharacters[i].group_id !==
                        curatedCharacters[i - 1].group_id
                ) {
                    colorIndex++
                    indexInGroup = 0
                }
                indexInGroup++
                groupMeta.push({
                    bg: GROUP_BACKGROUND_COLORS[
                        colorIndex % GROUP_BACKGROUND_COLORS.length
                    ],
                    edge: GROUP_EDGE_COLORS[
                        colorIndex % GROUP_EDGE_COLORS.length
                    ],
                    indexInGroup,
                })
            }
        }

        for (
            let i = adjustedFirstVisible;
            i <= adjustedLastVisible && i < curatedCharacters.length;
            i++
        ) {
            const character = curatedCharacters[i]
            const meta = groupMeta?.[i]

            const characterY =
                SORT_HEADER_AREA_HEIGHT +
                i * CHARACTER_HEIGHT -
                adjustedScrollOffset

            context.save()
            context.translate(leftBound, characterY)
            renderCharacter({
                character,
                backgroundColorOverride: meta?.bg,
                edgeColorOverride: meta?.edge,
                characterIndex: meta?.indexInGroup,
            })
            context.restore()
        }

        context.restore() // end character clip

        // 3. Draw border, sort headers, and loading message on top
        renderOverlay({
            viewportHeight: adjustedViewportHeight,
            isLoading,
        })

        setPreviousState({
            onlineCharacterCount: allCharacters.length,
            anonymousCharacterCount,
            curatedCharacters,
            panelWidth,
            sortBy,
            isGroupView,
            showInQuestIndicator,
            showQuestName,
            areas,
            scrollOffset: adjustedScrollOffset,
            viewportHeight: adjustedViewportHeight,
        })
    }, [
        allCharacters,
        curatedCharacters,
        image,
        mainCanvasRef,
        isGroupView,
        sortBy,
        showInQuestIndicator,
        showQuestName,
        areas,
        scrollOffset,
        viewportHeight,
        containerWidth,
        isLoading,
    ])

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = mainCanvasRef.current?.getBoundingClientRect()
        if (!rect) return
        if (!mainCanvasRef.current) return

        const x = (e.clientX - rect.left) * canvasScaleWidth
        const y = (e.clientY - rect.top) * canvasScaleHeight

        // Sort header bounding boxes are at canvas-relative positions
        // (pinned at top, not affected by scroll)
        const sortHeaderY = SPRITE_MAP.CONTENT_TOP.height
        const headers = [
            { bb: lfmHeaderBoundingBox, type: CharacterSortType.Lfm },
            { bb: nameHeaderBoundingBox, type: CharacterSortType.Name },
            { bb: classHeaderBoundingBox, type: CharacterSortType.Class },
            { bb: levelHeaderBoundingBox, type: CharacterSortType.Level },
            { bb: guildHeaderBoundingBox, type: CharacterSortType.Guild },
        ]
        for (const { bb, type } of headers) {
            if (
                x >= bb.x &&
                x <= bb.right() &&
                y >= sortHeaderY &&
                y <= sortHeaderY + bb.height
            ) {
                if (sortBy.type === type) {
                    setSortBy((prev) => ({
                        type,
                        ascending: !prev.ascending,
                    }))
                } else {
                    setSortBy({ type, ascending: true })
                }
                break
            }
        }
    }

    const anonymousCount = useMemo(
        () => allCharacters.filter((c) => c.is_anonymous).length,
        [allCharacters]
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
        // Measure height consumed by siblings rendered after the scroll container
        let belowHeight = 0
        let sibling = el.nextElementSibling
        while (sibling) {
            belowHeight += sibling.getBoundingClientRect().height
            sibling = sibling.nextElementSibling
        }
        // Walk up ancestors and sum their bottom padding/margin + trailing siblings
        let ancestor: HTMLElement | null = el.parentElement
        while (ancestor && !ancestor.classList.contains("page")) {
            const style = getComputedStyle(ancestor)
            belowHeight += parseFloat(style.paddingBottom) || 0
            belowHeight += parseFloat(style.marginBottom) || 0
            let parentSibling = ancestor.nextElementSibling
            while (parentSibling) {
                belowHeight += parentSibling.getBoundingClientRect().height
                parentSibling = parentSibling.nextElementSibling
            }
            ancestor = ancestor.parentElement
        }
        // Account for the page element's own bottom padding
        if (ancestor) {
            const pageStyle = getComputedStyle(ancestor)
            belowHeight += parseFloat(pageStyle.paddingBottom) || 0
        }
        // Account for fixed-position mobile nav bar at the bottom
        const navMenu = document.querySelector(".nav-menu")
        if (navMenu) {
            const navStyle = getComputedStyle(navMenu)
            if (navStyle.position === "fixed" && navStyle.bottom === "0px") {
                belowHeight += navMenu.getBoundingClientRect().height
            }
        }
        const available = window.innerHeight - top - belowHeight
        if (available > 100) {
            setScrollAreaHeight(available)
        }
    }, [scrollContainerRef])

    // Debounced wrapper — coalesces rapid resize/layout events into a single rAF
    const measureScrollArea = useCallback(() => {
        if (measureRafRef.current !== null) return
        measureRafRef.current = requestAnimationFrame(() => {
            measureRafRef.current = null
            measureScrollAreaCore()
        })
    }, [measureScrollAreaCore])

    useEffect(() => {
        // Run synchronously on mount, then debounce subsequent calls
        measureScrollAreaCore()
        window.addEventListener("resize", measureScrollArea)
        return () => {
            window.removeEventListener("resize", measureScrollArea)
            if (measureRafRef.current !== null) {
                cancelAnimationFrame(measureRafRef.current)
            }
        }
    }, [measureScrollArea, measureScrollAreaCore])

    // Re-measure when filter zone content or fullscreen state changes
    useEffect(() => {
        measureScrollArea()
    }, [
        allCharacters.length,
        curatedCharacters.length,
        isFullScreen,
        measureScrollArea,
    ])

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
            {/* Content area: filter zone + scroll area, with border overlay */}
            <div
                ref={contentWrapperRef}
                style={{
                    position: "relative",
                    background: WHO_COLORS.BLACK_BACKGROUND,
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
                <WhoFilterZone
                    allCharacterCount={allCharacters.length}
                    anonymousCharacterCount={anonymousCount}
                    displayedCharacterCount={curatedCharacters.length}
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
                        id="who-canvas"
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
                    />
                </div>
            </div>
        </div>
    )
}

export default WhoCanvas
