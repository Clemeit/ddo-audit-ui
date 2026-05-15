import { GenderDemographicApiData } from "../models/Demographics"
import { SERVERS_64_BITS_LOWER } from "../constants/servers"
import { NivoPieSlice } from "./nivoUtils"

export interface GenderPieResult {
    data: NivoPieSlice[]
    total: number
}

/**
 * Aggregates gender demographic data across servers.
 * - Normalizes empty / falsy gender labels to 'Unknown'.
 * - Applies server filtering (32-bit / 64-bit / all).
 * - Sums identical gender buckets across selected servers.
 */
export function buildGenderPie(
    demographic: GenderDemographicApiData | undefined
): GenderPieResult {
    if (!demographic) return { data: [], total: 0 }

    const includeServer = (serverName: string): boolean =>
        SERVERS_64_BITS_LOWER.includes(serverName.toLowerCase())

    const slices: NivoPieSlice[] = []
    let total = 0

    Object.entries(demographic).forEach(([serverName, serverData]) => {
        if (!serverData || !includeServer(serverName)) return

        Object.entries(serverData).forEach(([genderRaw, countNullable]) => {
            const gender = genderRaw ? genderRaw : "Unknown"
            const count = countNullable ?? 0
            total += count
            const existing = slices.find((s) => s.id === gender)
            if (existing) existing.value += count
            else {
                slices.push({ id: gender, label: gender, value: count })
            }
        })
    })

    return { data: slices, total }
}
