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

const useAuthedUserService = () => {
    const { accessToken } = useUserContext()

    const getProfile = useCallback(
        async (signal?: AbortSignal) => {
            if (!accessToken) {
                throw new Error("No access token available")
            }
            return usGetProfile(accessToken, signal)
        },
        [accessToken]
    )

    const updatePassword = useCallback(
        async (payload: UpdatePasswordPayload, signal?: AbortSignal) => {
            if (!accessToken) {
                throw new Error("No access token available")
            }
            return usUpdatePassword(accessToken, payload, signal)
        },
        [accessToken]
    )

    const persistSettings = useCallback(
        async (payload: PersistentSettingsPayload, signal?: AbortSignal) => {
            if (!accessToken) {
                throw new Error("No access token available")
            }
            return usPersistSettings(accessToken, payload, signal)
        },
        [accessToken]
    )

    const getSettings = useCallback(
        async (signal?: AbortSignal) => {
            if (!accessToken) {
                throw new Error("No access token available")
            }
            return usGetSettings(accessToken, signal)
        },
        [accessToken]
    )

    return { getProfile, updatePassword, persistSettings, getSettings }
}

export default useAuthedUserService
