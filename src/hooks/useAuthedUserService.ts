import { useCallback } from "react"
import { useUserContext } from "../contexts/UserContext"
import {
    getProfile as usGetProfile,
    putUpdatePassword as usUpdatePassword,
    putPersistentSettings as usPersistSettings,
    getPersistentSettings as usGetSettings,
} from "../services/userService"
import {
    PersistentSettingsPayload,
    UpdatePasswordPayload,
} from "../models/User"

/**
 * User-service calls bound to the current session. Each goes through authedRequest, so
 * an access token that is about to expire (or was just rejected) is refreshed first.
 * Rejects with NotLoggedInError when there is no session.
 */
const useAuthedUserService = () => {
    const { authedRequest } = useUserContext()

    const getProfile = useCallback(
        (signal?: AbortSignal) =>
            authedRequest((token) => usGetProfile(token, signal)),
        [authedRequest]
    )

    const updatePassword = useCallback(
        (payload: UpdatePasswordPayload, signal?: AbortSignal) =>
            authedRequest((token) => usUpdatePassword(token, payload, signal)),
        [authedRequest]
    )

    const persistSettings = useCallback(
        (payload: PersistentSettingsPayload, signal?: AbortSignal) =>
            authedRequest((token) => usPersistSettings(token, payload, signal)),
        [authedRequest]
    )

    const getSettings = useCallback(
        (signal?: AbortSignal) =>
            authedRequest((token) => usGetSettings(token, signal)),
        [authedRequest]
    )

    return { getProfile, updatePassword, persistSettings, getSettings }
}

export default useAuthedUserService
