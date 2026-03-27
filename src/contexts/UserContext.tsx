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
import {
    normalizeAllPersistentSettings,
    normalizePartialPersistentSettings,
} from "../utils/settingsNormalizers"
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
    ) => Promise<UserAuthedResponse | null>
    login: (
        payload: UserAccountObject,
        signal?: AbortSignal
    ) => Promise<UserAuthedResponse | null>
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
    firstLoadComplete: boolean
}

const UserContext = createContext<UserContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
}

const SESSION_REHYDRATE_HINT_KEY = "v1-auth-session-hint"

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null

const getApiErrorMessage = (responseData: unknown): string | null => {
    if (typeof responseData === "string" && responseData.trim().length > 0) {
        return responseData
    }

    if (!isRecord(responseData)) {
        return null
    }

    const directError = responseData.error
    if (typeof directError === "string" && directError.trim().length > 0) {
        return directError
    }

    const message = responseData.message
    if (typeof message === "string" && message.trim().length > 0) {
        return message
    }

    return null
}

const getErrorMetadata = (error: unknown): Record<string, unknown> => {
    if (axios.isAxiosError(error)) {
        const responseData = error.response?.data
        return {
            error: error.message,
            errorName: error.name,
            stack: error.stack,
            isAxiosError: true,
            requestMethod: error.config?.method?.toUpperCase() ?? null,
            requestUrl: error.config?.url ?? null,
            status: error.response?.status ?? null,
            statusText: error.response?.statusText ?? null,
            apiError: getApiErrorMessage(responseData),
            responseData: responseData ?? null,
        }
    }

    if (error instanceof Error) {
        return {
            error: error.message,
            errorName: error.name,
            stack: error.stack,
        }
    }

    return {
        error: String(error),
    }
}

const isAbortError = (error: unknown): boolean =>
    (error as { name?: string })?.name === "AbortError"

const createAbortError = (message: string): Error => {
    const abortError = new Error(message)
    abortError.name = "AbortError"
    return abortError
}

export const UserProvider = ({ children }: Props) => {
    const [persistentSettingsRevision, setPersistentSettingsRevision] =
        useState<number>(0)
    const { createNotification } = useNotificationContext()

    const [accessToken, setAccessToken] = useState<string>(null)
    const [expiresIn, setExpiresIn] = useState<number>(null)
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
    const [accountModalType, setAccountModalType] = useState<
        "login" | "register" | "change-password"
    >("login")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [firstLoadComplete, setFirstLoadComplete] = useState<boolean>(false)

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
    const keepAliveControllerRef = useRef<AbortController | null>(null)
    const refreshControllerRef = useRef<AbortController | null>(null)
    const keepAliveRetryTimeoutRef = useRef<number | null>(null)
    const refreshLockRef = useRef<Promise<string | null> | null>(null)
    const refreshFailureCountRef = useRef<number>(0)
    const isInCircuitBreakerRef = useRef<boolean>(false)
    const sessionGenerationRef = useRef<number>(0)

    const setSessionRehydrateHint = useCallback((enabled: boolean) => {
        try {
            if (enabled) {
                window.localStorage.setItem(SESSION_REHYDRATE_HINT_KEY, "1")
            } else {
                window.localStorage.removeItem(SESSION_REHYDRATE_HINT_KEY)
            }
        } catch {
            // Ignore storage failures and fall back to current in-memory session only.
        }
    }, [])

    const shouldAttemptSessionRehydrate = useCallback((): boolean => {
        try {
            return (
                window.localStorage.getItem(SESSION_REHYDRATE_HINT_KEY) === "1"
            )
        } catch {
            return false
        }
    }, [])

    const setSession = useCallback(
        (data: UserAuthedResponse["data"]) => {
            setAccessToken(data.access_token)
            setExpiresIn(data.expires_in)
            setSessionRehydrateHint(true)
        },
        [setSessionRehydrateHint]
    )

    const clearSession = useCallback(() => {
        sessionGenerationRef.current += 1
        if (syncTimeoutRef.current !== null) {
            window.clearTimeout(syncTimeoutRef.current)
            syncTimeoutRef.current = null
        }
        if (keepAliveRetryTimeoutRef.current !== null) {
            window.clearTimeout(keepAliveRetryTimeoutRef.current)
            keepAliveRetryTimeoutRef.current = null
        }
        keepAliveControllerRef.current?.abort()
        keepAliveControllerRef.current = null
        refreshControllerRef.current?.abort()
        refreshControllerRef.current = null
        refreshLockRef.current = null
        syncedValueSnapshotRef.current.clear()
        // Reset resilience tracking
        refreshFailureCountRef.current = 0
        isInCircuitBreakerRef.current = false
        setAccessToken(null)
        setExpiresIn(null)
        setSessionRehydrateHint(false)
    }, [setSessionRehydrateHint])

    const notifySessionInvalidated = useCallback(() => {
        createNotification({
            title: "You were logged out",
            message: "Please log back in to continue syncing your settings.",
            type: "info",
            ttl: 6000,
        })
    }, [createNotification])

    const refreshAccessSession = useCallback(
        async (signal?: AbortSignal): Promise<string | null> => {
            const refreshGeneration = sessionGenerationRef.current
            const controller = new AbortController()
            refreshControllerRef.current = controller
            const abortRefresh = () => controller.abort()
            if (signal?.aborted) {
                abortRefresh()
                throw createAbortError(
                    "Refresh session was cancelled before start"
                )
            }
            signal?.addEventListener("abort", abortRefresh, { once: true })

            try {
                const response = await postRefresh(controller.signal)
                if (
                    controller.signal.aborted ||
                    sessionGenerationRef.current !== refreshGeneration
                ) {
                    throw createAbortError(
                        "Refresh session was cancelled before completion"
                    )
                }
                if (!response?.data) return null
                setSession(response.data)
                // Reset failure tracking on success
                refreshFailureCountRef.current = 0
                isInCircuitBreakerRef.current = false
                return response.data.access_token
            } catch (error) {
                if (
                    isAbortError(error) ||
                    controller.signal.aborted ||
                    sessionGenerationRef.current !== refreshGeneration
                ) {
                    throw createAbortError(
                        "Refresh session was cancelled before completion"
                    )
                }

                const refreshStatus = axios.isAxiosError(error)
                    ? error.response?.status
                    : undefined
                if (refreshStatus === 401 || refreshStatus === 403) {
                    return null
                }

                refreshFailureCountRef.current += 1
                if (refreshFailureCountRef.current >= 3) {
                    isInCircuitBreakerRef.current = true
                    logMessage(
                        "Refresh failed repeatedly, pausing automatic keep-alive retries",
                        "warn",
                        { metadata: getErrorMetadata(error) }
                    )
                }

                throw error
            } finally {
                signal?.removeEventListener("abort", abortRefresh)
                if (refreshControllerRef.current === controller) {
                    refreshControllerRef.current = null
                }
            }
        },
        [setSession]
    )

    const getOrStartRefreshPromise = useCallback(
        (signal?: AbortSignal): Promise<string | null> => {
            if (refreshLockRef.current === null) {
                refreshLockRef.current = refreshAccessSession(signal).finally(
                    () => {
                        refreshLockRef.current = null
                    }
                )
            }
            return refreshLockRef.current
        },
        [refreshAccessSession]
    )

    const executeWithAuthRetry = useCallback(
        async <T,>(
            request: (authToken: string) => Promise<T>,
            token: string,
            signal?: AbortSignal
        ): Promise<T> => {
            try {
                return await request(token)
            } catch (error) {
                if (isAbortError(error)) {
                    throw error
                }

                const status = axios.isAxiosError(error)
                    ? error.response?.status
                    : undefined
                if (status !== 401 && status !== 403) {
                    throw error
                }

                try {
                    const refreshedToken =
                        await getOrStartRefreshPromise(signal)
                    if (!refreshedToken) {
                        clearSession()
                        notifySessionInvalidated()
                        throw error
                    }
                    return await request(refreshedToken)
                } catch (refreshError) {
                    if (isAbortError(refreshError)) {
                        throw refreshError
                    }

                    const refreshStatus = axios.isAxiosError(refreshError)
                        ? refreshError.response?.status
                        : undefined
                    if (refreshStatus === 401 || refreshStatus === 403) {
                        clearSession()
                        notifySessionInvalidated()
                    }
                    throw refreshError
                }
            }
        },
        [getOrStartRefreshPromise, clearSession, notifySessionInvalidated]
    )

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
                await executeWithAuthRetry(
                    (authToken) =>
                        putPersistentSettings(
                            authToken,
                            { settings: normalizedAllData },
                            signal
                        ),
                    token,
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
                if (
                    axios.isAxiosError(error) &&
                    (error.response?.status === 401 ||
                        error.response?.status === 403)
                ) {
                    return
                }
                logMessage("Failed to sync settings to server", "error", {
                    metadata: getErrorMetadata(error),
                })
            }
        },
        [executeWithAuthRetry, serializeComparable]
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
            const normalized = normalizePartialPersistentSettings(
                data,
                changedKeys
            )
            try {
                await executeWithAuthRetry(
                    (authToken) =>
                        patchPersistentSettings(
                            authToken,
                            { settings: normalized },
                            signal
                        ),
                    token,
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
                if (
                    axios.isAxiosError(error) &&
                    (error.response?.status === 401 ||
                        error.response?.status === 403)
                ) {
                    return
                }
                logMessage("Failed to sync settings to server", "error", {
                    metadata: getErrorMetadata(error),
                })
            }
        },
        [executeWithAuthRetry, serializeComparable, serializePersistentValue]
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
                const response = await executeWithAuthRetry(
                    (authToken) => getPersistentSettings(authToken, signal),
                    token,
                    signal
                )
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
                if (
                    axios.isAxiosError(error) &&
                    (error.response?.status === 401 ||
                        error.response?.status === 403)
                ) {
                    return
                }
                logMessage("Failed to fetch settings from server", "warn", {
                    metadata: getErrorMetadata(error),
                })
            }
        },
        [
            applyServerSettingsToLocal,
            executeWithAuthRetry,
            flushAllLocalSettingsToServer,
        ]
    )

    const refreshSession = useCallback(
        async (signal?: AbortSignal): Promise<boolean> => {
            setIsLoading(true)
            try {
                const refreshedToken = await getOrStartRefreshPromise(signal)
                if (!refreshedToken) {
                    clearSession()
                    notifySessionInvalidated()
                    return false
                }
                await fetchAndApplyServerSettings(refreshedToken, signal)
                return true
            } catch (error) {
                if (isAbortError(error)) {
                    throw error
                }
                logMessage("Failed to refresh session", "warn", {
                    metadata: getErrorMetadata(error),
                })
                throw error
            } finally {
                setIsLoading(false)
                setFirstLoadComplete(true)
            }
        },
        [
            getOrStartRefreshPromise,
            fetchAndApplyServerSettings,
            clearSession,
            notifySessionInvalidated,
        ]
    )

    // Rehydrate session on mount
    useEffect(() => {
        if (!shouldAttemptSessionRehydrate()) {
            setFirstLoadComplete(true)
            return
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
            setFirstLoadComplete(true)
        }, 3000) // Fallback in case rehydration hangs for some reason

        void refreshSession(controller.signal)
            .catch(() => {
                // refreshSession already logs non-abort failures.
            })
            .finally(() => {
                clearTimeout(timeoutId)
            })

        return () => {
            controller.abort()
            clearTimeout(timeoutId)
        }
    }, [refreshSession, shouldAttemptSessionRehydrate])

    // Keep session alive with resilient retry logic
    useEffect(() => {
        if (!accessToken || !expiresIn) return

        const refreshMarginMs = 60 * 1000

        const scheduleRefresh = (delayMs: number) => {
            const timeout = window.setTimeout(
                () => {
                    keepAliveControllerRef.current = new AbortController()
                    void refreshSession(
                        keepAliveControllerRef.current.signal
                    ).catch((error) => {
                        if (isAbortError(error)) {
                            return
                        }
                        if (!accessToken || isInCircuitBreakerRef.current) {
                            return
                        }
                        keepAliveRetryTimeoutRef.current = window.setTimeout(
                            () => {
                                keepAliveRetryTimeoutRef.current = null
                                scheduleRefresh(0)
                            },
                            10000
                        )
                    })
                },
                Math.max(0, delayMs)
            )
            keepAliveRetryTimeoutRef.current = timeout
            return timeout
        }

        const timeUntilExpiry = expiresIn * 1000 - refreshMarginMs
        const timeout = scheduleRefresh(timeUntilExpiry)

        return () => {
            clearTimeout(timeout)
            if (keepAliveRetryTimeoutRef.current !== null) {
                clearTimeout(keepAliveRetryTimeoutRef.current)
                keepAliveRetryTimeoutRef.current = null
            }
            keepAliveControllerRef.current?.abort()
            keepAliveControllerRef.current = null
        }
    }, [accessToken, expiresIn, refreshSession])

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
                    logMessage("New user registered", "info", {
                        metadata: {
                            userId: response.data?.user?.id || "unknown",
                        },
                    })
                }
                return response
            } catch (error) {
                if ((error as { name?: string })?.name === "AbortError") {
                    return null
                }
                logMessage("User registration failed", "error", {
                    metadata: getErrorMetadata(error),
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
                    metadata: getErrorMetadata(error),
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
                    metadata: getErrorMetadata(error),
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
                    metadata: getErrorMetadata(error),
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
                    metadata: getErrorMetadata(error),
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
                    metadata: getErrorMetadata(error),
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
                firstLoadComplete,
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
