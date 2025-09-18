import { DataTypeFilterEnum, ServerFilterEnum } from "../models/Common"
import {
    PopulationByDayOfWeekData,
    PopulationByHourAndDayOfWeekData,
} from "../models/Population"
import {
    SERVERS_32_BITS_LOWER,
    SERVERS_64_BITS_LOWER,
} from "../constants/servers"
import { NivoBarSlice } from "./nivoUtils"

export interface DayHour {
    day: number
    hour: number
}

/**
 * Build a 7x24 mapping from UTC (day,hour) to local (day,hour) for a given IANA timezone.
 *
 * Implementation notes:
 * - Uses a fixed reference week (starting Sunday) to translate weekday/hour.
 * - Suitable for aggregating historical averages because relative weekday/hour mapping is stable.
 */
export function buildUtcToLocalMap(timezone: string): DayHour[][] {
    const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        hourCycle: "h23",
        weekday: "short",
    })
    const dayIdx: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
    }
    const base = Date.UTC(2025, 0, 5, 0, 0, 0, 0) // Sunday UTC anchor
    const map: DayHour[][] = Array.from({ length: 7 }, () =>
        Array.from({ length: 24 }, () => ({ day: 0, hour: 0 }))
    )
    for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
            const date = new Date(base + d * 24 * 3600_000 + h * 3600_000)
            const parts = fmt.formatToParts(date)
            const hourPart = parts.find((p) => p.type === "hour")?.value
            const weekdayPart = parts.find((p) => p.type === "weekday")?.value
            map[d][h] = {
                day: weekdayPart ? dayIdx[weekdayPart] : d,
                hour: hourPart ? parseInt(hourPart, 10) : h,
            }
        }
    }
    return map
}

/**
 * Aggregate raw hour+day UTC population data into local day-of-week averages per server.
 * Each server ends up with 0..7 day buckets depending on available data.
 */
export function aggregateHourDayToLocalDay(
    raw: PopulationByHourAndDayOfWeekData | undefined,
    utcToLocalMap: DayHour[][]
): PopulationByDayOfWeekData | undefined {
    if (!raw) return undefined
    const output: PopulationByDayOfWeekData = {}
    Object.entries(raw).forEach(([serverName, dayEntries]) => {
        const sums = Array(7)
            .fill(0)
            .map(() => ({ char: 0, lfm: 0, n: 0 }))
        Object.entries(dayEntries).forEach(([dayStr, hours]) => {
            const dUTC = parseInt(dayStr, 10)
            if (isNaN(dUTC) || dUTC < 0 || dUTC > 6) return
            Object.entries(hours).forEach(([hourStr, datum]) => {
                const hUTC = parseInt(hourStr, 10)
                if (isNaN(hUTC) || hUTC < 0 || hUTC > 23) return
                const { day: dLocal } = utcToLocalMap[dUTC][hUTC]
                const charVal = datum.avg_character_count ?? 0
                const lfmVal = datum.avg_lfm_count ?? 0
                sums[dLocal].char += charVal
                sums[dLocal].lfm += lfmVal
                sums[dLocal].n += 1
            })
        })
        output[serverName] = {} as any
        sums.forEach((agg, idx) => {
            if (agg.n === 0) return
            ;(output as any)[serverName][idx] = {
                avg_character_count: agg.char / agg.n,
                avg_lfm_count: agg.lfm / agg.n,
            }
        })
    })
    return output
}

/** Filter servers based on server filter selection (All / 32-bit / 64-bit). */
export function filterServers<T extends Record<string, any>>(
    data: T | undefined,
    serverFilter: ServerFilterEnum
): T | undefined {
    if (!data) return data
    if (serverFilter === ServerFilterEnum.ALL) return data
    const predicate = (name: string) => {
        const lower = name.toLowerCase()
        if (serverFilter === ServerFilterEnum.ONLY_64_BIT)
            return SERVERS_64_BITS_LOWER.includes(lower)
        if (serverFilter === ServerFilterEnum.ONLY_32_BIT)
            return SERVERS_32_BITS_LOWER.includes(lower)
        return true
    }
    return Object.fromEntries(
        Object.entries(data).filter(([k]) => predicate(k))
    ) as T
}

/** Convert aggregated day-of-week data to Nivo bar slices given selected data type (characters vs LFMs). */
export function dayOfWeekDataToNivo(
    data: PopulationByDayOfWeekData | undefined,
    dataType: DataTypeFilterEnum,
    converter: (
        d: PopulationByDayOfWeekData,
        t: DataTypeFilterEnum
    ) => NivoBarSlice[]
): NivoBarSlice[] {
    if (!data) return []
    return converter(data, dataType)
}
