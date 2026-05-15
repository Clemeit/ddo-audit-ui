import { RaceDemographicApiData } from "../models/Demographics"
import { SERVERS_64_BITS_LOWER } from "../constants/servers"
import { NivoPieSlice } from "./nivoUtils"

export interface RacePieResult {
    data: NivoPieSlice[]
    total: number
}

/**
 * Aggregates race demographic data across servers.
 * - Skips races containing 'unknown'.
 * - Applies server filtering (32-bit / 64-bit / all).
 * - Sums counts per race.
 */
export function buildRacePie(
    demographic: RaceDemographicApiData | undefined
): RacePieResult {
    if (!demographic) return { data: [], total: 0 }

    const includeServer = (serverName: string): boolean =>
        SERVERS_64_BITS_LOWER.includes(serverName.toLowerCase())

    const slices: NivoPieSlice[] = []
    let total = 0

    Object.entries(demographic).forEach(([serverName, serverData]) => {
        if (!serverData || !includeServer(serverName)) return

        Object.entries(serverData).forEach(([raceRaw, countNullable]) => {
            const raceLower = raceRaw.toLowerCase()
            if (raceLower.includes("unknown")) return
            const count = countNullable ?? 0
            total += count
            const existing = slices.find((s) => s.id === raceRaw)
            if (existing) existing.value += count
            else {
                slices.push({ id: raceRaw, label: raceRaw, value: count })
            }
        })
    })

    return { data: slices, total }
}
