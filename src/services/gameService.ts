import {
    PopulationEndpointResponse,
    PopulationTotalsEndpointResponse,
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
        `${GAME_ENDPOINT}/population/day`,
        { signal }
    )
}

function getPopulationData1Week(
    signal?: AbortSignal
): Promise<PopulationEndpointResponse> {
    return getRequest<PopulationEndpointResponse>(
        `${GAME_ENDPOINT}/population/week`,
        { signal }
    )
}

function getPopulationData1Month(
    signal?: AbortSignal
): Promise<PopulationEndpointResponse> {
    return getRequest<PopulationEndpointResponse>(
        `${GAME_ENDPOINT}/population/month`,
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

export {
    getServerInfo,
    getServerInfoByServerName,
    getPopulationData1Day,
    getPopulationData1Week,
    getPopulationData1Month,
    getTotalPopulation1Day,
    getTotalPopulation1Week,
    getTotalPopulation1Month,
}
