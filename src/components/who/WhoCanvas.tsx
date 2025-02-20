import React, { useEffect, useMemo, useRef, useState } from "react"
import { Character } from "../../models/Character.ts"
// import { MAX_LEVEL, MIN_LEVEL } from "../../constants/game.ts"
import { useWhoContext } from "../../contexts/WhoContext.tsx"
// import Checkbox from "../global/Checkbox.tsx"
import {
    CHARACTER_HEIGHT,
    // GROUP_COLORS,
    MAXIMUM_CHARACTER_COUNT,
    MINIMUM_CHARACTER_COUNT,
} from "../../constants/whoPanel.ts"
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module '../../assets/png/lfm_sprite.png'.
import LfmSprite from "../../assets/png/lfm_sprite.png"
import useRenderWhoPanel from "../../hooks/useRenderWhoPanel.ts"

interface Props {
    characters: Character[]
    serverName: string
}

const WhoCanvas: React.FC<Props> = ({ characters = [], serverName = "" }) => {
    const { panelWidth, isDynamicWidth, setPanelHeight } = useWhoContext()

    const panelHeight = useMemo(() => {
        const height =
            CHARACTER_HEIGHT *
            Math.min(
                MAXIMUM_CHARACTER_COUNT,
                Math.max(MINIMUM_CHARACTER_COUNT, characters.length)
            )
        setPanelHeight(height)
        return height
    }, [characters])

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
        // let charactersRendered = false

        renderWhoPanel()
        panelRendered = true

        if (panelRendered) {
            const mainContext = mainCanvasRef.current?.getContext("2d")
            if (mainContext) {
                // mainContext.clearRect(0, 0, panelWidth, panelHeight)
                mainContext.imageSmoothingEnabled = false
                mainContext.drawImage(whoPanelRef.current, 0, 0)
            }
        }
    }, [
        renderWhoPanel,
        characters,
        image,
        mainCanvasRef,
        whoPanelRef,
        whoCharactersRef,
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
            // onClick={handleCanvasClick}
            // onMouseMove={handleCanvasMouseMove}
            // onMouseLeave={handleCanvasMouseLeave}
        />
        // <div>
        //     <input
        //         type="text"
        //         onChange={(e) => setStringFilter(e.target.value)}
        //     />
        //     <input
        //         type="number"
        //         placeholder="Min Level"
        //         value={minLevel}
        //         onChange={(e) => setMinLevel(parseInt(e.target.value))}
        //         min={MIN_LEVEL}
        //         max={MAX_LEVEL}
        //     />
        //     <input
        //         type="number"
        //         placeholder="Max Level"
        //         value={maxLevel}
        //         onChange={(e) => setMaxLevel(parseInt(e.target.value))}
        //         min={MIN_LEVEL}
        //         max={MAX_LEVEL}
        //     />
        //     <Checkbox
        //         checked={isGroupView}
        //         onChange={(e) => setIsGroupView(e.target.checked)}
        //     >
        //         Group View
        //     </Checkbox>

        //     <table>
        //         <thead>
        //             <tr>
        //                 <th>Name</th>
        //                 <th>Level</th>
        //                 <th>Class</th>
        //                 <th>Location</th>
        //                 <th>Guild Name</th>
        //             </tr>
        //         </thead>
        //         <tbody>
        //             {characters.map((character, index) => {
        //                 if (index === 0) {
        //                     printColor.current = GROUP_COLORS[0]
        //                     printColorIndex.current = 0
        //                 }
        //                 if (
        //                     index > 0 &&
        //                     character.group_id !==
        //                         characters[index - 1].group_id
        //                 ) {
        //                     printColorIndex.current++
        //                     printColor.current =
        //                         GROUP_COLORS[
        //                             printColorIndex.current %
        //                                 GROUP_COLORS.length
        //                         ]
        //                 }
        //                 return (
        //                     <tr
        //                         key={character.id}
        //                         style={{
        //                             backgroundColor: isGroupView
        //                                 ? printColor.current
        //                                 : "",
        //                         }}
        //                     >
        //                         {character.is_anonymous ? (
        //                             <td
        //                                 colSpan={99}
        //                                 style={{
        //                                     textAlign: "center",
        //                                 }}
        //                             >
        //                                 Anonymous character
        //                             </td>
        //                         ) : (
        //                             <>
        //                                 <td>{character.name}</td>
        //                                 <td>{character.total_level}</td>
        //                                 <td>
        //                                     {character.classes
        //                                         ?.map(
        //                                             (c) =>
        //                                                 `${c.level} ${c.name}`
        //                                         )
        //                                         .join(", ")}
        //                                 </td>
        //                                 <td>{character.location?.name}</td>
        //                                 <td>{character.guild_name}</td>
        //                             </>
        //                         )}
        //                     </tr>
        //                 )
        //             })}
        //         </tbody>
        //     </table>
        // </div>
    )
}

export default WhoCanvas
