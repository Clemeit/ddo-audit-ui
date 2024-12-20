import axios from 'axios';

const API_URL = "https://api.hcnxsryjficudzazjxty.com/v1/characters"

function getCharacterByNameAndServer(name: string, server: string) {
    return axios.get(`${API_URL}/${server}/${name}`)
}

function getCharacterById(id: string) {
    return axios.get(`${API_URL}/${id}`)
}

export{
    getCharacterByNameAndServer,getCharacterById
}