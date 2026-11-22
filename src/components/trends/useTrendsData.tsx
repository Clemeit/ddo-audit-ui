import { useEffect, useState } from "react"
import {
    PopulationTrendsData,
    TrendsBucket,
    TrendsRange,
    TrendsSummaryData,
} from "../../models/Trends.ts"
import {
    getPopulationTrends,
    getPopulationTrendsSummary,
} from "../../services/trendsService.ts"
import logMessage from "../../utils/logUtils"

// The API caches these for 10-60 minutes; keep a short client copy so flipping between
// ranges doesn't refetch.
const CLIENT_CACHE_MS = 10 * 60 * 1000
const cache = new Map<string, { data: unknown; fetchedAt: number }>()

function getCached<T>(key: string): T | undefined {
    const entry = cache.get(key)
    if (!entry || Date.now() - entry.fetchedAt > CLIENT_CACHE_MS)
        return undefined
    return entry.data as T
}

interface RequestState<T> {
    data: T | undefined
    loading: boolean
    error: string | null
}

function useTrendsRequest<T>(
    key: string,
    fetcher: (signal: AbortSignal) => Promise<{ data: T }>
): RequestState<T> {
    const [state, setState] = useState<RequestState<T> & { key: string }>(
        () => ({
            key,
            data: getCached<T>(key),
            loading: getCached<T>(key) === undefined,
            error: null,
        })
    )

    useEffect(() => {
        const cached = getCached<T>(key)
        if (cached !== undefined) {
            setState({ key, data: cached, loading: false, error: null })
            return
        }
        const controller = new AbortController()
        setState({ key, data: undefined, loading: true, error: null })
        fetcher(controller.signal)
            .then((response) => {
                if (controller.signal.aborted) return
                cache.set(key, { data: response.data, fetchedAt: Date.now() })
                setState({
                    key,
                    data: response.data,
                    loading: false,
                    error: null,
                })
            })
            .catch((e) => {
                if (controller.signal.aborted) return
                const message = e instanceof Error ? e.message : String(e)
                logMessage("Error fetching trends data", "error", {
                    metadata: { key, error: message },
                })
                setState({
                    key,
                    data: undefined,
                    loading: false,
                    error: message,
                })
            })
        return () => controller.abort()
        // `fetcher` is derived from `key`; refetch only when the key changes.
    }, [key])

    // Until the effect for a new key runs, don't hand back the previous key's data.
    if (state.key !== key) {
        const cached = getCached<T>(key)
        return { data: cached, loading: cached === undefined, error: null }
    }
    return { data: state.data, loading: state.loading, error: state.error }
}

export function usePopulationTrends(
    range: TrendsRange,
    bucket: TrendsBucket
): RequestState<PopulationTrendsData> {
    return useTrendsRequest(`trends:${range}:${bucket}`, (signal) =>
        getPopulationTrends(range, bucket, signal)
    )
}

export function useTrendsSummary(): RequestState<TrendsSummaryData> {
    return useTrendsRequest("trends:summary", (signal) =>
        getPopulationTrendsSummary(signal)
    )
}
