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

interface QuestContextProps {
    quests: { [key: number]: Quest }
}

const QuestContext = createContext<QuestContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
}

export const QuestProvider = ({ children }: Props) => {
    const [quests, setQuests] = useState<{ [key: number]: Quest }>({})

    const populateQuests = async () => {
        // Get from cache
        const cachedQuests = getQuestsFromLocalStorage()
        const lastUpdated = new Date(cachedQuests.updatedAt || 0)
        if (
            !cachedQuests ||
            !cachedQuests.data ||
            new Date().getTime() - lastUpdated.getTime() >
                CACHED_QUESTS_EXPIRY_TIME
        ) {
            // Cache is stale
            try {
                const result = await getRequest<QuestApiResponse>("quests")
                console.log("result", result)
                setQuests(
                    result.data.reduce(
                        (acc: { [key: number]: Quest }, quest) => {
                            acc[quest.id] = quest
                            return acc
                        },
                        {}
                    )
                )
                setQuestsInLocalStorage(result.data)
            } catch {
                setQuests({})
            }
        } else {
            // Cache OK
            setQuests(
                cachedQuests.data.reduce(
                    (acc: { [key: number]: Quest }, quest) => {
                        acc[quest.id] = quest
                        return acc
                    },
                    {}
                )
            )
        }
    }

    useEffect(() => {
        populateQuests()
    }, [])

    return (
        <QuestContext.Provider value={{ quests }}>
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
