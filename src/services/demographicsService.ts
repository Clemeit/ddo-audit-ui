import { RangeEnum } from "../models/Common.ts"
import {
    TotalLevelDemographicApi,
    GuildAffiliatedDemographicApi,
    ClassCountDemographicApi,
    RaceDemographicApi,
    GenderDemographicApi,
    PrimaryClassDemographicApi,
} from "../models/Demographics.ts"
import { getRequest } from "./apiHelper.ts"

const DEMOGRAPHICS_ENDPOINT = "demographics"

export function getTotalLevelDemographic(
    range: RangeEnum = RangeEnum.QUARTER,
    activityLevel: "All" | "Active" | "Inactive" = "Active",
    signal?: AbortSignal
): Promise<TotalLevelDemographicApi> {
    return getRequest<TotalLevelDemographicApi>(
        `${DEMOGRAPHICS_ENDPOINT}/total-level/${range}?activity_level=${activityLevel}`,
        { signal }
    )
}

export function getRaceDemographic(
    range: RangeEnum = RangeEnum.QUARTER,
    activityLevel: "All" | "Active" | "Inactive" = "Active",
    signal?: AbortSignal
): Promise<RaceDemographicApi> {
    return getRequest<RaceDemographicApi>(
        `${DEMOGRAPHICS_ENDPOINT}/race/${range}?activity_level=${activityLevel}`,
        { signal }
    )
}

export function getGenderDemographic(
    range: RangeEnum = RangeEnum.QUARTER,
    activityLevel: "All" | "Active" | "Inactive" = "Active",
    signal?: AbortSignal
): Promise<GenderDemographicApi> {
    return getRequest<GenderDemographicApi>(
        `${DEMOGRAPHICS_ENDPOINT}/gender/${range}?activity_level=${activityLevel}`,
        { signal }
    )
}

export function getGuildAffiliatedDemographic(
    range: RangeEnum = RangeEnum.QUARTER,
    activityLevel: "All" | "Active" | "Inactive" = "Active",
    signal?: AbortSignal
): Promise<GuildAffiliatedDemographicApi> {
    return getRequest<GuildAffiliatedDemographicApi>(
        `${DEMOGRAPHICS_ENDPOINT}/guild-affiliated/${range}?activity_level=${activityLevel}`,
        { signal }
    )
}

export function getPrimaryClassDemographic(
    range: RangeEnum = RangeEnum.QUARTER,
    activityLevel: "All" | "Active" | "Inactive" = "Active",
    signal?: AbortSignal
): Promise<PrimaryClassDemographicApi> {
    return getRequest<PrimaryClassDemographicApi>(
        `${DEMOGRAPHICS_ENDPOINT}/primary-class/${range}?activity_level=${activityLevel}`,
        { signal }
    )
}

export function getClassCountDemographic(
    range: RangeEnum = RangeEnum.QUARTER,
    activityLevel: "All" | "Active" | "Inactive" = "Active",
    signal?: AbortSignal
): Promise<ClassCountDemographicApi> {
    return getRequest<ClassCountDemographicApi>(
        `${DEMOGRAPHICS_ENDPOINT}/class-count/${range}?activity_level=${activityLevel}`,
        { signal }
    )
}
