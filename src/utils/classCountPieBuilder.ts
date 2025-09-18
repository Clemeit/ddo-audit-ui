/** Utility to build Nivo pie slices for class count demographic. */
import { ClassCountDemographicApiData } from "../models/Demographics"
import { ServerFilterEnum } from "../models/Common"
import {
    SERVERS_32_BITS_LOWER,
    SERVERS_64_BITS_LOWER,
} from "../constants/servers"
import { NivoPieSlice } from "./nivoUtils"

export interface ClassCountPieResult {
    data: NivoPieSlice[]
    total: number
}

/**
 * Aggregates class count demographic data across selected servers into pie slices.
 *
 * Rules:
 * - Filters servers via `serverFilter` (32-bit / 64-bit / all).
 * - Skips class count bucket with key '0' (invalid / placeholder bucket).
 * - Sums identical class count buckets across all included servers.
 * - Treats null counts as 0.
 *
 * Returned `total` represents the sum of all included slice values and is
 * provided for convenience to avoid recalculation in the calling component.
 */
export function buildClassCountPie(
    demographic: ClassCountDemographicApiData | undefined,
    serverFilter: ServerFilterEnum
): ClassCountPieResult {
    if (!demographic) return { data: [], total: 0 }

    const includeServer = (serverName: string): boolean => {
        const lower = serverName.toLowerCase()
        if (serverFilter === ServerFilterEnum.ONLY_32_BIT)
            return SERVERS_32_BITS_LOWER.includes(lower)
        if (serverFilter === ServerFilterEnum.ONLY_64_BIT)
            return SERVERS_64_BITS_LOWER.includes(lower)
        return true
    }

    const slices: NivoPieSlice[] = []
    let total = 0

    Object.entries(demographic).forEach(([serverName, serverData]) => {
        if (!serverData || !includeServer(serverName)) return

        Object.entries(serverData).forEach(([classCount, countNullable]) => {
            if (classCount === "0") return
            const count = countNullable ?? 0
            total += count
            const existing = slices.find((s) => s.id === classCount)
            if (existing) existing.value += count
            else {
                slices.push({ id: classCount, label: classCount, value: count })
            }
        })
    })

    return { data: slices, total }
}
