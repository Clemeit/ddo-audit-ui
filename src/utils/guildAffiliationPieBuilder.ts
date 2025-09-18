import { GuildAffiliatedDemographicApiData } from "../models/Demographics"
import { ServerFilterEnum } from "../models/Common"
import {
    SERVERS_32_BITS_LOWER,
    SERVERS_64_BITS_LOWER,
} from "../constants/servers"
import { NivoPieSlice } from "./nivoUtils"

/** Result shape for pie slice builder. */
export interface PieBuildResult {
    data: NivoPieSlice[]
    total: number
}

/**
 * Converts raw guild affiliation demographic data (per-server) into aggregated pie slices.
 *
 * Behavior:
 * - Filters servers by the provided `serverFilter`.
 * - Aggregates counts into two canonical IDs: `in_guild` and `not_in_guild`.
 * - Returns a `total` for convenience to avoid recomputing upstream.
 * - Gracefully handles `undefined` and `null` values treating them as 0.
 *
 * This utility is intentionally stateless & pure so it can be used in `useMemo`
 * inside multiple visualization components without side effects.
 */
export function buildGuildAffiliationPie(
    demographic: GuildAffiliatedDemographicApiData | undefined,
    serverFilter: ServerFilterEnum
): PieBuildResult {
    if (!demographic) return { data: [], total: 0 }

    const slices: NivoPieSlice[] = []
    let total = 0

    const includeServer = (serverName: string): boolean => {
        const lower = serverName.toLowerCase()
        if (serverFilter === ServerFilterEnum.ONLY_32_BIT) {
            return SERVERS_32_BITS_LOWER.includes(lower)
        }
        if (serverFilter === ServerFilterEnum.ONLY_64_BIT) {
            return SERVERS_64_BITS_LOWER.includes(lower)
        }
        return true // ALL
    }

    Object.entries(demographic).forEach(([serverName, serverData]) => {
        if (!serverData || !includeServer(serverName)) return

        Object.entries(serverData).forEach(([label, countNullable]) => {
            const count = countNullable ?? 0
            total += count
            const existing = slices.find((s) => s.id === label)
            if (existing) existing.value += count
            else {
                slices.push({
                    id: label,
                    label: label === "in_guild" ? "In Guild" : "Not in Guild",
                    value: count,
                })
            }
        })
    })

    return { data: slices, total }
}
