import {
    PopulationEndpointResponse,
    PopulationTotalsEndpointResponse,
    UniquePopulationEndpointResponse,
} from "../models/Game.ts"
import {
    AveragePopulationEndpointSchema,
    PopulationByHourAndDayOfWeekEndpointSchema,
    PopulationByHourEndpointSchema,
} from "../models/Population.ts"
import { RangeEnum } from "../models/Common.ts"

import { getRequest } from "./apiHelper.ts"

const POPULATION_ENDPOINT = "population"

function getPopulationData1Day(
    signal?: AbortSignal
): Promise<PopulationEndpointResponse> {
    return getRequest<PopulationEndpointResponse>(
        `${POPULATION_ENDPOINT}/timeseries/day`,
        { signal }
    )
}

function getPopulationData1Week(
    signal?: AbortSignal
): Promise<PopulationEndpointResponse> {
    return getRequest<PopulationEndpointResponse>(
        `${POPULATION_ENDPOINT}/timeseries/week`,
        { signal }
    )
}

function getPopulationData1Month(
    signal?: AbortSignal
): Promise<PopulationEndpointResponse> {
    return getRequest<PopulationEndpointResponse>(
        `${POPULATION_ENDPOINT}/timeseries/month`,
        { signal }
    )
}

function getPopulationData1Quarter(
    signal?: AbortSignal
): Promise<PopulationEndpointResponse> {
    return getRequest<PopulationEndpointResponse>(
        `${POPULATION_ENDPOINT}/timeseries/quarter`,
        { signal }
    )
}

function getTotalPopulation1Day(
    signal?: AbortSignal
): Promise<PopulationTotalsEndpointResponse> {
    return getRequest<PopulationTotalsEndpointResponse>(
        `${POPULATION_ENDPOINT}/totals/day`,
        { signal }
    )
}

function getTotalPopulation1Week(
    signal?: AbortSignal
): Promise<PopulationTotalsEndpointResponse> {
    return getRequest<PopulationTotalsEndpointResponse>(
        `${POPULATION_ENDPOINT}/totals/week`,
        { signal }
    )
}

function getTotalPopulation1Month(
    signal?: AbortSignal
): Promise<PopulationTotalsEndpointResponse> {
    return getRequest<PopulationTotalsEndpointResponse>(
        `${POPULATION_ENDPOINT}/totals/month`,
        { signal }
    )
}

function getTotalPopulation1Quarter(
    signal?: AbortSignal
): Promise<PopulationTotalsEndpointResponse> {
    return getRequest<PopulationTotalsEndpointResponse>(
        `${POPULATION_ENDPOINT}/totals/quarter`,
        { signal }
    )
}

function getUniquePopulation1Month(
    signal?: AbortSignal
): Promise<PopulationTotalsEndpointResponse> {
    return getRequest<PopulationTotalsEndpointResponse>(
        `${POPULATION_ENDPOINT}/unique/month`,
        { signal }
    )
}

function getUniquePopulation1Quarter(
    signal?: AbortSignal
): Promise<UniquePopulationEndpointResponse> {
    return getRequest<UniquePopulationEndpointResponse>(
        `${POPULATION_ENDPOINT}/unique/quarter`,
        { signal }
    )
}

function getAveragePopulationDay(
    signal?: AbortSignal
): Promise<AveragePopulationEndpointSchema> {
    return getRequest<AveragePopulationEndpointSchema>(
        `${POPULATION_ENDPOINT}/average/day`,
        { signal }
    )
}

function getAveragePopulationWeek(
    signal?: AbortSignal
): Promise<AveragePopulationEndpointSchema> {
    return getRequest<AveragePopulationEndpointSchema>(
        `${POPULATION_ENDPOINT}/average/week`,
        { signal }
    )
}

function getAveragePopulationMonth(
    signal?: AbortSignal
): Promise<AveragePopulationEndpointSchema> {
    return getRequest<AveragePopulationEndpointSchema>(
        `${POPULATION_ENDPOINT}/average/month`,
        { signal }
    )
}

function getAveragePopulationQuarter(
    signal?: AbortSignal
): Promise<AveragePopulationEndpointSchema> {
    return getRequest<AveragePopulationEndpointSchema>(
        `${POPULATION_ENDPOINT}/average/quarter`,
        { signal }
    )
}

function getAveragePopulationYear(
    signal?: AbortSignal
): Promise<AveragePopulationEndpointSchema> {
    return getRequest<AveragePopulationEndpointSchema>(
        `${POPULATION_ENDPOINT}/average/year`,
        { signal }
    )
}

function getPopulationByHourForDay(
    signal?: AbortSignal
): Promise<PopulationByHourEndpointSchema> {
    return getRequest<PopulationByHourEndpointSchema>(
        `${POPULATION_ENDPOINT}/by-hour/day`,
        { signal }
    )
}

function getPopulationByHourForWeek(
    signal?: AbortSignal
): Promise<PopulationByHourEndpointSchema> {
    return getRequest<PopulationByHourEndpointSchema>(
        `${POPULATION_ENDPOINT}/by-hour/week`,
        { signal }
    )
}

function getPopulationByHourForMonth(
    signal?: AbortSignal
): Promise<PopulationByHourEndpointSchema> {
    return getRequest<PopulationByHourEndpointSchema>(
        `${POPULATION_ENDPOINT}/by-hour/month`,
        { signal }
    )
}

function getPopulationByHourForQuarter(
    signal?: AbortSignal
): Promise<PopulationByHourEndpointSchema> {
    return getRequest<PopulationByHourEndpointSchema>(
        `${POPULATION_ENDPOINT}/by-hour/quarter`,
        { signal }
    )
}

function getPopulationByHourForYear(
    signal?: AbortSignal
): Promise<PopulationByHourEndpointSchema> {
    return getRequest<PopulationByHourEndpointSchema>(
        `${POPULATION_ENDPOINT}/by-hour/year`,
        { signal }
    )
}

function getPopulationByDayOfWeekForRange(
    range: RangeEnum = RangeEnum.QUARTER,
    signal?: AbortSignal
): Promise<PopulationByHourEndpointSchema> {
    return getRequest<PopulationByHourEndpointSchema>(
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
    getPopulationData1Day,
    getPopulationData1Week,
    getPopulationData1Month,
    getPopulationData1Quarter,
    getTotalPopulation1Day,
    getTotalPopulation1Week,
    getTotalPopulation1Month,
    getTotalPopulation1Quarter,
    getUniquePopulation1Month,
    getUniquePopulation1Quarter,
    getAveragePopulationDay,
    getAveragePopulationWeek,
    getAveragePopulationMonth,
    getAveragePopulationQuarter,
    getAveragePopulationYear,
    getPopulationByHourForDay,
    getPopulationByHourForWeek,
    getPopulationByHourForMonth,
    getPopulationByHourForQuarter,
    getPopulationByHourForYear,
    getPopulationByDayOfWeekForRange,
    getPopulationByHourAndDayOfWeekForRange,
}
