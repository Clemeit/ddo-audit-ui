import { useCallback, useEffect, useRef, useState } from "react"
import { RangeEnum } from "../models/Common"
import logMessage from "../utils/logUtils"

/** Generic function signature for a demographics fetcher. */
export type RangedFetcher<T> = (
    range: RangeEnum,
    params?: any,
    signal?: AbortSignal
) => Promise<{ data: T } | undefined>

export interface UseRangedDemographicState<T> {
    dataMap: Record<RangeEnum, T | undefined>
    range: RangeEnum
    setRange: (r: RangeEnum) => void
    /** Current params passed to the fetcher. */
    params: any
    /** Update params and invalidate cached data for all ranges. */
    setParams: (p: any) => void
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
    initialRange: RangeEnum = RangeEnum.QUARTER,
    initialParams?: any
): UseRangedDemographicState<T> {
    const [range, setRange] = useState<RangeEnum>(initialRange)
    const [params, setParams] = useState<any>(initialParams)
    const [dataMap, setDataMap] =
        useState<Record<RangeEnum, T | undefined>>(createEmptyMap)
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    // Ref mirrors dataMap so load() can read current cache without being
    // recreated when dataMap changes (prevents abort cycle on initial mount).
    const dataMapRef = useRef<Record<RangeEnum, T | undefined>>(dataMap)
    // Track an AbortController per range so we can abort all on params change/unmount and per-range on refetch.
    const abortControllersRef = useRef<
        Record<RangeEnum, AbortController | null>
    >({
        [RangeEnum.DAY]: null,
        [RangeEnum.WEEK]: null,
        [RangeEnum.MONTH]: null,
        [RangeEnum.QUARTER]: null,
        [RangeEnum.YEAR]: null,
    })
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
    // Guard to avoid treating initial params as a "change" that would reset cache on mount
    const didRunParamsEffectOnceRef = useRef(false)

    const load = useCallback(
        async (selectedRange: RangeEnum, params: any, bypassCache = false) => {
            const currentMap = dataMapRef.current
            if (!bypassCache && currentMap[selectedRange] !== undefined) return // already cached

            // If we already have an in-flight request for this same range, allow it to finish and avoid duplicate start.
            if (inFlightRangesRef.current.has(selectedRange)) return

            // Create a new request controller (do not abort previous unless explicit refetch/unmount/params change).
            const controller = new AbortController()
            // Store controller for this specific range so we can abort it later if needed.
            abortControllersRef.current[selectedRange] = controller
            inFlightRangesRef.current.add(selectedRange)
            const requestId = ++rangeRequestIdsRef.current[selectedRange]

            try {
                // Increment in-flight counter and set loading.
                inFlightCountRef.current += 1
                setIsLoading(true)
                setIsError(false)
                const response = await fetcher(
                    selectedRange,
                    params,
                    controller.signal
                )
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
                if (!controller.signal.aborted) {
                    logMessage(
                        "Error fetching ranged demographic data",
                        "error",
                        {
                            metadata: {
                                error: e as Error,
                                range: selectedRange,
                            },
                        }
                    )
                }
            } finally {
                // Decrement in-flight and recalc loading regardless of abort status.
                if (inFlightCountRef.current > 0) inFlightCountRef.current -= 1
                if (inFlightCountRef.current === 0) setIsLoading(false)
                inFlightRangesRef.current.delete(selectedRange)
                // Clear the controller for this range if it matches
                const current = abortControllersRef.current[selectedRange]
                if (current === controller) {
                    abortControllersRef.current[selectedRange] = null
                }
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
        return () => {
            // Abort any in-flight requests for all ranges
            ;(
                [
                    RangeEnum.DAY,
                    RangeEnum.WEEK,
                    RangeEnum.MONTH,
                    RangeEnum.QUARTER,
                    RangeEnum.YEAR,
                ] as RangeEnum[]
            ).forEach((r) => {
                const ctrl = abortControllersRef.current[r]
                if (ctrl) ctrl.abort()
                abortControllersRef.current[r] = null
            })
        }
    }, [])

    // Fetch when range changes (no abort on change, prior request may resolve and be ignored if stale).
    useEffect(() => {
        load(range, params, false)
    }, [range, params, load])

    // Invalidate cache and abort all in-flight requests when params change (skip on initial mount).
    useEffect(() => {
        if (!didRunParamsEffectOnceRef.current) {
            didRunParamsEffectOnceRef.current = true
            return
        }
        // Reset cache
        setDataMap(() => {
            const empty = createEmptyMap<T>()
            dataMapRef.current = empty
            return empty
        })
        lastRangeWithData.current = null
        // Abort any in-flight requests for all ranges and reset loading counters
        ;(
            [
                RangeEnum.DAY,
                RangeEnum.WEEK,
                RangeEnum.MONTH,
                RangeEnum.QUARTER,
                RangeEnum.YEAR,
            ] as RangeEnum[]
        ).forEach((r) => {
            const ctrl = abortControllersRef.current[r]
            if (ctrl) ctrl.abort()
            abortControllersRef.current[r] = null
            inFlightRangesRef.current.delete(r)
            // Reset request id for this range so new requests are considered latest
            rangeRequestIdsRef.current[r] = 0
        })
        inFlightCountRef.current = 0
        setIsLoading(false)
        setIsError(false)
    }, [params])

    const refetch = useCallback(() => {
        // Explicit abort only on manual refetch for the current range.
        const ctrl = abortControllersRef.current[range]
        if (ctrl) ctrl.abort()
        abortControllersRef.current[range] = null
        load(range, params, true) // bypass cache for current range
    }, [range, params, load])

    return {
        dataMap,
        range,
        setRange,
        params,
        setParams,
        isLoading,
        isError,
        currentData:
            dataMap[range] !== undefined
                ? dataMap[range]
                : dataMap[lastRangeWithData.current ?? range],
        refetch,
    }
}
