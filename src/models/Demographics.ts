export interface TotalLevelDemographicApiData {
    [serverName: string]: {
        [totalLevel: string]: number | null
    } | null
}

export interface TotalLevelDemographicApi {
    data: TotalLevelDemographicApiData
}

export interface RaceDemographicApiData {
    [serverName: string]: {
        [race: string]: number | null
    } | null
}

export interface RaceDemographicApi {
    data: RaceDemographicApiData
}

export interface GenderDemographicApiData {
    [serverName: string]: {
        [gender: string]: number | null
    } | null
}

export interface GenderDemographicApi {
    data: GenderDemographicApiData
}

export interface GuildAffiliatedDemographicApiData {
    [serverName: string]: {
        in_guild: number | null
        not_in_guild: number | null
    } | null
}

export interface GuildAffiliatedDemographicApi {
    data: GuildAffiliatedDemographicApiData
}

export interface PrimaryClassDemographicApiData {
    [serverName: string]: {
        [primaryClass: string]: number | null
    } | null
}

export interface PrimaryClassDemographicApi {
    data: PrimaryClassDemographicApiData
}

export interface ClassCountDemographicApiData {
    [serverName: string]: {
        [classCount: string]: number | null
    } | null
}

export interface ClassCountDemographicApi {
    data: ClassCountDemographicApiData
}
