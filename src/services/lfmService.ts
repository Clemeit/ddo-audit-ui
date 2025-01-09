import axios from "axios"

const API_URL = "https://api.hcnxsryjficudzazjxty.com/v1/lfms"

function getAllLfms() {
    return axios.get(`${API_URL}`)
}

function getLfmsByServerName(serverName: string) {
    return axios.get(`${API_URL}/${serverName.toLowerCase()}`)
}

export { getAllLfms, getLfmsByServerName }
