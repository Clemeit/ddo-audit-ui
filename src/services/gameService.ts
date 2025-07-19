import {
    PopulationEndpointResponse,
    PopulationTotalsEndpointResponse,
    UniquePopulationEndpointResponse,
} from "../models/Game.ts"
import { getRequest, ServiceRequestProps } from "./apiHelper.ts"

const GAME_ENDPOINT = "game"

function getServerInfo({ signal }: ServiceRequestProps) {
    return getRequest(`${GAME_ENDPOINT}/server-info`, { signal })
}

function getServerInfoByServerName(serverName: string, signal?: AbortSignal) {
    return getRequest(`${GAME_ENDPOINT}/server-info/${serverName}`, { signal })
}

function getPopulationData1Day(
    signal?: AbortSignal
): Promise<PopulationEndpointResponse> {
    return getRequest<PopulationEndpointResponse>(
        `${GAME_ENDPOINT}/population/data/day`,
        { signal }
    )
}

function getPopulationData1Week(
    signal?: AbortSignal
): Promise<PopulationEndpointResponse> {
    return getRequest<PopulationEndpointResponse>(
        `${GAME_ENDPOINT}/population/data/week`,
        { signal }
    )
}

function getPopulationData1Month(
    signal?: AbortSignal
): Promise<PopulationEndpointResponse> {
    return getRequest<PopulationEndpointResponse>(
        `${GAME_ENDPOINT}/population/data/month`,
        { signal }
    )
}

function getPopulationData1Quarter(
    signal?: AbortSignal
): Promise<PopulationEndpointResponse> {
    return getRequest<PopulationEndpointResponse>(
        `${GAME_ENDPOINT}/population/data/quarter`,
        { signal }
    )
}

function getTotalPopulation1Day(
    signal?: AbortSignal
): Promise<PopulationTotalsEndpointResponse> {
    return getRequest<PopulationTotalsEndpointResponse>(
        `${GAME_ENDPOINT}/population/totals/day`,
        { signal }
    )
}

function getTotalPopulation1Week(
    signal?: AbortSignal
): Promise<PopulationTotalsEndpointResponse> {
    return getRequest<PopulationTotalsEndpointResponse>(
        `${GAME_ENDPOINT}/population/totals/week`,
        { signal }
    )
}

function getTotalPopulation1Month(
    signal?: AbortSignal
): Promise<PopulationTotalsEndpointResponse> {
    return getRequest<PopulationTotalsEndpointResponse>(
        `${GAME_ENDPOINT}/population/totals/month`,
        { signal }
    )
}

function getTotalPopulation1Quarter(
    signal?: AbortSignal
): Promise<PopulationTotalsEndpointResponse> {
    return getRequest<PopulationTotalsEndpointResponse>(
        `${GAME_ENDPOINT}/population/totals/quarter`,
        { signal }
    )
}

function getUniquePopulation1Month(
    signal?: AbortSignal
): Promise<PopulationTotalsEndpointResponse> {
    return getRequest<PopulationTotalsEndpointResponse>(
        `${GAME_ENDPOINT}/population/unique/month`,
        { signal }
    )
}

function getUniquePopulation1Quarter(
    signal?: AbortSignal
): Promise<UniquePopulationEndpointResponse> {
    return getRequest<UniquePopulationEndpointResponse>(
        `${GAME_ENDPOINT}/population/unique/quarter`,
        { signal }
    )
}

export {
    getServerInfo,
    getServerInfoByServerName,
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
