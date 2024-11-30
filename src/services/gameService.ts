import axios from "axios"

const API_URL = "https://api.hcnxsryjficudzazjxty.com/v1/game"

function getServerInfo() {
    return axios.get(`${API_URL}/server-info`)
}

function getServerInfoByServerName(serverName: string) {
    return axios.get(`${API_URL}/server-info/${serverName}`)
}

export { getServerInfo, getServerInfoByServerName }
