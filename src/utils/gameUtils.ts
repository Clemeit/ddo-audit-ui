import { PopulationDataPoint, ServerInfoApiDataModel } from "../models/Game.ts"

export const findMostPopulatedServer = (
    data: Record<string, PopulationDataPoint>
): string => {
    const entries = Object.entries(data || {})

    // Return empty string if no data
    if (entries.length === 0) {
        return ""
    }

    let mostPopulatedServer = ""
    let maxPopulation = -1

    for (const [serverName, serverData] of entries) {
        if (serverData?.character_count > maxPopulation) {
            maxPopulation = serverData.character_count
            mostPopulatedServer = serverName
        }
    }

    return mostPopulatedServer
}

interface TotalPopulationResult {
    totalPopulation: number
    totalLfmCount: number
}

export const calculateTotalPopulation = (
    serverInfoData: ServerInfoApiDataModel | null | undefined
): TotalPopulationResult => {
    if (!serverInfoData) {
        return { totalPopulation: 0, totalLfmCount: 0 }
    }

    let totalPopulation = 0
    let totalLfmCount = 0

    for (const server of Object.values(serverInfoData)) {
        if (server) {
            totalPopulation += server.character_count || 0
            totalLfmCount += server.lfm_count || 0
        }
    }

    return { totalPopulation, totalLfmCount }
}
