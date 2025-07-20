import {
    PopulationEndpointResponse,
    PopulationTotalsEndpointResponse,
    UniquePopulationEndpointResponse,
} from "../models/Game.ts"

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
}
