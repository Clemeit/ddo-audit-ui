interface ServerInfo {
    index: number
    last_status_check: string
    is_online: boolean
    queue_number: number
    is_vip_only: boolean
    last_data_fetch: string
    creation_timestamp: string
    character_count: number
    lfm_count: number
}

interface ServerInfoApiDataModel {
    argonnessen?: ServerInfo
    cannith?: ServerInfo
    ghallanda?: ServerInfo
    khyber?: ServerInfo
    orien?: ServerInfo
    sarlona?: ServerInfo
    thelanis?: ServerInfo
    wayfinder?: ServerInfo
    hardcore?: ServerInfo
    cormyr?: ServerInfo
}

interface PopulationDataPoint {
    character_count: number
    lfm_count: number
}

interface PopulationPointInTime {
    timestamp?: string
    data?: Record<string, PopulationDataPoint>
}

interface PopulationEndpointResponse {
    data: PopulationPointInTime[]
}

interface ServerUniqueCounts {
    unique_character_count: number
    unique_guild_count: number
}

interface UniquePopulationData {
    unique_character_count: number
    unique_guild_count: number
    days_analyzed: number
    start_date: string
    end_date: string
    server_name: string | null
    server_breakdown: Record<string, ServerUniqueCounts>
}

interface UniquePopulationEndpointResponse {
    data: UniquePopulationData
}

interface PopulationTotalsEndpointResponse {
    data: {
        [serverName: string]: PopulationDataPoint
    }
}

export type {
    ServerInfo,
    ServerInfoApiDataModel,
    PopulationDataPoint,
    PopulationPointInTime,
    PopulationEndpointResponse,
    PopulationTotalsEndpointResponse,
    UniquePopulationEndpointResponse,
}
