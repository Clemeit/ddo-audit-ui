import axios from "axios"
import { getRequest } from "./apiHelper"
import { RaidActivityEndpointResponse } from "../models/Activity"

const ACTIVITY_ENDPOINT = "activity"

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

    return getRequest(`${ACTIVITY_ENDPOINT}/${id}/location`, {
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

    return getRequest(`${ACTIVITY_ENDPOINT}/${id}/status`, {
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

    return getRequest(`${ACTIVITY_ENDPOINT}/${id}/level`, {
        headers: {
            Authorization: accessToken,
        },
        params,
    })
}

function getCharacterRaidActivityByIds(
    characterIds: number[]
): Promise<RaidActivityEndpointResponse> {
    const params = new URLSearchParams()
    params.append("character_ids", characterIds.join(","))

    return getRequest(`${ACTIVITY_ENDPOINT}/raids`, {
        params,
    })
}

export {
    getCharacterLocationActivityById,
    getCharacterStatusActivityById,
    getCharacterLevelActivityById,
    getCharacterRaidActivityByIds,
}
