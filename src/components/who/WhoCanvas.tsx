import React from "react"
import { Character } from "../../models/Character.ts"
import { MAX_LEVEL, MIN_LEVEL } from "../../constants/game.ts"
import { useWhoContext } from "../../contexts/WhoContext.tsx"

interface Props {
    characters: Character[]
    serverName: string
}

const WhoCanvas: React.FC<Props> = ({ characters = [], serverName = "" }) => {
    const { setStringFilter, minLevel, setMinLevel, maxLevel, setMaxLevel } =
        useWhoContext()

    return (
        <div>
            <input
                type="text"
                onChange={(e) => setStringFilter(e.target.value)}
            />
            <input
                type="number"
                placeholder="Min Level"
                value={minLevel}
                onChange={(e) => setMinLevel(parseInt(e.target.value))}
                min={MIN_LEVEL}
                max={MAX_LEVEL}
            />
            <input
                type="number"
                placeholder="Max Level"
                value={maxLevel}
                onChange={(e) => setMaxLevel(parseInt(e.target.value))}
                min={MIN_LEVEL}
                max={MAX_LEVEL}
            />
            <h1>{serverName}</h1>
            {characters.map((character) => (
                <div key={character.id}>
                    {character.name} - {character.guild_name} -{" "}
                    {character.total_level}
                </div>
            ))}
        </div>
    )
}

export default WhoCanvas
