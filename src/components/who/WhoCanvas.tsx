import React, { useEffect, useMemo, useRef, useState } from "react"
import { Character } from "../../models/Character.ts"
// import { MAX_LEVEL, MIN_LEVEL } from "../../constants/game.ts"
import { useWhoContext } from "../../contexts/WhoContext.tsx"
// import Checkbox from "../global/Checkbox.tsx"
import {
    CHARACTER_HEIGHT,
    FILTER_ZONE_CONTENT_HEIGHT,
    GROUP_COLORS,
    INPUT_BOX_HEIGHT,
    MAXIMUM_CHARACTER_COUNT,
    MINIMUM_CHARACTER_COUNT,
} from "../../constants/whoPanel.ts"
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '../../assets/png/lfm_sprite.png'.
import LfmSprite from "../../assets/png/lfm_sprite.png"
import useRenderWhoPanel from "../../hooks/useRenderWhoPanel.ts"
import useRenderCharacter from "../../hooks/useRenderCharacter.ts"
import { calculateCommonFilterBoundingBoxes } from "../../utils/whoUtils.ts"
import { MAX_LEVEL, MIN_LEVEL } from "../../constants/game.ts"

interface Props {
    allCharacters: Character[]
    curatedCharacters: Character[]
    serverName: string
    areResultsTruncated: boolean
}

const WhoCanvas: React.FC<Props> = ({
    allCharacters = [],
    curatedCharacters = [],
    serverName = "",
    areResultsTruncated = false,
}) => {
    const {
        panelWidth,
        isDynamicWidth,
        setPanelHeight,
        classNameFilter,
        stringFilter,
        setStringFilter,
        minLevel,
        setMinLevel,
        maxLevel,
        setMaxLevel,
        isGroupView,
    } = useWhoContext()
    const {
        lfmHeaderBoundingBox,
        searchInputBoundingBox,
        levelRangeLowerInputBoundingBox,
        levelRangeUpperInputBoundingBox,
        searchInputBoxWidth,
        levelRangeInputBoxWidth,
    } = useMemo(
        () => calculateCommonFilterBoundingBoxes(panelWidth),
        [panelWidth]
    )
    const [fauxMinLevel, setFauxMinLevel] = useState<string>(
        minLevel.toString()
    )
    const [fauxMaxLevel, setFauxMaxLevel] = useState<string>(
        maxLevel.toString()
    )

    useEffect(() => {
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

    // const printColor = useRef<string>(GROUP_COLORS[0])
    // const printColorIndex = useRef<number>(0)

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

    // TODO: record last render state in useRef

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
        whoPanelRef.current.width = panelWidth
        whoPanelRef.current.height = panelHeight
        whoCharactersRef.current.width = panelWidth
        whoCharactersRef.current.height = panelHeight
    }, [panelWidth, panelHeight])

    // Render the who panel
    useEffect(() => {
        if (!image) return

        let panelRendered = false
        let charactersRendered = false
        let truncatedMessageRendered = false

        // TODO: check if panel should be rendered
        renderWhoPanel({
            characters: allCharacters,
            displayedCharacters: curatedCharacters,
        })
        panelRendered = true

        const whoPanelContext = whoCharactersRef.current.getContext("2d")
        whoPanelContext?.clearRect(0, 0, panelWidth, panelHeight)
        whoPanelContext?.translate(
            lfmHeaderBoundingBox.x,
            lfmHeaderBoundingBox.bottom() + 2
        )
        let colorIndex = 0
        let currentBackgroundColor = ""
        curatedCharacters.forEach((character, index) => {
            // TODO: check if character should be rendered
            if (isGroupView) {
                if (
                    index > 0 &&
                    character.group_id !== curatedCharacters[index - 1].group_id
                ) {
                    colorIndex++
                }
                currentBackgroundColor =
                    GROUP_COLORS[colorIndex % GROUP_COLORS.length]
            }
            renderCharacter({
                character,
                backgroundColorOverride: currentBackgroundColor,
            })
            charactersRendered = true
            whoPanelContext?.translate(0, CHARACTER_HEIGHT)
        })
        whoPanelContext?.resetTransform()

        // render truncated message
        if (whoPanelContext && areResultsTruncated) {
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
                `Showing the first ${MAXIMUM_CHARACTER_COUNT} of ${allCharacters.length} characters`,
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
    }, [
        renderWhoPanel,
        allCharacters,
        curatedCharacters,
        image,
        mainCanvasRef,
        whoPanelRef,
        whoCharactersRef,
        classNameFilter,
    ])

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = mainCanvasRef.current?.getBoundingClientRect()
        if (!rect) return
        if (!mainCanvasRef.current) return

        // scale x and y based on the canvas size
        const scaleX =
            mainCanvasRef.current.width / mainCanvasRef.current.clientWidth
        const scaleY =
            mainCanvasRef.current.height / mainCanvasRef.current.clientHeight

        const x = (e.clientX - rect.left) * scaleX
        const y = (e.clientY - rect.top) * scaleY

        console.log(x, y)
    }

    return (
        <div style={{ position: "relative" }}>
            <input
                className="transparent-input"
                style={{
                    position: "absolute",
                    left: searchInputBoundingBox.x,
                    top: searchInputBoundingBox.y,
                    width: searchInputBoxWidth,
                    height: INPUT_BOX_HEIGHT,
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
                    left: levelRangeLowerInputBoundingBox.x,
                    top: levelRangeLowerInputBoundingBox.y,
                    width: levelRangeInputBoxWidth,
                    height: INPUT_BOX_HEIGHT,
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
                    left: levelRangeUpperInputBoundingBox.x,
                    top: levelRangeUpperInputBoundingBox.y,
                    width: levelRangeInputBoxWidth,
                    height: INPUT_BOX_HEIGHT,
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
                // onMouseMove={handleCanvasMouseMove}
                // onMouseLeave={handleCanvasMouseLeave}
            />
        </div>
    )
}

export default WhoCanvas
