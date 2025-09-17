export interface TotalLevelDemographicApiData {
    [severName: string]: {
        [totalLevel: string]: number | null
    } | null
}

export interface TotalLevelDemographicApi {
    data: TotalLevelDemographicApiData
}
