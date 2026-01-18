import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useMemo,
    useCallback,
} from "react"
import { Quest } from "../models/Lfm.ts"
import {
    getQuests as getQuestsFromLocalStorage,
    setQuests as setQuestsInLocalStorage,
} from "../utils/localStorage.ts"
import { getQuests } from "../services/questService.ts"
import { CACHED_QUESTS_EXPIRY_TIME } from "../constants/client.ts"
import logMessage from "../utils/logUtils.ts"
import { LocalStorageEntry } from "../models/LocalStorage.ts"

interface QuestContextProps {
    quests: { [key: number]: Quest }
    reloadQuests: () => void
    getQuestFromAreaId: (areaId: number) => Quest | undefined
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

    const populateQuests = useCallback(
        async (fetchFromServer: boolean = false) => {
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
                            error instanceof Error
                                ? error.message
                                : String(error),
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
                    const result = await getQuests({
                        force: fetchFromServer,
                    })
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
                            error instanceof Error
                                ? error.message
                                : String(error),
                        stack: error instanceof Error ? error.stack : undefined,
                        cachedQuests: {
                            length: cachedQuests?.data?.length,
                            lastupdated: lastUpdated,
                        },
                    },
                })
            }
        },
        []
    )

    useEffect(() => {
        void populateQuests()
    }, [populateQuests])

    const questsMemoized = React.useMemo(() => {
        if (Object.keys(quests).length > 0) return { quests }
        return { quests: cachedQuests }
    }, [quests, cachedQuests])

    const areaIdToQuestMap: { [areaId: number]: Quest } = useMemo(() => {
        const map: { [areaId: number]: Quest } = {}
        for (const quest of Object.values(questsMemoized.quests ?? {})) {
            const id = quest.area_id
            if (id != null) {
                map[id] = quest
            }
        }
        return map
    }, [questsMemoized.quests])

    const getQuestFromAreaId = useCallback(
        (areaId: number): Quest | undefined => areaIdToQuestMap[areaId],
        [areaIdToQuestMap]
    )

    const reloadQuests = useCallback(() => {
        void populateQuests(true)
    }, [populateQuests])

    const ctxValue = useMemo(
        () => ({
            quests: questsMemoized.quests,
            reloadQuests,
            getQuestFromAreaId,
        }),
        [questsMemoized.quests, reloadQuests, getQuestFromAreaId]
    )

    return (
        <QuestContext.Provider value={ctxValue}>
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
