import { UserAuthedResponse } from "../models/Auth"
import {
    GetSettingsResponse,
    PersistentSettingsResponse,
    PersistentSettingsPayload,
    PostSettingsResponse,
    UpdatePasswordPayload,
    UserProfile,
    UserSettings,
    DeletePersistentSettingsResponse,
} from "../models/User"
import {
    deleteRequest,
    getRequest,
    patchRequest,
    postRequest,
    putRequest,
} from "./apiHelper"

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

/**
 * Update persistent user settings that are stored in localStorage and synced with the server.
 * These are settings that should persist across sessions and devices, such as UI preferences.
 * This function will overwrite the entire persistent settings object on the server, so it should
 * be used with the full set of settings. For partial updates, use patchPersistentSettings instead.
 * @param accessToken
 * @param payload
 * @param signal
 * @returns
 */
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

/**
 * Patch update for persistent user settings. This will merge the provided settings with the existing
 * ones on the server instead of overwriting them. Use this for updating a subset of settings without
 * affecting others. For full updates, use putPersistentSettings.
 * @param accessToken
 * @param payload
 * @param signal
 * @returns
 */
function patchPersistentSettings(
    accessToken: string,
    payload: PersistentSettingsPayload,
    signal?: AbortSignal
): Promise<PersistentSettingsResponse> {
    return patchRequest(`${USER_ENDPOINT}/settings/persistent`, {
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

function deletePersistentSettings(
    accessToken: string,
    signal?: AbortSignal
): Promise<DeletePersistentSettingsResponse> {
    return deleteRequest(`${USER_ENDPOINT}/settings/persistent`, {
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
    patchPersistentSettings,
    getPersistentSettings,
    deletePersistentSettings,
}
