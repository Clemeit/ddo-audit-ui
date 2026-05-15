import { MIN_LEVEL, MAX_LEVEL } from "../constants/game"
import { TotalLevelDemographicApiData } from "../models/Demographics"
import { NivoNumberSeries } from "./nivoUtils"
import { SERVERS_64_BITS_LOWER } from "../constants/servers"

/**
 * Builds line chart series for total level distribution per server.
 * - Applies server filter (32-bit / 64-bit / all)
 * - Optionally normalizes each server's distribution to percentages of its own total
 */
export function buildLevelDistributionSeries(
    data: TotalLevelDemographicApiData | undefined,
    normalized: boolean
): NivoNumberSeries[] {
    if (!data) return []

    const series: NivoNumberSeries[] = []

    Object.entries(data).forEach(([serverName, serverData]) => {
        const lower = serverName.toLowerCase()
        if (!SERVERS_64_BITS_LOWER.includes(lower)) {
            return
        }

        const totalCount = Object.values(serverData).reduce(
            (sum, count) => sum + (count ?? 0),
            0
        )
        const dataToUse = normalized
            ? Object.fromEntries(
                  Object.entries(serverData).map(([level, count]) => [
                      level,
                      totalCount > 0 ? (count ?? 0) / totalCount : 0,
                  ])
              )
            : serverData

        const serverSeries: NivoNumberSeries = { id: serverName, data: [] }
        Object.entries(dataToUse).forEach(([level, count]) => {
            const lvlNum = Number(level)
            if (lvlNum >= MIN_LEVEL && lvlNum <= MAX_LEVEL) {
                serverSeries.data.push({ x: lvlNum, y: Number(count ?? 0) })
            }
        })
        series.push(serverSeries)
    })

    return series
}
