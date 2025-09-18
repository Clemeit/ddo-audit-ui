import { useCallback, useEffect, useRef, useState } from "react"
import { RangeEnum } from "../models/Common"

/** Generic function signature for a demographics fetcher. */
export type RangedFetcher<T> = (
    range: RangeEnum,
    signal?: AbortSignal
) => Promise<{ data: T } | undefined>

export interface UseRangedDemographicState<T> {
    dataMap: Record<RangeEnum, T | undefined>
    range: RangeEnum
    setRange: (r: RangeEnum) => void
    isLoading: boolean
    isError: boolean
    /** Returns data for the active range (may be undefined before first load). */
    currentData: T | undefined
    /** Imperatively refetch the currently selected range, bypassing cache. */
    refetch: () => void
}

/** Creates an empty map keyed by RangeEnum for caching responses. */
function createEmptyMap<T>(): Record<RangeEnum, T | undefined> {
    return {
        [RangeEnum.DAY]: undefined,
        [RangeEnum.WEEK]: undefined,
        [RangeEnum.MONTH]: undefined,
        [RangeEnum.QUARTER]: undefined,
        [RangeEnum.YEAR]: undefined,
    }
}

/**
 * Hook to cache demographic data per time range.
 * - Fetches on first selection of a range.
 * - Aborts in-flight request on unmount or range change.
 * - Provides manual refetch to bust cache for active range.
 */
export function useRangedDemographic<T>(
    fetcher: RangedFetcher<T>,
    initialRange: RangeEnum = RangeEnum.QUARTER
): UseRangedDemographicState<T> {
    const [range, setRange] = useState<RangeEnum>(initialRange)
    const [dataMap, setDataMap] =
        useState<Record<RangeEnum, T | undefined>>(createEmptyMap)
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    // Ref mirrors dataMap so load() can read current cache without being
    // recreated when dataMap changes (prevents abort cycle on initial mount).
    const dataMapRef = useRef<Record<RangeEnum, T | undefined>>(dataMap)
    const abortRef = useRef<AbortController | null>(null)
    // Track request ids per range so late resolving requests for OTHER ranges don't get discarded.
    const rangeRequestIdsRef = useRef<Record<RangeEnum, number>>({
        [RangeEnum.DAY]: 0,
        [RangeEnum.WEEK]: 0,
        [RangeEnum.MONTH]: 0,
        [RangeEnum.QUARTER]: 0,
        [RangeEnum.YEAR]: 0,
    })
    // Track which ranges currently have in-flight requests to avoid duplicate fetches for the same range.
    const inFlightRangesRef = useRef<Set<RangeEnum>>(new Set())
    const inFlightCountRef = useRef(0)
    const lastRangeWithData = useRef<RangeEnum | null>(null)

    const load = useCallback(
        async (selectedRange: RangeEnum, bypassCache = false) => {
            const currentMap = dataMapRef.current
            if (!bypassCache && currentMap[selectedRange] !== undefined) return // already cached

            // If we already have an in-flight request for this same range, allow it to finish and avoid duplicate start.
            if (inFlightRangesRef.current.has(selectedRange)) return

            // Create a new request (do not abort previous unless explicit refetch/unmount).
            const controller = new AbortController()
            abortRef.current = controller // only tracks most recent (used for unmount/refetch cancels)
            inFlightRangesRef.current.add(selectedRange)
            const requestId = ++rangeRequestIdsRef.current[selectedRange]

            try {
                // Increment in-flight counter and set loading.
                inFlightCountRef.current += 1
                setIsLoading(true)
                setIsError(false)
                const response = await fetcher(selectedRange, controller.signal)
                // Ignore if this response is stale (another request started later).
                if (
                    !controller.signal.aborted &&
                    response &&
                    requestId === rangeRequestIdsRef.current[selectedRange]
                ) {
                    setDataMap((prev) => {
                        const next = { ...prev, [selectedRange]: response.data }
                        dataMapRef.current = next
                        return next
                    })
                    lastRangeWithData.current = selectedRange
                }
            } catch (e) {
                // Only flag error if this is still the latest request for this range.
                if (
                    !controller.signal.aborted &&
                    requestId === rangeRequestIdsRef.current[selectedRange]
                ) {
                    setIsError(true)
                }
            } finally {
                // Decrement in-flight and recalc loading regardless of abort status.
                if (inFlightCountRef.current > 0) inFlightCountRef.current -= 1
                if (inFlightCountRef.current === 0) setIsLoading(false)
                inFlightRangesRef.current.delete(selectedRange)
            }
        },
        [fetcher]
    )

    // Keep ref in sync with state.
    useEffect(() => {
        dataMapRef.current = dataMap
    }, [dataMap])

    // Only abort on unmount.
    useEffect(() => {
        return () => abortRef.current?.abort()
    }, [])

    // Fetch when range changes (no abort on change, prior request may resolve and be ignored if stale).
    useEffect(() => {
        load(range, false)
    }, [range, load])

    const refetch = useCallback(() => {
        // Explicit abort only on manual refetch.
        abortRef.current?.abort()
        load(range, true) // bypass cache for current range
    }, [range, load])

    return {
        dataMap,
        range,
        setRange,
        isLoading,
        isError,
        currentData:
            dataMap[range] !== undefined
                ? dataMap[range]
                : dataMap[lastRangeWithData.current ?? range],
        refetch,
    }
}
