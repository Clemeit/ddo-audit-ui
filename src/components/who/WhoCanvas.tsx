import React, { useEffect, useMemo, useRef, useState } from "react"
import { Character, CharacterSortType } from "../../models/Character.ts"
// import { MAX_LEVEL, MIN_LEVEL } from "../../constants/game.ts"
import { useWhoContext } from "../../contexts/WhoContext.tsx"
// import Checkbox from "../global/Checkbox.tsx"
import {
    CHARACTER_HEIGHT,
    CLASS_FILTER_GAP,
    FILTER_ZONE_CONTENT_HEIGHT,
    GROUP_BACKGROUND_COLORS,
    GROUP_EDGE_COLORS,
    MINIMUM_CHARACTER_COUNT,
} from "../../constants/whoPanel.ts"
import LfmSprite from "../../assets/png/lfm_sprite_6.webp"
import useRenderWhoPanel from "../../hooks/useRenderWhoPanel.ts"
import useRenderCharacter from "../../hooks/useRenderCharacter.ts"
import {
    areCharactersEquivalent,
    calculateCommonFilterBoundingBoxes,
} from "../../utils/whoUtils.ts"
import { CLASS_LIST_LOWER, MAX_LEVEL, MIN_LEVEL } from "../../constants/game.ts"
import { BoundingBox } from "../../models/Geometry.ts"
import { SPRITE_MAP } from "../../constants/spriteMap.ts"
import { useAreaContext } from "../../contexts/AreaContext.tsx"

interface Props {
    allCharacters: Character[]
    curatedCharacters: Character[]
    serverName: string
    areResultsTruncated: boolean
    isLoading: boolean
}

const WhoCanvas = ({
    allCharacters = [],
    curatedCharacters = [],
    serverName = "",
    areResultsTruncated = false,
    isLoading,
}: Props) => {
    const {
        panelWidth,
        isDynamicWidth,
        setPanelHeight,
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
        sortBy,
        setSortBy,
        showInQuestIndicator,
        showQuestName,
        maximumRenderedCharacterCount,
        shouldSaveLevelFilter,
        shouldSaveSettings,
    } = useWhoContext()
    const {
        lfmHeaderBoundingBox,
        nameHeaderBoundingBox,
        classHeaderBoundingBox,
        levelHeaderBoundingBox,
        guildHeaderBoundingBox,
        searchInputBoundingBox,
        levelRangeLowerInputBoundingBox,
        levelRangeUpperInputBoundingBox,
        searchInputBoxWidth,
        levelRangeInputBoxWidth,
        groupViewCheckboxBoundingBox,
        anyCheckboxBoundingBox,
        classFiltersBoundingBox,
        exactMatchCheckboxBoundingBox,
    } = useMemo(
        () => calculateCommonFilterBoundingBoxes(panelWidth),
        [panelWidth]
    )
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

    const panelHeight = useMemo(() => {
        const height =
            CHARACTER_HEIGHT *
                Math.max(MINIMUM_CHARACTER_COUNT, curatedCharacters.length) +
            FILTER_ZONE_CONTENT_HEIGHT +
            135 // TODO: figure out why 135 works
        setPanelHeight(height)
        return height
    }, [curatedCharacters])

    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const mainCanvasRef = useRef<HTMLCanvasElement>(null)
    const whoPanelRef = useRef<HTMLCanvasElement>(
        document.createElement("canvas")
    )
    const whoCharactersRef = useRef<HTMLCanvasElement>(
        document.createElement("canvas")
    )

    const renderWhoPanel = useRenderWhoPanel({
        sprite: image,
        context: whoPanelRef.current.getContext("2d"),
    })
    const renderCharacter = useRenderCharacter({
        sprite: image,
        context: whoCharactersRef.current.getContext("2d"),
    })

    const { areas } = useAreaContext()

    const [previousState, setPreviousState] = useState({
        onlineCharacterCount: -1,
        anonymousCharacterCount: 0,
        curatedCharacters,
        panelWidth,
        panelHeight,
        sortBy,
        classNameFilter,
        isGroupView,
        isExactMatch,
        stringFilter,
        minLevel,
        maxLevel,
        truncatedMessage: "",
        showInQuestIndicator,
        showQuestName,
        areas,
    })

    // Load the lfm sprite
    useEffect(() => {
        const img = new Image()
        img.src = LfmSprite
        img.onload = () => {
            setImage(img)
        }
    }, [])

    useEffect(() => {
        const setLevelTimeout = setTimeout(() => {
            if (shouldSaveSettings && shouldSaveLevelFilter) {
                setFauxMinLevel(String(minLevel))
                setFauxMaxLevel(String(maxLevel))
            }
            loadedLevels.current = true
        }, 100)
        return () => clearTimeout(setLevelTimeout)
    }, [
        shouldSaveSettings,
        shouldSaveLevelFilter,
        setFauxMinLevel,
        setFauxMaxLevel,
    ])

    // Set the canvases to the correct size
    useEffect(() => {
        whoPanelRef.current.width = panelWidth
        whoPanelRef.current.height = panelHeight
        whoCharactersRef.current.width = panelWidth
        whoCharactersRef.current.height = panelHeight
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

    // Render the who list
    useEffect(() => {
        if (!image) return
        if (!mainCanvasRef.current) return
        if (!whoPanelRef.current) return
        if (!whoCharactersRef.current) return

        const anonymousCharacterCount = allCharacters.filter(
            (c) => c.is_anonymous
        ).length

        let panelRendered = false
        let charactersRendered = false
        let truncatedMessageRendered = false
        let numberOfCharactersRendered = 0
        const shouldRenderWhoPanel =
            isLoading ||
            previousState.onlineCharacterCount !== allCharacters.length ||
            previousState.anonymousCharacterCount !== anonymousCharacterCount ||
            previousState.curatedCharacters.length !==
                curatedCharacters.length ||
            previousState.panelWidth !== panelWidth ||
            previousState.panelHeight !== panelHeight ||
            previousState.sortBy !== sortBy ||
            previousState.classNameFilter !== classNameFilter ||
            previousState.isGroupView !== isGroupView ||
            previousState.isExactMatch !== isExactMatch ||
            previousState.stringFilter !== stringFilter ||
            previousState.minLevel !== minLevel ||
            previousState.maxLevel !== maxLevel ||
            previousState.areas !== areas

        if (shouldRenderWhoPanel) {
            renderWhoPanel({
                characters: allCharacters,
                displayedCharacters: curatedCharacters,
                panelHeight,
                isLoading,
            })
            panelRendered = true
        }

        const whoPanelContext = whoCharactersRef.current.getContext("2d")
        const renderAllCharacters =
            previousState.curatedCharacters.length !==
                curatedCharacters.length ||
            previousState.showInQuestIndicator !== showInQuestIndicator ||
            previousState.showQuestName !== showQuestName ||
            previousState.areas !== areas
        if (renderAllCharacters) {
            whoPanelContext?.clearRect(0, 0, panelWidth, panelHeight)
        }
        whoPanelContext?.translate(
            lfmHeaderBoundingBox.x,
            lfmHeaderBoundingBox.bottom() + 2
        )
        let colorIndex = 0
        let currentBackgroundColor: string | undefined = undefined
        let currentEdgeColor: string | undefined = undefined
        let currentCharacterGroupIndex = 0
        curatedCharacters.forEach((character, index) => {
            if (isGroupView) {
                if (
                    index > 0 &&
                    character.group_id !== curatedCharacters[index - 1].group_id
                ) {
                    colorIndex++
                    currentCharacterGroupIndex = 0
                }
                currentBackgroundColor =
                    GROUP_BACKGROUND_COLORS[
                        colorIndex % GROUP_BACKGROUND_COLORS.length
                    ]
                currentEdgeColor =
                    GROUP_EDGE_COLORS[
                        colorIndex % GROUP_BACKGROUND_COLORS.length
                    ]

                currentCharacterGroupIndex++
            }
            const shouldRenderCharacter =
                renderAllCharacters ||
                !previousState.curatedCharacters ||
                previousState.curatedCharacters.length === 0 ||
                previousState.curatedCharacters[
                    Math.min(index, previousState.curatedCharacters.length - 1)
                ].id !== character.id ||
                previousState.isGroupView !== isGroupView ||
                !areCharactersEquivalent(
                    previousState.curatedCharacters[index],
                    character
                )
            if (shouldRenderCharacter) {
                renderCharacter({
                    character,
                    backgroundColorOverride: currentBackgroundColor,
                    edgeColorOverride: currentEdgeColor,
                    characterIndex: currentCharacterGroupIndex,
                })
                charactersRendered = true
                numberOfCharactersRendered++
            }
            whoPanelContext?.translate(0, CHARACTER_HEIGHT)
        })
        whoPanelContext?.resetTransform()

        // render truncated message
        const truncatedMessage = `Showing the first ${maximumRenderedCharacterCount} of ${allCharacters.length} characters`
        if (
            whoPanelContext &&
            areResultsTruncated &&
            truncatedMessage !== previousState.truncatedMessage
        ) {
            whoPanelContext.globalAlpha = 0.8
            whoPanelContext.fillStyle = "black"
            whoPanelContext.fillRect(
                panelWidth / 2 - 150,
                panelHeight - 70,
                300,
                40
            )
            whoPanelContext.fillStyle = "white"
            whoPanelContext.font = "16px Arial"
            whoPanelContext.textBaseline = "middle"
            whoPanelContext.textAlign = "center"
            whoPanelContext.fillText(
                truncatedMessage,
                panelWidth / 2,
                panelHeight - 50
            )
            truncatedMessageRendered = true
            whoPanelContext.globalAlpha = 1
        }

        if (panelRendered || charactersRendered || truncatedMessageRendered) {
            const mainContext = mainCanvasRef.current?.getContext("2d")
            if (mainContext) {
                // mainContext.clearRect(0, 0, panelWidth, panelHeight)
                mainContext.imageSmoothingEnabled = false
                mainContext.drawImage(whoPanelRef.current, 0, 0)
                mainContext.drawImage(whoCharactersRef.current, 0, 0)
            }
        }

        setPreviousState({
            onlineCharacterCount: allCharacters.length,
            anonymousCharacterCount: anonymousCharacterCount,
            curatedCharacters,
            panelWidth,
            panelHeight,
            sortBy,
            classNameFilter,
            isGroupView,
            isExactMatch,
            stringFilter,
            minLevel,
            maxLevel,
            truncatedMessage,
            showInQuestIndicator,
            showQuestName,
            areas,
        })
    }, [
        allCharacters,
        curatedCharacters,
        image,
        mainCanvasRef,
        whoPanelRef,
        whoCharactersRef,
        classNameFilter,
        isGroupView,
        isExactMatch,
        sortBy,
        showInQuestIndicator,
        showQuestName,
        areas,
    ])

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = mainCanvasRef.current?.getBoundingClientRect()
        if (!rect) return
        if (!mainCanvasRef.current) return

        const x = (e.clientX - rect.left) * canvasScaleWidth
        const y = (e.clientY - rect.top) * canvasScaleHeight

        // group view checkbox
        if (
            x >= groupViewCheckboxBoundingBox.x - 2 &&
            x <= groupViewCheckboxBoundingBox.right() + 4 &&
            y >= groupViewCheckboxBoundingBox.y - 2 &&
            y <= groupViewCheckboxBoundingBox.bottom() + 4
        ) {
            setIsGroupView((prev) => !prev)
        }

        // "any" checkbox
        if (
            x >= anyCheckboxBoundingBox.x &&
            x <= anyCheckboxBoundingBox.right() + 30 &&
            y >= anyCheckboxBoundingBox.y &&
            y <= anyCheckboxBoundingBox.bottom()
        ) {
            if (classNameFilter.length !== CLASS_LIST_LOWER.length) {
                setClassNameFilter(CLASS_LIST_LOWER)
            } else {
                setClassNameFilter([])
            }
        }

        // exact match checkbox
        if (
            x >= exactMatchCheckboxBoundingBox.x &&
            x <= exactMatchCheckboxBoundingBox.right() + 80 &&
            y >= exactMatchCheckboxBoundingBox.y &&
            y <= exactMatchCheckboxBoundingBox.bottom()
        ) {
            setIsExactMatch((prev) => !prev)
        }

        // class filters
        for (let i = 0; i < CLASS_LIST_LOWER.length; i++) {
            const classFilterBoundingBox = new BoundingBox(
                classFiltersBoundingBox.x +
                    i *
                        (CLASS_FILTER_GAP +
                            SPRITE_MAP.CLASS_FILTER.FIGHTER.width),
                classFiltersBoundingBox.y,
                SPRITE_MAP.CLASS_FILTER.FIGHTER.width,
                SPRITE_MAP.CLASS_FILTER.FIGHTER.height
            )
            if (
                x >= classFilterBoundingBox.x &&
                x <= classFilterBoundingBox.right() &&
                y >= classFilterBoundingBox.y &&
                y <= classFilterBoundingBox.bottom()
            ) {
                const newClassNameFilter = [...classNameFilter]
                if (classNameFilter.includes(CLASS_LIST_LOWER[i])) {
                    newClassNameFilter.splice(
                        newClassNameFilter.indexOf(CLASS_LIST_LOWER[i]),
                        1
                    )
                } else {
                    newClassNameFilter.push(CLASS_LIST_LOWER[i])
                }
                setClassNameFilter(newClassNameFilter)
            }
        }

        // sort by lfm header
        if (
            x >= lfmHeaderBoundingBox.x &&
            x <= lfmHeaderBoundingBox.right() &&
            y >= lfmHeaderBoundingBox.y &&
            y <= lfmHeaderBoundingBox.bottom()
        ) {
            if (sortBy.type === CharacterSortType.Lfm) {
                setSortBy((prev) => ({
                    type: CharacterSortType.Lfm,
                    ascending: !prev.ascending,
                }))
            } else {
                setSortBy({ type: CharacterSortType.Lfm, ascending: true })
            }
        }

        // sort by name header
        if (
            x >= nameHeaderBoundingBox.x &&
            x <= nameHeaderBoundingBox.right() &&
            y >= nameHeaderBoundingBox.y &&
            y <= nameHeaderBoundingBox.bottom()
        ) {
            if (sortBy.type === CharacterSortType.Name) {
                setSortBy((prev) => ({
                    type: CharacterSortType.Name,
                    ascending: !prev.ascending,
                }))
            } else {
                setSortBy({ type: CharacterSortType.Name, ascending: true })
            }
        }

        // sort by class header
        if (
            x >= classHeaderBoundingBox.x &&
            x <= classHeaderBoundingBox.right() &&
            y >= classHeaderBoundingBox.y &&
            y <= classHeaderBoundingBox.bottom()
        ) {
            if (sortBy.type === CharacterSortType.Class) {
                setSortBy((prev) => ({
                    type: CharacterSortType.Class,
                    ascending: !prev.ascending,
                }))
            } else {
                setSortBy({ type: CharacterSortType.Class, ascending: true })
            }
        }

        // sort by level header
        if (
            x >= levelHeaderBoundingBox.x &&
            x <= levelHeaderBoundingBox.right() &&
            y >= levelHeaderBoundingBox.y &&
            y <= levelHeaderBoundingBox.bottom()
        ) {
            if (sortBy.type === CharacterSortType.Level) {
                setSortBy((prev) => ({
                    type: CharacterSortType.Level,
                    ascending: !prev.ascending,
                }))
            } else {
                setSortBy({ type: CharacterSortType.Level, ascending: true })
            }
        }

        // sort by guild header
        if (
            x >= guildHeaderBoundingBox.x &&
            x <= guildHeaderBoundingBox.right() &&
            y >= guildHeaderBoundingBox.y &&
            y <= guildHeaderBoundingBox.bottom()
        ) {
            if (sortBy.type === CharacterSortType.Guild) {
                setSortBy((prev) => ({
                    type: CharacterSortType.Guild,
                    ascending: !prev.ascending,
                }))
            } else {
                setSortBy({ type: CharacterSortType.Guild, ascending: true })
            }
        }
    }

    return (
        <div style={{ position: "relative" }}>
            {image && (
                <>
                    <input
                        className="transparent-input"
                        style={{
                            position: "absolute",
                            left: `${((searchInputBoundingBox.x + searchInputBoundingBox.width / 2) / panelWidth) * 100}%`,
                            top: `${((searchInputBoundingBox.y + searchInputBoundingBox.height / 2) / panelHeight) * 100}%`,
                            width: `${(searchInputBoxWidth / panelWidth) * 100}%`,
                            transform: "translate(-50%, calc(-50% - 1px))",
                            fontSize: `${23 - Math.round(canvasScaleWidth * 6)}px`,
                        }}
                        type="text"
                        onChange={(e) => setStringFilter(e.target.value)}
                        value={stringFilter}
                        tabIndex={1}
                    />
                    <input
                        className="transparent-input"
                        style={{
                            position: "absolute",
                            left: `${((levelRangeLowerInputBoundingBox.x + levelRangeLowerInputBoundingBox.width / 2) / panelWidth) * 100}%`,
                            top: `${((levelRangeLowerInputBoundingBox.y + levelRangeLowerInputBoundingBox.height / 2) / panelHeight) * 100}%`,
                            transform: "translate(-50%, calc(-50% - 1px))",
                            width: `${levelRangeInputBoxWidth}px`,
                            height: "20px",
                            fontSize: `${23 - Math.round(canvasScaleWidth * 6)}px`,
                            textAlign: "center",
                        }}
                        type="text"
                        onChange={(e) => setFauxMinLevel(e.target.value)}
                        value={fauxMinLevel}
                        onBlur={(e) => {
                            if (!/^\d+$/.test(e.target.value)) {
                                setFauxMinLevel(MIN_LEVEL.toString())
                            } else if (parseInt(e.target.value) > MAX_LEVEL) {
                                setFauxMinLevel(MAX_LEVEL.toString())
                            } else if (parseInt(e.target.value) < MIN_LEVEL) {
                                setFauxMinLevel(MIN_LEVEL.toString())
                            }
                        }}
                        tabIndex={2}
                    />
                    <input
                        className="transparent-input"
                        style={{
                            position: "absolute",
                            left: `${((levelRangeUpperInputBoundingBox.x + levelRangeUpperInputBoundingBox.width / 2) / panelWidth) * 100}%`,
                            top: `${((levelRangeUpperInputBoundingBox.y + levelRangeUpperInputBoundingBox.height / 2) / panelHeight) * 100}%`,
                            transform: "translate(-50%, calc(-50% - 1px))",
                            width: `${levelRangeInputBoxWidth}px`,
                            height: "20px",
                            fontSize: `${23 - Math.round(canvasScaleWidth * 6)}px`,
                            textAlign: "center",
                        }}
                        type="text"
                        onChange={(e) => setFauxMaxLevel(e.target.value)}
                        value={fauxMaxLevel}
                        onBlur={(e) => {
                            if (!/^\d+$/.test(e.target.value)) {
                                setFauxMaxLevel(MAX_LEVEL.toString())
                            } else if (parseInt(e.target.value) > MAX_LEVEL) {
                                setFauxMaxLevel(MAX_LEVEL.toString())
                            } else if (parseInt(e.target.value) < minLevel) {
                                setFauxMaxLevel(minLevel.toString())
                            }
                        }}
                        tabIndex={3}
                    />
                </>
            )}
            <canvas
                ref={mainCanvasRef}
                id="who-canvas"
                width={panelWidth}
                height={panelHeight}
                style={{
                    maxWidth: "100%",
                    width: isDynamicWidth ? "100%" : "unset",
                }}
                onClick={handleCanvasClick}
                // onMouseMove={handleCanvasMouseMove}
                // onMouseLeave={handleCanvasMouseLeave}
            />
        </div>
    )
}

export default WhoCanvas
