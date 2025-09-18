import { RangeEnum } from "../models/Common.ts"
import { TotalLevelDemographicApi } from "../models/Demographics.ts"
import { getRequest } from "./apiHelper.ts"

const DEMOGRAPHICS_ENDPOINT = "demographics"

export function getTotalLevelDemographic(
    range: RangeEnum = RangeEnum.QUARTER,
    signal?: AbortSignal
): Promise<TotalLevelDemographicApi> {
    return getRequest<TotalLevelDemographicApi>(
        `${DEMOGRAPHICS_ENDPOINT}/total-level/${range}`,
        { signal }
    )
}

export function getRaceDemographic(
    range: RangeEnum = RangeEnum.QUARTER,
    signal?: AbortSignal
): Promise<TotalLevelDemographicApi> {
    return getRequest<TotalLevelDemographicApi>(
        `${DEMOGRAPHICS_ENDPOINT}/race/${range}`,
        { signal }
    )
}

export function getGenderDemographic(
    range: RangeEnum = RangeEnum.QUARTER,
    signal?: AbortSignal
): Promise<TotalLevelDemographicApi> {
    return getRequest<TotalLevelDemographicApi>(
        `${DEMOGRAPHICS_ENDPOINT}/gender/${range}`,
        { signal }
    )
}

export function getGuildAffiliatedDemographic(
    range: RangeEnum = RangeEnum.QUARTER,
    signal?: AbortSignal
): Promise<TotalLevelDemographicApi> {
    return getRequest<TotalLevelDemographicApi>(
        `${DEMOGRAPHICS_ENDPOINT}/guild-affiliated/${range}`,
        { signal }
    )
}

export function getPrimaryClassDemographic(
    range: RangeEnum = RangeEnum.QUARTER,
    signal?: AbortSignal
): Promise<TotalLevelDemographicApi> {
    return getRequest<TotalLevelDemographicApi>(
        `${DEMOGRAPHICS_ENDPOINT}/primary-class/${range}`,
        { signal }
    )
}

export function getClassCountDemographic(
    range: RangeEnum = RangeEnum.QUARTER,
    signal?: AbortSignal
): Promise<TotalLevelDemographicApi> {
    return getRequest<TotalLevelDemographicApi>(
        `${DEMOGRAPHICS_ENDPOINT}/class-count/${range}`,
        { signal }
    )
}
