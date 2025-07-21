import { useEffect, useState } from "react"
import { Character } from "../models/Character"
import { getCharacterRaidActivityByIds } from "../services/activityService"

interface Props {
    verifiedCharacters: Character[]
}

interface QuestInstances {
    timestamp: string
    quest_ids: number[]
}

interface CharacterTimers {
    character: Character
    raidActivity: QuestInstances[]
}

const useGetCharacterTimers = ({ verifiedCharacters }: Props) => {
    const [characterTimers, setCharacterTimers] = useState<CharacterTimers[]>(
        []
    )
    console.log("characterTimers", characterTimers)

    useEffect(() => {
        ;(async () => {
            if (!verifiedCharacters || verifiedCharacters.length === 0) return
            // get timers for each character
            const characterIds = verifiedCharacters.map(
                (character) => character.id
            )
            const raidActivity =
                await getCharacterRaidActivityByIds(characterIds)
            if (!raidActivity?.data?.length) return
            const characterTimers: CharacterTimers[] = verifiedCharacters.map(
                (character) => {
                    const activityForCharacter = raidActivity.data.filter(
                        (activity) => activity.character_id === character.id
                    )
                    return {
                        character,
                        raidActivity: activityForCharacter.map((event) => ({
                            timestamp: event.timestamp,
                            quest_ids: event.data.quest_ids,
                        })),
                    }
                }
            )

            setCharacterTimers(characterTimers)
        })()
    }, [verifiedCharacters])

    return { characterTimers }
}

export default useGetCharacterTimers
