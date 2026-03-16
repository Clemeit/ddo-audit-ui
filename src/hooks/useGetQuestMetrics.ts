import { useCallback, useEffect, useState } from "react"
import { getQuestAnalytics } from "../services/questService"
import { QuestAnalyticsApiResponse } from "../models/Lfm"
import logMessage from "../utils/logUtils"

const useGetQuestMetrics = (questId?: number) => {
    const [questMetrics, setQuestMetrics] =
        useState<QuestAnalyticsApiResponse | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchData = useCallback(
        async (signal: AbortSignal) => {
            if (questId == undefined || questId === -1) {
                setQuestMetrics(null)
                setError(null)
                return
            }

            try {
                const data = await getQuestAnalytics(questId, { signal })
                if (!signal.aborted) {
                    setQuestMetrics(data)
                }
            } catch (error) {
                const isAbortError =
                    signal.aborted ||
                    (error instanceof Error && error.name === "AbortError")

                if (isAbortError) {
                    return
                }

                logMessage("Error fetching quest metrics", "error", {
                    metadata: {
                        questId,
                        error: error instanceof Error ? error.message : error,
                    },
                })
                if (!signal.aborted) {
                    setError(error as Error)
                    setQuestMetrics(null)
                }
            }
        },
        [questId]
    )

    useEffect(() => {
        if (questId == undefined || questId === -1) {
            setQuestMetrics(null)
            setError(null)
            setIsLoading(false)
            return
        }

        const controller = new AbortController()
        setIsLoading(true)
        setError(null)
        fetchData(controller.signal).finally(() => {
            if (!controller.signal.aborted) {
                setIsLoading(false)
            }
        })

        return () => {
            controller.abort()
        }
    }, [fetchData, questId])

    return {
        questMetrics,
        isLoading,
        error,
    }
}

export default useGetQuestMetrics
