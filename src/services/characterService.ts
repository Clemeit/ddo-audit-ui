import axios from "axios"

const API_URL = "https://api.hcnxsryjficudzazjxty.com/v1/characters"

function getCharacterByNameAndServer(name: string, server: string) {
    return axios.get(`${API_URL}/${server}/${name}`)
}

function getCharacterById(id: string) {
    return axios.get(`${API_URL}/${id}`)
}

function getCharactersByIds(ids: string[]) {
    return axios.get(`${API_URL}/ids/${ids.join(",")}`)
}

function getCharacterTimersByIds(ids: string[]) {
    return axios.get(`${API_URL}/timers/${ids.join(",")}`) // TODO: fix the URL
}

export {
    getCharacterByNameAndServer,
    getCharacterById,
    getCharactersByIds,
    getCharacterTimersByIds,
}
