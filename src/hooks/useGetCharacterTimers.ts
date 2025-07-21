import { useEffect, useState } from "react"
import { Character } from "../models/Character"
import { getCharacterRaidActivityByIds } from "../services/activityService"
import logMessage from "../utils/logUtils"

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

    useEffect(() => {
        ;(async () => {
            try {
                if (!verifiedCharacters || verifiedCharacters.length === 0)
                    return
                // get timers for each character
                const characterIds = verifiedCharacters.map(
                    (character) => character.id
                )
                const raidActivity =
                    await getCharacterRaidActivityByIds(characterIds)
                if (!raidActivity?.data?.length) return
                const characterTimers: CharacterTimers[] =
                    verifiedCharacters.map((character) => {
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
                    })

                setCharacterTimers(characterTimers)
            } catch (error) {
                logMessage("Error fetching character timers", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                        stack: error instanceof Error ? error.stack : undefined,
                    },
                })
            }
        })()
    }, [verifiedCharacters])

    return { characterTimers }
}

export default useGetCharacterTimers
