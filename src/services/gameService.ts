import axios from "axios"
import { PopulationEndpointResponse } from "../models/Game.ts"

const API_URL = "https://api.hcnxsryjficudzazjxty.com/v1/game"

function getServerInfo() {
    return axios.get(`${API_URL}/server-info`)
}

function getServerInfoByServerName(serverName: string) {
    return axios.get(`${API_URL}/server-info/${serverName}`)
}

function getPopulationData1Day(): Promise<
    Record<string, PopulationEndpointResponse>
> {
    return axios.get(`${API_URL}/population/day`)
}

function getPopulationData1Week(): Promise<
    Record<string, PopulationEndpointResponse>
> {
    return axios.get(`${API_URL}/population/week`)
}

function getPopulationData1Month(): Promise<
    Record<string, PopulationEndpointResponse>
> {
    return axios.get(`${API_URL}/population/month`)
}

export {
    getServerInfo,
    getServerInfoByServerName,
    getPopulationData1Day,
    getPopulationData1Week,
    getPopulationData1Month,
}
