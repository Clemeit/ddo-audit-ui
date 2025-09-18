import { PrimaryClassDemographicApiData } from "../models/Demographics"
import { ServerFilterEnum } from "../models/Common"
import {
    SERVERS_32_BITS_LOWER,
    SERVERS_64_BITS_LOWER,
} from "../constants/servers"
import { NivoPieSlice } from "./nivoUtils"

export interface PrimaryClassPieResult {
    data: NivoPieSlice[]
    total: number
}

/**
 * Aggregates primary class demographic data across servers.
 * - Skips primary class value 'none'.
 * - Applies server filtering (32-bit / 64-bit / all).
 * - Sums counts across servers.
 */
export function buildPrimaryClassPie(
    demographic: PrimaryClassDemographicApiData | undefined,
    serverFilter: ServerFilterEnum
): PrimaryClassPieResult {
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

        Object.entries(serverData).forEach(
            ([primaryClassRaw, countNullable]) => {
                const primaryClassLower = primaryClassRaw.toLowerCase()
                if (primaryClassLower === "none") return
                const count = countNullable ?? 0
                total += count
                const existing = slices.find((s) => s.id === primaryClassRaw)
                if (existing) existing.value += count
                else {
                    slices.push({
                        id: primaryClassRaw,
                        label: primaryClassRaw,
                        value: count,
                    })
                }
            }
        )
    })

    return { data: slices, total }
}
