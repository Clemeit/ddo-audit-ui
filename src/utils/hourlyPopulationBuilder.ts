import { PopulationByHourData } from "../models/Population"
import { DataTypeFilterEnum, ServerFilterEnum } from "../models/Common"
import {
    SERVERS_32_BITS_LOWER,
    SERVERS_64_BITS_LOWER,
} from "../constants/servers"
import { NivoNumberSeries } from "./nivoUtils"

/** Precompute a UTC->local hour mapping for a representative date across 24 hours. */
export function buildUtcToLocalHourMap(timezone: string): number[] {
    const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        hourCycle: "h23",
    })
    const base = Date.UTC(2025, 0, 5, 0, 0, 0, 0)
    const mapping: number[] = []
    for (let h = 0; h < 24; h++) {
        const date = new Date(base + h * 3600_000)
        const parts = fmt.formatToParts(date)
        const hourPart = parts.find((p) => p.type === "hour")?.value
        mapping[h] = hourPart ? parseInt(hourPart, 10) : h
    }
    return mapping
}

/** Filter servers according to filter selection. */
export function filterServers(
    data: PopulationByHourData | undefined,
    serverFilter: ServerFilterEnum
): PopulationByHourData | undefined {
    if (!data) return data
    if (serverFilter === ServerFilterEnum.ONLY_64_BIT) {
        return Object.fromEntries(
            Object.entries(data).filter(([s]) =>
                SERVERS_64_BITS_LOWER.includes(s.toLowerCase())
            )
        )
    }
    if (serverFilter === ServerFilterEnum.ONLY_32_BIT) {
        return Object.fromEntries(
            Object.entries(data).filter(([s]) =>
                SERVERS_32_BITS_LOWER.includes(s.toLowerCase())
            )
        )
    }
    return data
}

/**
 * Remap UTC keyed hour data to local hour buckets, collapsing collisions (DST) using max aggregation.
 */
export function remapUtcToLocalHours(
    data: PopulationByHourData | undefined,
    utcToLocal: number[]
): PopulationByHourData | undefined {
    if (!data) return data
    const local: PopulationByHourData = {}
    Object.entries(data).forEach(([server, hours]) => {
        local[server] = {}
        Object.entries(hours).forEach(([utcHourStr, hourData]) => {
            const utcHour = parseInt(utcHourStr, 10)
            const localHour = utcToLocal[utcHour]
            const existing = local[server][localHour]
            const newChar = hourData.avg_character_count ?? 0
            const newLfm = hourData.avg_lfm_count ?? 0
            if (!existing) {
                local[server][localHour] = { ...hourData }
            } else {
                local[server][localHour] = {
                    avg_character_count: Math.max(
                        existing.avg_character_count ?? 0,
                        newChar
                    ),
                    avg_lfm_count: Math.max(
                        existing.avg_lfm_count ?? 0,
                        newLfm
                    ),
                }
            }
        })
    })
    return local
}

/** Convert hourly population data into NivoNumberSeries for the selected data type. */
export function hourlyPopulationToSeries(
    data: PopulationByHourData | undefined,
    dataType: DataTypeFilterEnum
): NivoNumberSeries[] {
    if (!data) return []
    const series: NivoNumberSeries[] = []
    Object.entries(data).forEach(([server, hours]) => {
        const s: NivoNumberSeries = { id: server, data: [] }
        Object.entries(hours).forEach(([hourStr, hourData]) => {
            s.data.push({
                x: Number(hourStr),
                y:
                    dataType === DataTypeFilterEnum.CHARACTERS
                        ? (hourData.avg_character_count ?? 0)
                        : (hourData.avg_lfm_count ?? 0),
            })
        })
        // sort by hour (string iteration order might already be numeric, but ensure)
        s.data.sort((a, b) => (a.x as number) - (b.x as number))
        series.push(s)
    })
    return series
}

/** Unified builder performing filtering, timezone remap and final series conversion. */
export function buildHourlyPopulationSeries(
    raw: PopulationByHourData | undefined,
    serverFilter: ServerFilterEnum,
    dataType: DataTypeFilterEnum,
    utcToLocal: number[]
): NivoNumberSeries[] {
    const filtered = filterServers(raw, serverFilter)
    const remapped = remapUtcToLocalHours(filtered, utcToLocal)
    return hourlyPopulationToSeries(remapped, dataType)
}
