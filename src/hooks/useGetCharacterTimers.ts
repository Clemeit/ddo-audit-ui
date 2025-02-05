import { useEffect, useState } from "react"
import { Character } from "../models/Character"
import { Quest } from "../models/Lfm"
import { getCharacterTimersByIds } from "../services/characterService.ts"

interface Props {
    verifiedCharacters: Character[]
}

interface QuestInstances {
    quest: Quest
    instances: string[]
}

interface CharacterTimers {
    character: Character
    questInstances: QuestInstances[]
}

const useGetCharacterTimers = ({ verifiedCharacters }: Props) => {
    const [characterTimers, setCharacterTimers] = useState<CharacterTimers[]>(
        []
    )

    useEffect(() => {
        if (!verifiedCharacters || verifiedCharacters.length === 0) return
        // get timers for each character
        const characterIds = verifiedCharacters.map((character) => character.id)
        getCharacterTimersByIds(characterIds)
            .then((response) => {
                const timers = response.data?.data
                const characterTimers = timers.map((timer) => {
                    const character = verifiedCharacters.find(
                        (c) => c.id === timer.character_id
                    )
                    const questInstances = timer.quests.map((quest) => {
                        const instances = quest.instances.map(
                            (instance) => instance.name
                        )
                        return { quest, instances }
                    })
                    return { character, questInstances }
                })
                setCharacterTimers(characterTimers)
            })
            .catch((error) => {
                console.error("Error getting character timers", error)
            })
    }, [verifiedCharacters])

    return { characterTimers }
}

export default useGetCharacterTimers
