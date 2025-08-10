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
import { LocalStorageEntry } from "../models/LocalStorage.ts"

interface QuestContextProps {
    quests: { [key: number]: Quest }
    reloadQuests: () => void
}

const QuestContext = createContext<QuestContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
}

export const QuestProvider = ({ children }: Props) => {
    const [cachedQuests, setCachedQuests] = useState<{
        [key: number]: Quest
    }>({})
    const [quests, setQuests] = useState<{ [key: number]: Quest }>({})

    const populateQuests = async (fetchFromServer: boolean = false) => {
        let cachedQuests: LocalStorageEntry<Quest[]>
        let lastUpdated: Date
        try {
            cachedQuests = getQuestsFromLocalStorage()
            lastUpdated = new Date(cachedQuests.updatedAt || 0)
            const cachedQuestsObj = cachedQuests.data.reduce(
                (acc, quest) => {
                    acc[quest.id] = quest
                    return acc
                },
                {} as { [key: number]: Quest }
            )
            setCachedQuests(cachedQuestsObj)
        } catch (error) {
            logMessage("Error parsing quests from local storage", "error", {
                metadata: {
                    error:
                        error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                },
            })
        }

        try {
            if (
                fetchFromServer ||
                !cachedQuests ||
                !cachedQuests.data ||
                !cachedQuests.updatedAt ||
                new Date().getTime() - lastUpdated.getTime() >
                    CACHED_QUESTS_EXPIRY_TIME
            ) {
                // Cache is stale
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
            }
        } catch (error) {
            logMessage("Error fetching quests from server", "error", {
                metadata: {
                    error:
                        error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                    cachedQuests: {
                        length: cachedQuests?.data?.length,
                        lastupdated: lastUpdated,
                    },
                },
            })
        }
    }

    useEffect(() => {
        populateQuests()
    }, [])

    const questsMemoized = React.useMemo(() => {
        if (Object.keys(quests).length > 0) return { quests: quests }
        return { quests: cachedQuests }
    }, [quests, cachedQuests])

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
