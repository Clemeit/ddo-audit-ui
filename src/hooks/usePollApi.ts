import { useState, useEffect, useRef, useCallback } from "react"
import { getRequest } from "../services/apiHelper.ts"
import { LoadingState } from "../models/Api.ts"

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

    const fetchData = useCallback(async () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (lifespan > 0 && Date.now() - birthTime > lifespan) {
            if (timeoutRef.current) {
                clearInterval(timeoutRef.current)
            }
            setState(LoadingState.Haulted)
            return
        }

        // only set loading state if the request takes longer than 1 second
        const loadingStateTimeout = setTimeout(() => {
            setState(LoadingState.Loading)
        }, 1000)
        try {
            const result = await getRequest<T>(endpoint)
            setData(result)
            setState(LoadingState.Loaded)
            clearTimeout(loadingStateTimeout)
            timeoutRef.current = setTimeout(fetchData, interval)
        } catch (err) {
            setError(err as Error)
            setState(LoadingState.Error)
            if (stopOnError && timeoutRef.current) {
                clearInterval(timeoutRef.current)
            } else {
                timeoutRef.current = setTimeout(fetchData, interval)
            }
        }
    }, [endpoint, lifespan, birthTime, stopOnError])

    useEffect(() => {
        fetchData()

        return () => {
            if (timeoutRef.current) {
                clearInterval(timeoutRef.current)
            }
        }
    }, [])

    return { state, data, error, reload: fetchData }
}

export default usePollApi
