import axios from "axios"

const API_URL = "https://api.hcnxsryjficudzazjxty.com/v1/activity"

function getCharacterLocationActivityById(
    id: string,
    accessToken: string,
    startDate?: string,
    endDate?: string,
    limit?: number
) {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)
    if (limit) params.append("limit", limit.toString())

    return axios.get(`${API_URL}/${id}/location`, {
        headers: {
            Authorization: accessToken,
        },
        params,
    })
}

function getCharacterStatusActivityById(
    id: string,
    accessToken: string,
    startDate?: string,
    endDate?: string,
    limit?: number
) {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)
    if (limit) params.append("limit", limit.toString())

    return axios.get(`${API_URL}/${id}/status`, {
        headers: {
            Authorization: accessToken,
        },
        params,
    })
}

export { getCharacterLocationActivityById, getCharacterStatusActivityById }
