import axios from "axios"
import {
    PopulationDataPoint,
    PopulationEndpointResponse,
} from "../models/Game.ts"

const API_URL = "https://api.hcnxsryjficudzazjxty.com/v1/game"

function getServerInfo() {
    return axios.get(`${API_URL}/server-info`)
}

function getServerInfoByServerName(serverName: string) {
    return axios.get(`${API_URL}/server-info/${serverName}`)
}

// TODO: These return types need to be defined. This is disgusting.
function getPopulationData1Day(): Promise<
    Record<string, PopulationEndpointResponse>
> {
    return axios.get(`${API_URL}/population/day`)
}

// TODO: These return types need to be defined. This is disgusting.
function getPopulationData1Week(): Promise<
    Record<string, PopulationEndpointResponse>
> {
    return axios.get(`${API_URL}/population/week`)
}

// TODO: These return types need to be defined. This is disgusting.
function getPopulationData1Month(): Promise<
    Record<string, PopulationEndpointResponse>
> {
    return axios.get(`${API_URL}/population/month`)
}

// TODO: These return types need to be defined. This is disgusting.
function getTotalPopulation1Day(): Promise<
    Record<string, Record<string, Record<string, PopulationDataPoint>>>
> {
    return axios.get(`${API_URL}/population/totals/day`)
}

// TODO: These return types need to be defined. This is disgusting.
function getTotalPopulation1Week(): Promise<
    Record<string, Record<string, Record<string, PopulationDataPoint>>>
> {
    return axios.get(`${API_URL}/population/totals/week`)
}

// TODO: These return types need to be defined. This is disgusting.
function getTotalPopulation1Month(): Promise<
    Record<string, Record<string, Record<string, PopulationDataPoint>>>
> {
    return axios.get(`${API_URL}/population/totals/month`)
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
