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
    const controllerRef = useRef<AbortController | null>(null)
    const consecutiveErrorsRef = useRef<number>(0)

    const fetchData = useCallback(
        async (signal: AbortSignal) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)

            if (lifespan > 0 && Date.now() - birthTime > lifespan) {
                setState(LoadingState.Haulted)
                return
            }

            // Check if signal is already aborted before starting
            if (signal.aborted) return

            // only set loading state if the request takes longer than 1 second
            const loadingStateTimeout = setTimeout(() => {
                if (!signal.aborted) {
                    setState(LoadingState.Loading)
                }
            }, 1000)

            try {
                const result = await getRequest<T>(endpoint, { signal })

                // Only update state if not aborted
                if (!signal.aborted) {
                    setData(result)
                    setError(null) // Clear any previous errors
                    setState(LoadingState.Loaded)
                    consecutiveErrorsRef.current = 0 // Reset error count on success
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error)

                // Common errors - early return for cancellations
                if (errorMessage.includes("CanceledError") || signal.aborted) {
                    return
                }

                consecutiveErrorsRef.current += 1

                // Log different error types
                if (errorMessage.includes("Network Error")) {
                    logMessage("Network connectivity issue", "warn", {
                        metadata: {
                            error: errorMessage,
                            stack:
                                error instanceof Error
                                    ? error.stack
                                    : undefined,
                            consecutiveErrors: consecutiveErrorsRef.current,
                            endpoint,
                        },
                    })
                } else {
                    logMessage("Error fetching data", "error", {
                        metadata: {
                            error: errorMessage,
                            stack:
                                error instanceof Error
                                    ? error.stack
                                    : undefined,
                            consecutiveErrors: consecutiveErrorsRef.current,
                            endpoint,
                        },
                    })
                }

                // Only set error state if not aborted
                if (!signal.aborted) {
                    setError(error as Error)
                    setState(LoadingState.Error)

                    // Stop polling if stopOnError is true
                    if (stopOnError) {
                        return
                    }
                }
            } finally {
                clearTimeout(loadingStateTimeout)

                // Schedule next poll if not aborted and not stopped
                if (
                    !signal.aborted &&
                    (!stopOnError || consecutiveErrorsRef.current === 0)
                ) {
                    // Implement exponential backoff for consecutive errors (max 60 seconds)
                    const backoffMultiplier = Math.min(
                        Math.pow(2, consecutiveErrorsRef.current),
                        6
                    )
                    const nextInterval = interval * backoffMultiplier

                    timeoutRef.current = setTimeout(
                        () => fetchData(signal),
                        nextInterval
                    )
                }
            }
        },
        [endpoint, interval, lifespan, birthTime, stopOnError]
    )

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        controllerRef.current = controller

        fetchData(signal)

        return () => {
            controller.abort()
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [fetchData])

    const reload = useCallback(() => {
        // Abort current operations
        if (controllerRef.current) {
            controllerRef.current.abort()
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // Reset error count and create new controller
        consecutiveErrorsRef.current = 0
        const newController = new AbortController()
        controllerRef.current = newController

        fetchData(newController.signal)
    }, [fetchData])

    return {
        state,
        data,
        error,
        reload,
    }
}

export default usePollApi
