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
