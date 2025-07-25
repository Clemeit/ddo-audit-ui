// Check cache. If cache is not stale (24 hours), return cached data.
// Otherwise, fetch data and populate cache.
import React, { createContext, useState, useEffect, useContext } from "react"
import { Quest, QuestApiResponse } from "../models/Lfm.ts"
import {
    getQuests as getQuestsFromLocalStorage,
    setQuests as setQuestsInLocalStorage,
} from "../utils/localStorage.ts"
import { getRequest } from "../services/apiHelper.ts"
import { CACHED_QUESTS_EXPIRY_TIME } from "../constants/client.ts"
import logMessage from "../utils/logUtils.ts"

interface QuestContextProps {
    quests: { [key: number]: Quest }
    reloadQuests: () => void
}

const QuestContext = createContext<QuestContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
}

export const QuestProvider = ({ children }: Props) => {
    const [quests, setQuests] = useState<{ [key: number]: Quest }>({})

    const populateQuests = async (fetchFromServer: boolean = false) => {
        // Get from cache
        const cachedQuests = getQuestsFromLocalStorage()
        const lastUpdated = new Date(cachedQuests.updatedAt || 0)
        if (
            fetchFromServer ||
            !cachedQuests ||
            !cachedQuests.data ||
            !cachedQuests.updatedAt ||
            new Date().getTime() - lastUpdated.getTime() >
                CACHED_QUESTS_EXPIRY_TIME
        ) {
            // Cache is stale
            try {
                const result = await getRequest<QuestApiResponse>("quests")
                const questObj = result.data.reduce(
                    (acc, quest) => {
                        acc[quest.id] = quest
                        return acc
                    },
                    {} as { [key: number]: Quest }
                )
                setQuests(questObj)
                setQuestsInLocalStorage(result.data)
            } catch (error) {
                setQuests({})
                logMessage("Error fetching quests", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                        stack: error instanceof Error ? error.stack : undefined,
                    },
                })
            }
        } else {
            // Cache OK
            const questsObj = cachedQuests.data.reduce(
                (acc, quest) => {
                    acc[quest.id] = quest
                    return acc
                },
                {} as { [key: number]: Quest }
            )
            setQuests(questsObj)
        }
    }

    useEffect(() => {
        populateQuests()
    }, [])

    const questsMemoized = React.useMemo(() => ({ quests }), [quests])

    return (
        <QuestContext.Provider
            value={{
                quests: questsMemoized.quests,
                reloadQuests: () => populateQuests(true),
            }}
        >
            {children}
        </QuestContext.Provider>
    )
}

export const useQuestContext = () => {
    const context = useContext(QuestContext)
    if (!context) {
        throw new Error("useQuestContext must be used within an QuestContext")
    }
    return context
}
