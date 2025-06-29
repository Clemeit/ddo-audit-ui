import axios from "axios"

const API_URL = "https://api.hcnxsryjficudzazjxty.com/v1/verification"

function getVerificationChallengeByCharacterId(character_id: number) {
    return axios.get(`${API_URL}/${character_id}`)
}

export { getVerificationChallengeByCharacterId }
