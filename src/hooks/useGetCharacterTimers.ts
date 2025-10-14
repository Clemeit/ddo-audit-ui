import { useCallback, useEffect, useState } from "react"
import { Character } from "../models/Character"
import { getCharacterRaidActivityByIds } from "../services/activityService"
import logMessage from "../utils/logUtils"

interface Props {
    registeredCharacters: Character[]
}

export interface QuestInstances {
    timestamp: string
    quest_ids: number[]
}

interface CharacterTimerMap {
    [characterId: number]: QuestInstances[]
}

const useGetCharacterTimers = ({ registeredCharacters }: Props) => {
    const [characterTimers, setCharacterTimers] = useState<CharacterTimerMap>(
        []
    )
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const loadTimers = useCallback(async () => {
        try {
            if (!registeredCharacters) return
            if (registeredCharacters.length === 0) {
                setCharacterTimers([])
                return
            }
            setIsLoading(true)
            const characterIds = registeredCharacters.map(
                (character) => character.id
            )
            const raidActivity =
                await getCharacterRaidActivityByIds(characterIds)
            if (!raidActivity?.data?.length) {
                setCharacterTimers([])
                return
            }
            const characterTimers: {
                [characterId: number]: QuestInstances[]
            } = {}
            raidActivity.data.forEach((activity) => {
                if (!characterTimers[activity.character_id]) {
                    characterTimers[activity.character_id] = []
                }
                characterTimers[activity.character_id].push({
                    timestamp: activity.timestamp,
                    quest_ids: activity.data?.quest_ids || [],
                })
            })

            setCharacterTimers(characterTimers)
        } catch (error) {
            logMessage("Error fetching character timers", "error", {
                metadata: {
                    error:
                        error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                },
            })
        } finally {
            setIsLoading(false)
        }
    }, [registeredCharacters])

    useEffect(() => {
        loadTimers()
    }, [registeredCharacters])

    return { characterTimers, isLoading, reload: loadTimers }
}

export default useGetCharacterTimers
