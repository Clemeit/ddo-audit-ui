import { getRequest } from "./apiHelper"
import {
    CharacterActivityEndpointResponse,
    CharacterActivityType,
    RaidActivityEndpointResponse,
} from "../models/Activity"

const ACTIVITY_ENDPOINT = "activity"

function getCharacterActivityById(
    id: number,
    activityType: CharacterActivityType,
    accessToken: string,
    startDate?: string,
    endDate?: string,
    limit?: number
): Promise<CharacterActivityEndpointResponse> {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)
    if (limit) params.append("limit", limit.toString())

    return getRequest(`${ACTIVITY_ENDPOINT}/${id}/${activityType}`, {
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

export { getCharacterActivityById, getCharacterRaidActivityByIds }
