import { useState, useEffect, useRef, useCallback } from "react"
import { getRequest } from "../services/apiHelper.ts"
import { LoadingState } from "../models/Api.ts"
import logMessage from "../utils/logUtils.ts"

interface UsePollApiProps {
    endpoint: string
    interval?: number
    lifespan?: number
    stopOnError?: boolean
}

interface UsePollApiReturn<T> {
    state: LoadingState
    data: T | null
    error: Error | null
    reload: () => void
}

const usePollApi = <T>({
    endpoint,
    interval = 10000,
    lifespan = 0,
    stopOnError = false,
}: UsePollApiProps): UsePollApiReturn<T> => {
    const [birthTime] = useState<number>(Date.now())
    const [state, setState] = useState<LoadingState>(LoadingState.Initial)
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const fetchData = useCallback(
        async (signal: AbortSignal) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (lifespan > 0 && Date.now() - birthTime > lifespan) {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current)
                }
                setState(LoadingState.Haulted)
                return
            }

            // only set loading state if the request takes longer than 1 second
            const loadingStateTimeout = setTimeout(() => {
                setState(LoadingState.Loading)
            }, 1000)
            try {
                const result = await getRequest<T>(endpoint, { signal })
                setData(result)
                setState(LoadingState.Loaded)
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error)
                if (errorMessage.includes("CanceledError")) return
                setError(error as Error)
                setState(LoadingState.Error)
                logMessage("Error fetching data", "error", {
                    metadata: {
                        error: errorMessage,
                        stack: error instanceof Error ? error.stack : undefined,
                    },
                })
            } finally {
                clearTimeout(loadingStateTimeout)
                if (!signal.aborted) {
                    timeoutRef.current = setTimeout(
                        () => fetchData(signal),
                        interval
                    )
                }
            }
        },
        [endpoint, lifespan, birthTime, stopOnError]
    )

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        fetchData(signal)

        return () => {
            controller.abort()
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return {
        state,
        data,
        error,
        reload: () => fetchData(new AbortController().signal),
    }
}

export default usePollApi
