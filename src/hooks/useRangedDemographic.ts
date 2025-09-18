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
    const forceReloadToken = useRef<number>(0)
    const abortRef = useRef<AbortController | null>(null)

    const load = useCallback(
        async (selectedRange: RangeEnum, bypassCache = false) => {
            if (!bypassCache && dataMap[selectedRange] !== undefined) return // already cached

            abortRef.current?.abort()
            const controller = new AbortController()
            abortRef.current = controller

            try {
                setIsLoading(true)
                setIsError(false)
                const response = await fetcher(selectedRange, controller.signal)
                if (!controller.signal.aborted && response) {
                    setDataMap((prev) => ({
                        ...prev,
                        [selectedRange]: response.data,
                    }))
                }
            } catch (e) {
                if (!controller.signal.aborted) setIsError(true)
            } finally {
                if (!controller.signal.aborted) setIsLoading(false)
            }
        },
        [dataMap, fetcher]
    )

    // Fetch when range changes or manual refetch is requested.
    useEffect(() => {
        load(range, false)
        return () => abortRef.current?.abort()
    }, [range, load, forceReloadToken.current])

    const refetch = useCallback(() => {
        // increment token to trigger effect even if range unchanged
        forceReloadToken.current += 1
        load(range, true)
    }, [range, load])

    return {
        dataMap,
        range,
        setRange,
        isLoading,
        isError,
        currentData: dataMap[range],
        refetch,
    }
}
