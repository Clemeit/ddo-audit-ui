import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useCallback,
    useRef,
} from "react"
import axios from "axios"
import {
    postLogin,
    postLogout,
    postRefresh,
    postRegister,
    deleteAccount as deleteAccountRequest,
} from "../services/authService"
import { UserAccountObject, UserAuthedResponse } from "../models/Auth"
import {
    getPersistentDataByKeys,
    isPersistentKey,
    setPersistentData,
    subscribeToLocalStorageWrites,
    PERSISTENT_KEYS,
} from "../utils/localStorage"
import {
    setFriends,
    setIgnores,
    setRegisteredCharacters,
} from "../utils/localStorage"
import { normalizeAllPersistentSettings } from "../utils/settingsNormalizers"
import { hydrateCharacterIds } from "../utils/settingsHydration"
import {
    getPersistentSettings,
    patchPersistentSettings,
    putUpdatePassword,
    putPersistentSettings,
    deletePersistentSettings,
} from "../services/userService"
import logMessage from "../utils/logUtils"
import { UpdatePasswordPayload } from "../models/User"
import { useNotificationContext } from "./NotificationContext"

interface UserContextProps {
    isLoggedIn: boolean
    accessToken: string
    persistentSettingsRevision: number
    register: (
        payload: UserAccountObject,
        signal?: AbortSignal
    ) => Promise<UserAuthedResponse>
    login: (
        payload: UserAccountObject,
        signal?: AbortSignal
    ) => Promise<UserAuthedResponse>
    changePassword: (
        payload: UpdatePasswordPayload,
        signal?: AbortSignal
    ) => Promise<UserAuthedResponse>
    logout: (signal?: AbortSignal) => Promise<void>
    deleteAccount: (signal?: AbortSignal) => Promise<void>
    deleteSettings: (signal?: AbortSignal) => Promise<void>
    isAccountModalOpen: boolean
    openLoginModal: () => void
    openRegisterModal: () => void
    openChangePasswordModal: () => void
    closeAccountModal: () => void
    accountModalType: "login" | "register" | "change-password"
    isLoading: boolean
}

const UserContext = createContext<UserContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
}

export const UserProvider = ({ children }: Props) => {
    const [persistentSettingsRevision, setPersistentSettingsRevision] =
        useState<number>(0)
    const { createNotification } = useNotificationContext()

    const [accessToken, setAccessToken] = useState<string>(null)
    const [refreshToken, setRefreshToken] = useState<string>(() => {
        try {
            return localStorage.getItem("refresh_token")
        } catch {
            return null
        }
    })
    const [expiresIn, setExpiresIn] = useState<number>(null)
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
    const [accountModalType, setAccountModalType] = useState<
        "login" | "register" | "change-password"
    >("login")
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const openLoginModal = useCallback(() => {
        setAccountModalType("login")
        setIsAccountModalOpen(true)
    }, [])
    const openRegisterModal = useCallback(() => {
        setAccountModalType("register")
        setIsAccountModalOpen(true)
    }, [])
    const openChangePasswordModal = useCallback(() => {
        setAccountModalType("change-password")
        setIsAccountModalOpen(true)
    }, [])
    const closeAccountModal = useCallback(
        () => setIsAccountModalOpen(false),
        []
    )

    const dirtyKeysRef = useRef<Set<string>>(new Set())
    const syncedValueSnapshotRef = useRef<Map<string, string>>(new Map())
    const syncTimeoutRef = useRef<number | null>(null)
    const isApplyingServerRef = useRef<boolean>(false)

    const setSession = useCallback((data: UserAuthedResponse["data"]) => {
        setAccessToken(data.access_token)
        setRefreshToken(data.refresh_token)
        setExpiresIn(data.expires_in)
    }, [])

    const clearSession = useCallback(() => {
        if (syncTimeoutRef.current !== null) {
            window.clearTimeout(syncTimeoutRef.current)
            syncTimeoutRef.current = null
        }
        syncedValueSnapshotRef.current.clear()
        setAccessToken(null)
        setRefreshToken(null)
        setExpiresIn(null)
    }, [])

    const isIdOnlyKey = useCallback(
        (key: string) =>
            key === "friends" ||
            key === "ignores" ||
            key === "registered-characters",
        []
    )

    const toComparableValue = useCallback(
        (key: string, value: unknown): unknown => {
            if (isIdOnlyKey(key) && Array.isArray(value)) {
                const ids = value.filter(
                    (id): id is number => typeof id === "number"
                )
                return Array.from(new Set(ids)).sort((a, b) => a - b)
            }

            if (Array.isArray(value)) {
                return value.map((item) => toComparableValue(key, item))
            }

            if (value && typeof value === "object") {
                const input = value as Record<string, unknown>
                const out: Record<string, unknown> = {}
                for (const k of Object.keys(input).sort()) {
                    out[k] = toComparableValue(k, input[k])
                }
                return out
            }

            return value
        },
        [isIdOnlyKey]
    )

    const serializeComparable = useCallback(
        (key: string, value: unknown): string => {
            try {
                return JSON.stringify(toComparableValue(key, value ?? null))
            } catch {
                return String(value)
            }
        },
        [toComparableValue]
    )

    const serializePersistentValue = useCallback(
        (key: string): string | null => {
            if (!isPersistentKey(key)) return null
            const value = getPersistentDataByKeys([key])[key]
            return serializeComparable(key, value)
        },
        [serializeComparable]
    )

    const flushAllLocalSettingsToServer = useCallback(
        async (token: string, signal?: AbortSignal) => {
            if (!token) return
            const allData = getPersistentDataByKeys(PERSISTENT_KEYS)
            const normalizedAllData = normalizeAllPersistentSettings(allData)
            try {
                await putPersistentSettings(
                    token,
                    { settings: normalizedAllData },
                    signal
                )
                // After successful sync:
                dirtyKeysRef.current.clear()
                for (const key of Object.keys(normalizedAllData)) {
                    if (!isPersistentKey(key)) continue
                    syncedValueSnapshotRef.current.set(
                        key,
                        serializeComparable(key, normalizedAllData[key])
                    )
                }
            } catch (error) {
                logMessage("Failed to sync settings to server", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.stack
                                : String(error),
                    },
                })
            }
        },
        []
    )

    const flushDirtyKeysToServer = useCallback(
        async (token: string, signal?: AbortSignal) => {
            if (!token) return
            const keysToFlush = Array.from(dirtyKeysRef.current)
            if (keysToFlush.length === 0) return

            const changedKeys = keysToFlush.filter((key) => {
                const currentSerialized = serializePersistentValue(key)
                const previousSerialized =
                    syncedValueSnapshotRef.current.get(key) ?? null
                return (
                    currentSerialized !== null &&
                    currentSerialized !== previousSerialized
                )
            })

            // Clear keys that were marked dirty but are already in-sync.
            for (const key of keysToFlush) {
                if (!changedKeys.includes(key)) {
                    dirtyKeysRef.current.delete(key)
                }
            }

            if (changedKeys.length === 0) return

            const data = getPersistentDataByKeys(changedKeys)
            const normalized = normalizeAllPersistentSettings(data)
            try {
                await patchPersistentSettings(
                    token,
                    { settings: normalized },
                    signal
                )
                // Only clear keys included in this successful flush.
                for (const key of changedKeys) {
                    dirtyKeysRef.current.delete(key)
                    if (isPersistentKey(key)) {
                        syncedValueSnapshotRef.current.set(
                            key,
                            serializeComparable(key, normalized[key])
                        )
                    }
                }
            } catch (error) {
                logMessage("Failed to sync settings to server", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.stack
                                : String(error),
                    },
                })
            }
        },
        [serializeComparable, serializePersistentValue]
    )

    const scheduleDebouncedSync = useCallback(() => {
        if (!accessToken) return
        if (isApplyingServerRef.current) return
        if (dirtyKeysRef.current.size === 0) return

        if (syncTimeoutRef.current !== null) {
            window.clearTimeout(syncTimeoutRef.current)
        }

        syncTimeoutRef.current = window.setTimeout(() => {
            syncTimeoutRef.current = null
            void flushDirtyKeysToServer(accessToken)
        }, 1000)
    }, [accessToken, flushDirtyKeysToServer])

    useEffect(() => {
        if (!accessToken) {
            syncedValueSnapshotRef.current.clear()
            return
        }

        const current = getPersistentDataByKeys(PERSISTENT_KEYS)
        for (const key of Object.keys(current)) {
            if (!isPersistentKey(key)) continue
            syncedValueSnapshotRef.current.set(
                key,
                serializeComparable(key, current[key])
            )
        }
    }, [accessToken, serializeComparable])

    useEffect(() => {
        const unsubscribe = subscribeToLocalStorageWrites(({ key }) => {
            // filter for syncable keys, auth state, server-apply suppression, etc.
            if (isPersistentKey(key) && !isApplyingServerRef.current) {
                dirtyKeysRef.current.add(key)
                scheduleDebouncedSync()
            }
        })

        return unsubscribe
    }, [scheduleDebouncedSync])

    // Persist refresh token on change
    useEffect(() => {
        try {
            if (refreshToken) {
                localStorage.setItem("refresh_token", refreshToken)
            } else {
                localStorage.removeItem("refresh_token")
            }
        } catch (error) {
            logMessage(
                "Failed to persist refresh token to localStorage",
                "warn",
                {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                }
            )
        }
    }, [refreshToken])

    const applyServerSettingsToLocal = useCallback(
        async (serverSettings: unknown, signal?: AbortSignal) => {
            isApplyingServerRef.current = true
            try {
                const normalized =
                    normalizeAllPersistentSettings(serverSettings)
                const {
                    friends: friendIds,
                    ignores: ignoreIds,
                    "registered-characters": registeredIds,
                    ...nonCharSettings
                } = normalized
                setPersistentData(nonCharSettings as Record<string, any>)
                const [friendsResult, ignoresResult, registeredResult] =
                    await Promise.all([
                        hydrateCharacterIds(friendIds, signal),
                        hydrateCharacterIds(ignoreIds, signal),
                        hydrateCharacterIds(registeredIds, signal),
                    ])
                if (friendsResult !== null) {
                    setFriends(friendsResult)
                } else {
                    logMessage(
                        "Character hydration failed for friends; existing local data preserved",
                        "warn",
                        {}
                    )
                }
                if (ignoresResult !== null) {
                    setIgnores(ignoresResult)
                } else {
                    logMessage(
                        "Character hydration failed for ignores; existing local data preserved",
                        "warn",
                        {}
                    )
                }
                if (registeredResult !== null) {
                    setRegisteredCharacters(registeredResult)
                } else {
                    logMessage(
                        "Character hydration failed for registered characters; existing local data preserved",
                        "warn",
                        {}
                    )
                }
                const normalizedByKey = normalized as unknown as Record<
                    string,
                    unknown
                >
                for (const key of Object.keys(normalized)) {
                    if (!isPersistentKey(key)) continue
                    syncedValueSnapshotRef.current.set(
                        key,
                        serializeComparable(key, normalizedByKey[key])
                    )
                }
                setPersistentSettingsRevision((prev) => prev + 1)
            } finally {
                isApplyingServerRef.current = false
            }
        },
        [serializeComparable]
    )

    const fetchAndApplyServerSettings = useCallback(
        async (token: string, signal?: AbortSignal) => {
            try {
                const response = await getPersistentSettings(token, signal)
                const serverSettings = response?.data?.settings
                if (
                    !serverSettings ||
                    typeof serverSettings !== "object" ||
                    Object.keys(serverSettings).length === 0
                ) {
                    await flushAllLocalSettingsToServer(token, signal)
                    return
                }
                await applyServerSettingsToLocal(serverSettings, signal)
            } catch (error: unknown) {
                if ((error as { name?: string })?.name === "AbortError") return
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 404
                ) {
                    await flushAllLocalSettingsToServer(token, signal)
                    return
                }
                logMessage("Failed to fetch settings from server", "warn", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.stack
                                : String(error),
                    },
                })
            }
        },
        [applyServerSettingsToLocal, flushAllLocalSettingsToServer]
    )

    const refreshSession = useCallback(
        async (signal?: AbortSignal) => {
            if (!refreshToken) return
            setIsLoading(true)
            try {
                const response = await postRefresh(
                    { refresh_token: refreshToken },
                    signal
                )
                if (response?.data) {
                    setSession(response.data)
                    await fetchAndApplyServerSettings(
                        response.data.access_token,
                        signal
                    )
                }
            } catch (error) {
                // Refresh token expired or invalid — session is over
                if ((error as { name?: string })?.name === "AbortError") return
                logMessage("Failed to refresh session", "warn", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                })
                clearSession()
            } finally {
                setIsLoading(false)
            }
        },
        [refreshToken, setSession, fetchAndApplyServerSettings, clearSession]
    )

    // Rehydrate session on mount
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem("refresh_token")
            if (!storedToken) return
            const controller = new AbortController()
            refreshSession(controller.signal)
            return () => controller.abort()
        } catch (error) {
            logMessage(
                "Failed to rehydrate session from localStorage",
                "warn",
                {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                }
            )
        }
    }, [])

    // Keep session alive
    useEffect(() => {
        if (!refreshToken || !expiresIn) return
        const controller = new AbortController()
        const timeout = setTimeout(
            () => refreshSession(controller.signal),
            (expiresIn - 30) * 1000 // refresh 30s before expiry
        )
        return () => {
            clearTimeout(timeout)
            controller.abort()
        }
    }, [refreshToken, expiresIn, refreshSession])

    // Account lifecycle functions

    const register = useCallback(
        async (payload: UserAccountObject, signal?: AbortSignal) => {
            setIsLoading(true)
            try {
                const response = await postRegister(payload, signal)
                if (response?.data) {
                    setSession(response.data)
                    closeAccountModal()
                    await fetchAndApplyServerSettings(
                        response.data.access_token,
                        signal
                    )
                }
                if (response?.data) {
                    createNotification({
                        title: "Registration Successful",
                        message:
                            "Welcome to DDO Audit! Your account has been created and your settings have been saved.",
                        type: "success",
                        ttl: 10000,
                    })
                }
                return response
            } catch (error) {
                if ((error as { name?: string })?.name === "AbortError") {
                    return null
                }
                logMessage("User registration failed", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                })
                throw error
            } finally {
                setIsLoading(false)
            }
        },
        [
            setSession,
            closeAccountModal,
            fetchAndApplyServerSettings,
            createNotification,
        ]
    )

    const login = useCallback(
        async (payload: UserAccountObject, signal?: AbortSignal) => {
            setIsLoading(true)
            try {
                const response = await postLogin(payload, signal)
                if (response?.data) {
                    setSession(response.data)
                    closeAccountModal()
                    await fetchAndApplyServerSettings(
                        response.data.access_token,
                        signal
                    )
                }
                return response
            } catch (error) {
                if ((error as { name?: string })?.name === "AbortError") {
                    return null
                }
                logMessage("User login failed", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                })
                throw error
            } finally {
                setIsLoading(false)
            }
        },
        [setSession, closeAccountModal, fetchAndApplyServerSettings]
    )

    const logout = useCallback(
        async (signal?: AbortSignal) => {
            setIsLoading(true)
            try {
                if (syncTimeoutRef.current !== null) {
                    window.clearTimeout(syncTimeoutRef.current)
                    syncTimeoutRef.current = null
                }
                if (accessToken) {
                    await postLogout(accessToken, signal)
                }
                clearSession()
                createNotification({
                    title: "Logged Out",
                    message: "You have been logged out successfully.",
                    type: "success",
                    ttl: 5000,
                })
            } catch (error) {
                if ((error as { name?: string })?.name === "AbortError") {
                    return
                }
                logMessage("User logout failed", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                })
                // Still clear session even if logout request fails
                clearSession()
            } finally {
                setIsLoading(false)
            }
        },
        [accessToken, clearSession, createNotification]
    )

    const deleteAccount = useCallback(
        async (signal?: AbortSignal) => {
            setIsLoading(true)
            try {
                if (syncTimeoutRef.current !== null) {
                    window.clearTimeout(syncTimeoutRef.current)
                    syncTimeoutRef.current = null
                }
                if (accessToken) {
                    const response = await deleteAccountRequest(
                        accessToken,
                        signal
                    )
                    if (
                        response?.data?.message ===
                        "Account deleted successfully"
                    ) {
                        createNotification({
                            title: "Account Deleted",
                            message:
                                "Your account has been deleted successfully.",
                            type: "success",
                            ttl: 10000,
                        })
                        clearSession()
                    } else {
                        throw new Error(
                            "Unexpected response from server: " +
                                JSON.stringify(response)
                        )
                    }
                }
            } catch (error) {
                if ((error as { name?: string })?.name === "AbortError") {
                    return
                }
                logMessage("Account deletion failed", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                })
                throw error
            } finally {
                setIsLoading(false)
            }
        },
        [accessToken, clearSession, createNotification]
    )

    const deleteSettings = useCallback(
        async (signal?: AbortSignal) => {
            setIsLoading(true)
            try {
                if (syncTimeoutRef.current !== null) {
                    window.clearTimeout(syncTimeoutRef.current)
                    syncTimeoutRef.current = null
                }
                if (accessToken) {
                    const response = await deletePersistentSettings(
                        accessToken,
                        signal
                    )
                    if (response?.data?.deleted) {
                        createNotification({
                            title: "Settings Deleted",
                            message:
                                "Your settings have been deleted successfully.",
                            type: "success",
                            ttl: 10000,
                        })
                    } else {
                        throw new Error(
                            "Unexpected response from server: " +
                                JSON.stringify(response)
                        )
                    }
                }
            } catch (error) {
                if ((error as { name?: string })?.name === "AbortError") {
                    return
                }
                logMessage("Settings deletion failed", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                })
                throw error
            } finally {
                setIsLoading(false)
            }
        },
        [accessToken]
    )

    const changePassword = useCallback(
        async (payload: UpdatePasswordPayload, signal?: AbortSignal) => {
            if (!accessToken) {
                throw new Error("No access token available")
            }

            setIsLoading(true)
            try {
                const response = await putUpdatePassword(
                    accessToken,
                    payload,
                    signal
                )
                if (response?.data) {
                    setSession(response.data)
                    closeAccountModal()
                    createNotification({
                        title: "Password updated!",
                        message:
                            "You have been logged out on all other devices.",
                        type: "success",
                        ttl: 10000,
                    })
                }
                return response
            } catch (error) {
                if ((error as { name?: string })?.name === "AbortError") {
                    return
                }
                logMessage("Password change failed", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                })
                throw error
            } finally {
                setIsLoading(false)
            }
        },
        [accessToken, setSession, closeAccountModal, createNotification]
    )

    return (
        <UserContext.Provider
            value={{
                isLoggedIn: !!accessToken,
                accessToken,
                persistentSettingsRevision,
                register,
                login,
                changePassword,
                logout,
                deleteAccount,
                deleteSettings,
                isAccountModalOpen,
                openLoginModal,
                openRegisterModal,
                openChangePasswordModal,
                closeAccountModal,
                accountModalType,
                isLoading,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export const useUserContext = () => {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error("useUserContext must be used within a UserContext")
    }
    return context
}
