import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useWhoContext } from "../../contexts/WhoContext.tsx"
import useWindowSize from "../../hooks/useWindowSize.ts"
import {
    CLASS_LIST,
    CLASS_LIST_LOWER,
    MAX_LEVEL,
    MIN_LEVEL,
} from "../../constants/game.ts"
import { WHO_COLORS } from "../../constants/whoPanel.ts"
import { SPRITE_MAP } from "../../constants/spriteMap.ts"
import LfmSprite from "../../assets/png/lfm_sprite_6.webp"

interface Props {
    allCharacterCount: number
    anonymousCharacterCount: number
    displayedCharacterCount: number
}

const WhoFilterZone = ({
    allCharacterCount,
    anonymousCharacterCount,
    displayedCharacterCount,
}: Props) => {
    const {
        classNameFilter,
        setClassNameFilter,
        stringFilter,
        setStringFilter,
        minLevel,
        setMinLevel,
        maxLevel,
        setMaxLevel,
        isGroupView,
        setIsGroupView,
        isExactMatch,
        setIsExactMatch,
        shouldSaveLevelFilter,
        shouldSaveSettings,
        hideClassFilterOnMobile,
    } = useWhoContext()

    const { isMobile } = useWindowSize()
    const s = useMemo(() => getStyles(isMobile), [isMobile])

    const innerBorderRef = useRef<HTMLDivElement>(null)
    const innerBorderCanvasRef = useRef<HTMLCanvasElement>(null)
    const [innerBorderSize, setInnerBorderSize] = useState({ w: 0, h: 0 })
    const [spriteImage, setSpriteImage] = useState<HTMLImageElement | null>(
        null
    )

    // Load sprite image
    useEffect(() => {
        const img = new Image()
        img.src = LfmSprite
        img.onload = () => setSpriteImage(img)
    }, [])

    // Observe inner border size
    useEffect(() => {
        const el = innerBorderRef.current
        if (!el) return
        const ro = new ResizeObserver(() => {
            setInnerBorderSize({ w: el.clientWidth, h: el.clientHeight })
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // Render sprite inner border
    useEffect(() => {
        if (!spriteImage || !innerBorderCanvasRef.current) return
        const { w, h } = innerBorderSize
        if (w === 0 || h === 0) return
        const ctx = innerBorderCanvasRef.current.getContext("2d")
        if (!ctx) return
        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, w, h)

        const S = SPRITE_MAP
        // Top
        for (let i = 0; i <= w / S.SINGLE_BORDER_TOP.width; i++) {
            ctx.drawImage(
                spriteImage,
                S.SINGLE_BORDER_TOP.x,
                S.SINGLE_BORDER_TOP.y,
                S.SINGLE_BORDER_TOP.width,
                S.SINGLE_BORDER_TOP.height,
                Math.min(
                    i * S.SINGLE_BORDER_TOP.width,
                    w - S.SINGLE_BORDER_TOP.width
                ),
                0,
                S.SINGLE_BORDER_TOP.width,
                S.SINGLE_BORDER_TOP.height
            )
        }
        // Bottom
        for (let i = 0; i <= w / S.SINGLE_BORDER_BOTTOM.width; i++) {
            ctx.drawImage(
                spriteImage,
                S.SINGLE_BORDER_BOTTOM.x,
                S.SINGLE_BORDER_BOTTOM.y,
                S.SINGLE_BORDER_BOTTOM.width,
                S.SINGLE_BORDER_BOTTOM.height,
                Math.min(
                    i * S.SINGLE_BORDER_BOTTOM.width,
                    w - S.SINGLE_BORDER_BOTTOM.width
                ),
                h - S.SINGLE_BORDER_BOTTOM.height,
                S.SINGLE_BORDER_BOTTOM.width,
                S.SINGLE_BORDER_BOTTOM.height
            )
        }
        // Left
        for (let i = 0; i <= h / S.SINGLE_BORDER_LEFT.height; i++) {
            ctx.drawImage(
                spriteImage,
                S.SINGLE_BORDER_LEFT.x,
                S.SINGLE_BORDER_LEFT.y,
                S.SINGLE_BORDER_LEFT.width,
                S.SINGLE_BORDER_LEFT.height,
                0,
                Math.min(
                    i * S.SINGLE_BORDER_LEFT.height,
                    h - S.SINGLE_BORDER_LEFT.height
                ),
                S.SINGLE_BORDER_LEFT.width,
                S.SINGLE_BORDER_LEFT.height
            )
        }
        // Right
        for (let i = 0; i <= h / S.SINGLE_BORDER_RIGHT.height; i++) {
            ctx.drawImage(
                spriteImage,
                S.SINGLE_BORDER_RIGHT.x,
                S.SINGLE_BORDER_RIGHT.y,
                S.SINGLE_BORDER_RIGHT.width,
                S.SINGLE_BORDER_RIGHT.height,
                w - S.SINGLE_BORDER_RIGHT.width,
                Math.min(
                    i * S.SINGLE_BORDER_RIGHT.height,
                    h - S.SINGLE_BORDER_RIGHT.height
                ),
                S.SINGLE_BORDER_RIGHT.width,
                S.SINGLE_BORDER_RIGHT.height
            )
        }
        // Corners
        ctx.drawImage(
            spriteImage,
            S.SINGLE_BORDER_TOP_LEFT.x,
            S.SINGLE_BORDER_TOP_LEFT.y,
            S.SINGLE_BORDER_TOP_LEFT.width,
            S.SINGLE_BORDER_TOP_LEFT.height,
            0,
            0,
            S.SINGLE_BORDER_TOP_LEFT.width,
            S.SINGLE_BORDER_TOP_LEFT.height
        )
        ctx.drawImage(
            spriteImage,
            S.SINGLE_BORDER_TOP_RIGHT.x,
            S.SINGLE_BORDER_TOP_RIGHT.y,
            S.SINGLE_BORDER_TOP_RIGHT.width,
            S.SINGLE_BORDER_TOP_RIGHT.height,
            w - S.SINGLE_BORDER_TOP_RIGHT.width,
            0,
            S.SINGLE_BORDER_TOP_RIGHT.width,
            S.SINGLE_BORDER_TOP_RIGHT.height
        )
        ctx.drawImage(
            spriteImage,
            S.SINGLE_BORDER_BOTTOM_LEFT.x,
            S.SINGLE_BORDER_BOTTOM_LEFT.y,
            S.SINGLE_BORDER_BOTTOM_LEFT.width,
            S.SINGLE_BORDER_BOTTOM_LEFT.height,
            0,
            h - S.SINGLE_BORDER_BOTTOM_LEFT.height,
            S.SINGLE_BORDER_BOTTOM_LEFT.width,
            S.SINGLE_BORDER_BOTTOM_LEFT.height
        )
        ctx.drawImage(
            spriteImage,
            S.SINGLE_BORDER_BOTTOM_RIGHT.x,
            S.SINGLE_BORDER_BOTTOM_RIGHT.y,
            S.SINGLE_BORDER_BOTTOM_RIGHT.width,
            S.SINGLE_BORDER_BOTTOM_RIGHT.height,
            w - S.SINGLE_BORDER_BOTTOM_RIGHT.width,
            h - S.SINGLE_BORDER_BOTTOM_RIGHT.height,
            S.SINGLE_BORDER_BOTTOM_RIGHT.width,
            S.SINGLE_BORDER_BOTTOM_RIGHT.height
        )
    }, [spriteImage, innerBorderSize])

    const [fauxMinLevel, setFauxMinLevel] = useState<string>(String(MIN_LEVEL))
    const [fauxMaxLevel, setFauxMaxLevel] = useState<string>(String(MAX_LEVEL))
    const loadedLevels = useRef<boolean>(false)

    useEffect(() => {
        if (!loadedLevels.current) return
        if (fauxMinLevel === "") {
            setMinLevel(0)
        } else {
            setMinLevel(parseInt(fauxMinLevel))
        }
        if (fauxMaxLevel === "") {
            setMaxLevel(0)
        } else {
            setMaxLevel(parseInt(fauxMaxLevel))
        }
    }, [fauxMinLevel, fauxMaxLevel])

    useEffect(() => {
        const setLevelTimeout = setTimeout(() => {
            if (shouldSaveSettings && shouldSaveLevelFilter) {
                setFauxMinLevel(String(minLevel))
                setFauxMaxLevel(String(maxLevel))
            }
            loadedLevels.current = true
        }, 100)
        return () => clearTimeout(setLevelTimeout)
    }, [shouldSaveSettings, shouldSaveLevelFilter])

    const toggleClass = (className: string) => {
        if (classNameFilter.includes(className)) {
            setClassNameFilter(classNameFilter.filter((c) => c !== className))
        } else {
            setClassNameFilter([...classNameFilter, className])
        }
    }

    const toggleAllClasses = () => {
        if (classNameFilter.length === CLASS_LIST_LOWER.length) {
            setClassNameFilter([])
        } else {
            setClassNameFilter(CLASS_LIST_LOWER)
        }
    }

    return (
        <div style={s.container}>
            <div ref={innerBorderRef} style={s.innerBorder}>
                <canvas
                    ref={innerBorderCanvasRef}
                    width={innerBorderSize.w}
                    height={innerBorderSize.h}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                    }}
                />
                {/* Shared-width wrapper so both groups match the wider one */}
                <div style={s.sharedWidthWrapper}>
                    {/* Class filter group - left-aligned internally, centered as a group */}
                    {!(hideClassFilterOnMobile && isMobile) && (
                        <div style={s.centeredGroup}>
                            <div style={s.row}>
                                <span style={s.yellowText}>
                                    Filter by Class:
                                </span>
                                <label
                                    style={s.checkboxLabel}
                                    onClick={toggleAllClasses}
                                >
                                    <SpriteCheckbox
                                        checked={
                                            classNameFilter.length ===
                                            CLASS_LIST_LOWER.length
                                        }
                                        type="normal"
                                    />
                                    <span style={s.whiteText}>Any</span>
                                </label>
                            </div>
                            <div style={s.classFiltersRow}>
                                {CLASS_LIST.map((className, index) => {
                                    const filterKey = className
                                        .replace(" ", "_")
                                        .toUpperCase()
                                    const spriteData =
                                        SPRITE_MAP.CLASS_FILTER[filterKey]
                                    const isSelected = classNameFilter.includes(
                                        CLASS_LIST_LOWER[index]
                                    )
                                    return (
                                        <button
                                            key={className}
                                            onClick={() =>
                                                toggleClass(
                                                    CLASS_LIST_LOWER[index]
                                                )
                                            }
                                            style={{
                                                ...s.classFilterButton,
                                                outline: isSelected
                                                    ? "2px solid #ffffff"
                                                    : "none",
                                            }}
                                            title={className}
                                        >
                                            <SpriteImage
                                                spriteData={spriteData}
                                                selected={isSelected}
                                            />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Search/level/group view + exact match - left-aligned internally, centered as a group */}
                    <div style={s.centeredGroup}>
                        <div style={s.searchRow}>
                            <div style={s.searchGroup}>
                                <span style={s.yellowText}>
                                    Search by Name, Guild, or Location:
                                </span>
                                <input
                                    type="text"
                                    value={stringFilter}
                                    onChange={(e) =>
                                        setStringFilter(e.target.value)
                                    }
                                    style={s.searchInput}
                                    tabIndex={1}
                                />
                            </div>
                            <div style={s.levelGroup}>
                                <span style={s.yellowText}>Level Range:</span>
                                <div style={s.levelInputRow}>
                                    <input
                                        type="text"
                                        value={fauxMinLevel}
                                        onChange={(e) =>
                                            setFauxMinLevel(e.target.value)
                                        }
                                        onBlur={(e) => {
                                            if (!/^\d+$/.test(e.target.value)) {
                                                setFauxMinLevel(
                                                    MIN_LEVEL.toString()
                                                )
                                            } else if (
                                                parseInt(e.target.value) >
                                                MAX_LEVEL
                                            ) {
                                                setFauxMinLevel(
                                                    MAX_LEVEL.toString()
                                                )
                                            } else if (
                                                parseInt(e.target.value) <
                                                MIN_LEVEL
                                            ) {
                                                setFauxMinLevel(
                                                    MIN_LEVEL.toString()
                                                )
                                            }
                                        }}
                                        style={s.levelInput}
                                        tabIndex={2}
                                    />
                                    <span style={s.whiteText}>to</span>
                                    <input
                                        type="text"
                                        value={fauxMaxLevel}
                                        onChange={(e) =>
                                            setFauxMaxLevel(e.target.value)
                                        }
                                        onBlur={(e) => {
                                            if (!/^\d+$/.test(e.target.value)) {
                                                setFauxMaxLevel(
                                                    MAX_LEVEL.toString()
                                                )
                                            } else if (
                                                parseInt(e.target.value) >
                                                MAX_LEVEL
                                            ) {
                                                setFauxMaxLevel(
                                                    MAX_LEVEL.toString()
                                                )
                                            } else if (
                                                parseInt(e.target.value) <
                                                minLevel
                                            ) {
                                                setFauxMaxLevel(
                                                    minLevel.toString()
                                                )
                                            }
                                        }}
                                        style={s.levelInput}
                                        tabIndex={3}
                                    />
                                </div>
                            </div>
                            <div style={s.groupViewGroup}>
                                <span style={s.yellowText}>Group View:</span>
                                <label
                                    style={s.checkboxLabel}
                                    onClick={() =>
                                        setIsGroupView((prev) => !prev)
                                    }
                                >
                                    <SpriteCheckbox
                                        checked={isGroupView}
                                        type="groupView"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Exact match and stats row */}
                        <div style={s.row}>
                            <label
                                style={s.checkboxLabel}
                                onClick={() => setIsExactMatch((prev) => !prev)}
                            >
                                <SpriteCheckbox
                                    checked={isExactMatch}
                                    type="normal"
                                />
                                <span style={s.whiteText}>Exact Match</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div style={s.statsRow}>
                    <span style={s.statPair}>
                        <span style={s.yellowText}>Online:</span>
                        <span style={s.whiteText}>{allCharacterCount}</span>
                    </span>
                    <span style={s.statSpacer} />
                    <span style={s.statPair}>
                        <span style={s.yellowText}>Anonymous:</span>
                        <span style={s.whiteText}>
                            {anonymousCharacterCount}
                        </span>
                    </span>
                    <span style={s.statSpacer} />
                    <span style={s.statPair}>
                        <span style={s.yellowText}>Displaying:</span>
                        <span style={s.whiteText}>
                            {displayedCharacterCount}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    )
}

/** Renders a sprite-sheet class filter icon as a clipped canvas */
const SpriteImage = ({
    spriteData,
    selected,
}: {
    spriteData: { x: number; y: number; width: number; height: number }
    selected: boolean
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [image, setImage] = useState<HTMLImageElement | null>(null)

    useEffect(() => {
        const img = new Image()
        img.src = LfmSprite
        img.onload = () => setImage(img)
    }, [])

    useEffect(() => {
        if (!image || !canvasRef.current) return
        const ctx = canvasRef.current.getContext("2d")
        if (!ctx) return
        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, spriteData.width, spriteData.height)
        ctx.drawImage(
            image,
            spriteData.x,
            spriteData.y + (selected ? 29 : 0),
            spriteData.width,
            spriteData.height,
            0,
            0,
            spriteData.width,
            spriteData.height
        )
    }, [image, spriteData, selected])

    return (
        <canvas
            ref={canvasRef}
            width={spriteData.width}
            height={spriteData.height}
            style={{ display: "block" }}
        />
    )
}

/** Renders a sprite-sheet checkbox */
const SpriteCheckbox = ({
    checked,
    type,
}: {
    checked: boolean
    type: "normal" | "groupView"
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [image, setImage] = useState<HTMLImageElement | null>(null)

    const spriteSource =
        type === "groupView"
            ? SPRITE_MAP.GROUP_VIEW_CHECKBOX
            : SPRITE_MAP.CHECKBOX
    const variant = checked ? "CHECKED" : "UNCHECKED"
    const spriteData = spriteSource[variant]

    useEffect(() => {
        const img = new Image()
        img.src = LfmSprite
        img.onload = () => setImage(img)
    }, [])

    useEffect(() => {
        if (!image || !canvasRef.current) return
        const ctx = canvasRef.current.getContext("2d")
        if (!ctx) return
        ctx.imageSmoothingEnabled = false
        ctx.clearRect(0, 0, spriteData.width, spriteData.height)
        ctx.drawImage(
            image,
            spriteData.x,
            spriteData.y,
            spriteData.width,
            spriteData.height,
            0,
            0,
            spriteData.width,
            spriteData.height
        )
    }, [image, spriteData])

    return (
        <canvas
            ref={canvasRef}
            width={spriteData.width}
            height={spriteData.height}
            style={{ display: "block", cursor: "pointer" }}
        />
    )
}

function getStyles(isMobile: boolean): Record<string, React.CSSProperties> {
    const fontSize = isMobile ? "12px" : "16px"
    const inputFontSize = isMobile ? "12px" : "14px"
    const inputPadding = isMobile ? "1px 3px" : "2px 4px"

    return {
        container: {
            background: WHO_COLORS.BLACK_BACKGROUND,
            padding: isMobile ? "8px 8px 0px 8px" : "16px 18px 0px 18px",
            fontFamily: "'Trebuchet MS', sans-serif",
        },
        innerBorder: {
            position: "relative",
            padding: isMobile ? "10px 8px" : "20px 14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: isMobile ? "4px" : "6px",
        },
        row: {
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "8px" : "12px",
        },
        sharedWidthWrapper: {
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "4px" : "6px",
        },
        centeredGroup: {
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "4px" : "6px",
        },
        classFiltersRow: {
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexWrap: "wrap",
        },
        classFilterButton: {
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            lineHeight: 0,
        },
        searchRow: {
            display: "flex",
            alignItems: "flex-start",
            gap: isMobile ? "10px" : "20px",
            rowGap: isMobile ? "4px" : "5px",
            flexWrap: "wrap",
        },
        searchGroup: {
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "2px" : "4px",
            minWidth: 0,
        },
        levelGroup: {
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "2px" : "4px",
        },
        levelInputRow: {
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "4px" : "6px",
        },
        groupViewGroup: {
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "2px" : "4px",
        },
        searchInput: {
            background: "#000",
            border: `1px solid ${WHO_COLORS.FADED_WHITE}`,
            color: "var(--text)",
            outline: "none",
            fontSize: inputFontSize,
            padding: inputPadding,
            maxWidth: "100%",
            boxSizing: "border-box",
            fontFamily: "'Trebuchet MS', sans-serif",
        },
        levelInput: {
            background: "#000",
            border: `1px solid ${WHO_COLORS.FADED_WHITE}`,
            color: "var(--text)",
            outline: "none",
            fontSize: inputFontSize,
            padding: inputPadding,
            width: isMobile ? "24px" : "30px",
            textAlign: "center",
            fontFamily: "'Trebuchet MS', sans-serif",
        },
        checkboxLabel: {
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "3px" : "5px",
            cursor: "pointer",
        },
        statsRow: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? "4px" : "6px",
            marginTop: isMobile ? "2px" : "4px",
            flexWrap: "wrap",
        },
        statSpacer: {
            width: isMobile ? "6px" : "12px",
        },
        statPair: {
            display: "inline-flex",
            alignItems: "center",
            gap: isMobile ? "4px" : "6px",
            whiteSpace: "nowrap",
        },
        yellowText: {
            color: WHO_COLORS.YELLOW_TEXT,
            fontSize,
        },
        whiteText: {
            color: WHO_COLORS.WHITE_TEXT,
            fontSize,
        },
    }
}

export default WhoFilterZone
