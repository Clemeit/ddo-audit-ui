import { UserAuthedResponse } from "../models/Auth"
import {
    GetSettingsResponse,
    PersistentSettingsResponse,
    PersistentSettingsPayload,
    PostSettingsResponse,
    UpdatePasswordPayload,
    UserProfile,
    UserSettings,
} from "../models/User"
import { getRequest, postRequest, putRequest } from "./apiHelper"

const USER_ENDPOINT = "user"

// Old endpoints (should be deprecated)

function getUserSettings(user_id: string) {
    return getRequest<GetSettingsResponse>(
        `${USER_ENDPOINT}/settings/${user_id}`
    )
}

function postUserSettings(settings: UserSettings, userId: string) {
    return postRequest<PostSettingsResponse>(`${USER_ENDPOINT}/settings`, {
        data: { settings, originatingUserId: userId },
        headers: {
            "Content-Type": "application/json",
        },
    })
}

// New endpoints (require auth)

function getProfile(
    accessToken: string,
    signal?: AbortSignal
): Promise<UserProfile> {
    return getRequest(`${USER_ENDPOINT}/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
    })
}

function putUpdatePassword(
    accessToken: string,
    payload: UpdatePasswordPayload,
    signal?: AbortSignal
): Promise<UserAuthedResponse> {
    return putRequest(`${USER_ENDPOINT}/profile/password`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: payload,
        signal,
    })
}

function putPersistentSettings(
    accessToken: string,
    payload: PersistentSettingsPayload,
    signal?: AbortSignal
): Promise<PersistentSettingsResponse> {
    return putRequest(`${USER_ENDPOINT}/settings/persistent`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: payload,
        signal,
    })
}

function getPersistentSettings(
    accessToken: string,
    signal?: AbortSignal
): Promise<PersistentSettingsResponse> {
    return getRequest(`${USER_ENDPOINT}/settings/persistent`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
    })
}

export {
    getUserSettings,
    postUserSettings,
    getProfile,
    putUpdatePassword,
    putPersistentSettings,
    getPersistentSettings,
}
