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
        [hour: string]: {
            avg_character_count: number | null
            avg_lfm_count: number | null
        }
    }
}

interface PopulationByHourEndpointSchema {
    data: PopulationByHourData
}

interface PopulationByDayOfWeekData {
    [serverName: string]: {
        [day: string]: {
            avg_character_count: number | null
            avg_lfm_count: number | null
        }
    }
}

interface PopulationByDayOfWeekEndpointSchema {
    data: PopulationByDayOfWeekData
}

interface PopulationByHourAndDayOfWeekData {
    [serverName: string]: {
        [day: string]: {
            [hour: string]: {
                avg_character_count: number | null
                avg_lfm_count: number | null
            }
        }
    }
}

interface PopulationByHourAndDayOfWeekEndpointSchema {
    data: PopulationByHourAndDayOfWeekData
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
    PopulationByHourAndDayOfWeekEndpointSchema,
    PopulationByHourAndDayOfWeekData,
}
