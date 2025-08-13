interface ServerUniqueData {
    unique_character_count: number
    unique_guild_count: number
}

interface ServerBreakdown {
    [serverName: string]: ServerUniqueData
}

interface UniquePopulationData {
    unique_character_count: number
    unique_guild_count: number
    days_analyzed: number
    start_date: string
    end_date: string
    server_breakdown: ServerBreakdown
}

interface UniquePopulationEndpointSchema {
    data: UniquePopulationData
}

interface AveragePopulationData {
    [serverName: string]: number | null
}

interface AveragePopulationEndpointSchema {
    data: AveragePopulationData
}

export enum RangeEnum {
    WEEK = "week",
    MONTH = "month",
    QUARTER = "quarter",
}

export type {
    UniquePopulationEndpointSchema,
    UniquePopulationData,
    ServerBreakdown,
    ServerUniqueData,
    AveragePopulationEndpointSchema,
    AveragePopulationData,
}
