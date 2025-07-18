import { PopulationDataPoint } from "../models/Game.ts"

export const findMostPopulatedServer = (
    data: Record<string, PopulationDataPoint>
): string => {
    return Object.entries(data || {}).reduce(
        (mostPopulated, [serverName, serverData]) => {
            return serverData.character_count > mostPopulated.maxPopulation
                ? { serverName, maxPopulation: serverData.character_count }
                : mostPopulated
        },
        { serverName: "", maxPopulation: 0 }
    ).serverName
}

export const calculateTotalPopulation = (serverInfoData: any) => {
    if (!serverInfoData) return { totalPopulation: 0, totalLfmCount: 0 }

    return Object.values(serverInfoData).reduce(
        (totals: any, server: any) => ({
            totalPopulation:
                totals.totalPopulation + (server.character_count || 0),
            totalLfmCount: totals.totalLfmCount + (server.lfm_count || 0),
        }),
        { totalPopulation: 0, totalLfmCount: 0 }
    )
}
