export interface TotalLevelDemographicApiData {
    [severName: string]: {
        [totalLevel: string]: number | null
    } | null
}

export interface TotalLevelDemographicApi {
    data: TotalLevelDemographicApiData
}

export interface RaceDemographicApiData {
    [severName: string]: {
        [race: string]: number | null
    } | null
}

export interface RaceDemographicApi {
    data: RaceDemographicApiData
}

export interface GenderDemographicApiData {
    [severName: string]: {
        [gender: string]: number | null
    } | null
}

export interface GenderDemographicApi {
    data: GenderDemographicApiData
}

export interface GuildAffiliatedDemographicApiData {
    [severName: string]: {
        in_guild: number | null
        not_in_guild: number | null
    } | null
}

export interface GuildAffiliatedDemographicApi {
    data: GuildAffiliatedDemographicApiData
}

export interface PrimaryClassDemographicApiData {
    [severName: string]: {
        [primaryClass: string]: number | null
    } | null
}

export interface PrimaryClassDemographicApi {
    data: PrimaryClassDemographicApiData
}

export interface ClassCountDemographicApiData {
    [severName: string]: {
        [classCount: string]: number | null
    } | null
}

export interface ClassCountDemographicApi {
    data: ClassCountDemographicApiData
}
