import { useCallback, useEffect, useRef, useState } from "react"
import { LoadingState } from "../models/Api.ts"

interface Result<T> {
    data: T | null
    state: LoadingState
    error: Error | null
    reload: () => void
}

/**
 * Runs `request` whenever `key` changes, aborting the previous one. The last good data stays
 * available while a new request is loading, so a list doesn't flash empty between pages.
 * `key` should be a string that captures everything the request depends on; null skips the request.
 */
export default function useAbortableRequest<T>(
    key: string | null,
    request: (signal: AbortSignal) => Promise<T>
): Result<T> {
    const [data, setData] = useState<T | null>(null)
    const [state, setState] = useState<LoadingState>(LoadingState.Initial)
    const [error, setError] = useState<Error | null>(null)
    const [reloadCount, setReloadCount] = useState(0)
    const requestRef = useRef(request)
    requestRef.current = request

    useEffect(() => {
        if (key === null) {
            setState(LoadingState.Initial)
            return
        }
        const controller = new AbortController()
        setState(LoadingState.Loading)
        setError(null)
        requestRef
            .current(controller.signal)
            .then((result) => {
                if (controller.signal.aborted) return
                setData(result)
                setState(LoadingState.Loaded)
            })
            .catch((e: unknown) => {
                if (controller.signal.aborted) return
                setError(e instanceof Error ? e : new Error(String(e)))
                setState(LoadingState.Error)
            })
        return () => controller.abort()
    }, [key, reloadCount])

    const reload = useCallback(() => setReloadCount((n) => n + 1), [])

    return { data, state, error, reload }
}
