import axios from "axios"

// TODO: replace this with the base URL, should be stored in an environment variable
const API_URL = "https://api.hcnxsryjficudzazjxty.com/v1/characters"

function getCharacterByNameAndServer(name: string, server: string) {
    return axios.get(`${API_URL}/${server}/${name}`)
}

function getCharacterByName(name: string) {
    return axios.get(`${API_URL}/any/${name}`)
}

function getCharacterById(id: string) {
    return axios.get(`${API_URL}/${id}`)
}

function getCharactersByIds(ids: number[]) {
    return axios.get(`${API_URL}/ids/${ids.join(",")}`)
}

function getCharacterTimersByIds(ids: number[]) {
    return axios.get(`${API_URL}/timers/${ids.join(",")}`) // TODO: fix the URL
}

export {
    getCharacterByNameAndServer,
    getCharacterById,
    getCharactersByIds,
    getCharacterTimersByIds,
    getCharacterByName,
}
