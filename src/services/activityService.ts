import axios from "axios"

const API_URL = "https://api.hcnxsryjficudzazjxty.com/v1/activity"

function getCharacterLocationActivityById(
    id: number,
    accessToken: string,
    startDate?: string,
    endDate?: string,
    limit?: number,
    areaName?: string
) {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)
    if (limit) params.append("limit", limit.toString())
    if (areaName) params.append("area_name", areaName)

    return axios.get(`${API_URL}/${id}/location`, {
        headers: {
            Authorization: accessToken,
        },
        params,
    })
}

function getCharacterStatusActivityById(
    id: number,
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

function getCharacterLevelActivityById(
    id: number,
    accessToken: string,
    startDate?: string,
    endDate?: string,
    limit?: number
) {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)
    if (limit) params.append("limit", limit.toString())

    return axios.get(`${API_URL}/${id}/level`, {
        headers: {
            Authorization: accessToken,
        },
        params,
    })
}

function getCharacterRaidActivityByIds(characterIds: number[]) {
    const params = new URLSearchParams()
    params.append("character_ids", characterIds.join(","))

    return axios.get(`${API_URL}/raids`, {
        params,
    })
}

export {
    getCharacterLocationActivityById,
    getCharacterStatusActivityById,
    getCharacterLevelActivityById,
    getCharacterRaidActivityByIds,
}
