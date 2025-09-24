import { GetSettingsResponse, PostSettingsResponse } from "../models/User"
import { getRequest, postRequest } from "./apiHelper"

const USER_ENDPOINT = "user"

function getUserSettings(user_id: string) {
    return getRequest<GetSettingsResponse>(
        `${USER_ENDPOINT}/settings/${user_id}`
    )
}

function postUserSettings(settings: any, userId: string) {
    return postRequest<PostSettingsResponse>(`${USER_ENDPOINT}/settings`, {
        data: { settings, originatingUserId: userId },
        headers: {
            "Content-Type": "application/json",
        },
    })
}

export { getUserSettings, postUserSettings }
