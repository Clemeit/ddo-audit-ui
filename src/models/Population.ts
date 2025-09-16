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
    [serverName: string]: {
        avg_character_count: number | null
        avg_lfm_count: number | null
    } | null
}

interface AveragePopulationEndpointSchema {
    data: AveragePopulationData
}

interface PopulationByHourData {
    [serverName: string]: {
        [hour: string]: number | null
    }
}

interface PopulationByHourEndpointSchema {
    data: PopulationByHourData
}

interface PopulationByDayOfWeekData {
    [serverName: string]: {
        [day: string]: number | null
    }
}

interface PopulationByDayOfWeekEndpointSchema {
    data: PopulationByDayOfWeekData
}

export enum RangeEnum {
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
    QUARTER = "quarter",
    YEAR = "year",
}

export enum ServerFilterEnum {
    ALL = "All",
    ONLY_64_BIT = "Only 64-Bit",
    ONLY_32_BIT = "Only 32-Bit",
}

export enum DataTypeFilterEnum {
    CHARACTERS = "Characters",
    LFMS = "LFMs",
}

export type {
    UniquePopulationEndpointSchema,
    UniquePopulationData,
    ServerBreakdown,
    ServerUniqueData,
    AveragePopulationEndpointSchema,
    AveragePopulationData,
    PopulationByHourEndpointSchema,
    PopulationByHourData,
    PopulationByDayOfWeekEndpointSchema,
    PopulationByDayOfWeekData,
}
