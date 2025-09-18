import {
    PopulationEndpointResponse,
    PopulationTotalsEndpointResponse,
    UniquePopulationEndpointResponse,
} from "../models/Game.ts"
import {
    AveragePopulationEndpointSchema,
    PopulationByDayOfWeekData,
    PopulationByHourAndDayOfWeekEndpointSchema,
    PopulationByHourEndpointSchema,
} from "../models/Population.ts"
import { RangeEnum } from "../models/Common.ts"

import { getRequest } from "./apiHelper.ts"

const POPULATION_ENDPOINT = "population"

function getPopulationTimeseriesForRange(
    range: RangeEnum = RangeEnum.QUARTER,
    signal?: AbortSignal
): Promise<PopulationEndpointResponse> {
    return getRequest<PopulationEndpointResponse>(
        `${POPULATION_ENDPOINT}/timeseries/${range}`,
        { signal }
    )
}

function getTotalPopulationForRange(
    range: RangeEnum = RangeEnum.QUARTER,
    signal?: AbortSignal
): Promise<PopulationTotalsEndpointResponse> {
    return getRequest<PopulationTotalsEndpointResponse>(
        `${POPULATION_ENDPOINT}/totals/${range}`,
        { signal }
    )
}

function getUniquePopulationForRange(
    range: RangeEnum = RangeEnum.QUARTER,
    signal?: AbortSignal
): Promise<UniquePopulationEndpointResponse> {
    return getRequest<UniquePopulationEndpointResponse>(
        `${POPULATION_ENDPOINT}/unique/${range}`,
        { signal }
    )
}

function getAveragePopulationForRange(
    range: RangeEnum = RangeEnum.QUARTER,
    signal?: AbortSignal
): Promise<AveragePopulationEndpointSchema> {
    return getRequest<AveragePopulationEndpointSchema>(
        `${POPULATION_ENDPOINT}/average/${range}`,
        { signal }
    )
}

function getPopulationByHourForRange(
    range: RangeEnum = RangeEnum.QUARTER,
    signal?: AbortSignal
): Promise<PopulationByHourEndpointSchema> {
    return getRequest<PopulationByHourEndpointSchema>(
        `${POPULATION_ENDPOINT}/by-hour/${range}`,
        { signal }
    )
}

function getPopulationByDayOfWeekForRange(
    range: RangeEnum = RangeEnum.QUARTER,
    signal?: AbortSignal
): Promise<PopulationByDayOfWeekData> {
    return getRequest<PopulationByDayOfWeekData>(
        `${POPULATION_ENDPOINT}/by-day-of-week/${range}`,
        { signal }
    )
}

function getPopulationByHourAndDayOfWeekForRange(
    range: RangeEnum = RangeEnum.QUARTER,
    signal?: AbortSignal
): Promise<PopulationByHourAndDayOfWeekEndpointSchema> {
    return getRequest<PopulationByHourAndDayOfWeekEndpointSchema>(
        `${POPULATION_ENDPOINT}/by-hour-and-day-of-week/${range}`,
        { signal }
    )
}

export {
    getPopulationTimeseriesForRange,
    getTotalPopulationForRange,
    getUniquePopulationForRange,
    getAveragePopulationForRange,
    getPopulationByHourForRange,
    getPopulationByDayOfWeekForRange,
    getPopulationByHourAndDayOfWeekForRange,
}
