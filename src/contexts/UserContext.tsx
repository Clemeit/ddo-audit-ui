import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useCallback,
    useRef,
} from "react"
import {
    postLogin,
    postLogout,
    postRefresh,
    postRegister,
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
    getPersistentSettings,
    patchPersistentSettings,
    putPersistentSettings,
} from "../services/userService"
import logMessage from "../utils/logUtils"

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
    logout: (signal?: AbortSignal) => Promise<void>
    isLoginModalOpen: boolean
    openLoginModal: () => void
    openRegisterModal: () => void
    closeAccountModal: () => void
    accountModalType: "login" | "register"
    isLoading: boolean
}

const UserContext = createContext<UserContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
}

export const UserProvider = ({ children }: Props) => {
    const [persistentSettingsRevision, setPersistentSettingsRevision] =
        useState<number>(0)

    const [accessToken, setAccessToken] = useState<string>(null)
    const [refreshToken, setRefreshToken] = useState<string>(() =>
        localStorage.getItem("refresh_token")
    )
    const [expiresIn, setExpiresIn] = useState<number>(null)
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
    const [accountModalType, setAccountModalType] = useState<
        "login" | "register"
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
    const closeAccountModal = useCallback(
        () => setIsAccountModalOpen(false),
        []
    )

    const dirtyKeysRef = useRef<Set<string>>(new Set())
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
        setAccessToken(null)
        setRefreshToken(null)
        setExpiresIn(null)
    }, [])

    const flushAllLocalSettingsToServer = useCallback(
        async (token: string, signal?: AbortSignal) => {
            if (!token) return
            const allData = getPersistentDataByKeys(PERSISTENT_KEYS)
            console.log("Flushing all local settings to server:", allData)
            try {
                await putPersistentSettings(
                    token,
                    { settings: allData },
                    signal
                )
                // After successful sync:
                dirtyKeysRef.current.clear()
            } catch (error) {
                console.error("Failed to sync settings to server:", error)
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
            const data = getPersistentDataByKeys(keysToFlush)
            console.log("Flushing dirty keys to server:", keysToFlush, data)
            try {
                await patchPersistentSettings(token, { settings: data }, signal)
                // Only clear keys included in this successful flush.
                for (const key of keysToFlush) {
                    dirtyKeysRef.current.delete(key)
                }
            } catch (error) {
                console.error("Failed to sync settings to server:", error)
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
        if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken)
        } else {
            localStorage.removeItem("refresh_token")
        }
    }, [refreshToken])

    const applyServerSettingsToLocal = useCallback(
        (serverSettings: Record<string, any>) => {
            isApplyingServerRef.current = true
            try {
                console.log(
                    "Applying server settings to localStorage:",
                    serverSettings
                )
                setPersistentData(serverSettings)
                setPersistentSettingsRevision((prev) => prev + 1)
            } finally {
                isApplyingServerRef.current = false
            }
        },
        []
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
                applyServerSettingsToLocal(serverSettings)
            } catch (error: unknown) {
                if ((error as { name?: string })?.name === "AbortError") return
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
                clearSession()
            }
        },
        [refreshToken, setSession, fetchAndApplyServerSettings, clearSession]
    )

    // Rehydrate session on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("refresh_token")
        if (!storedToken) return
        const controller = new AbortController()
        refreshSession(controller.signal)
        return () => controller.abort()
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
                return response
            } finally {
                setIsLoading(false)
            }
        },
        [setSession, closeAccountModal, fetchAndApplyServerSettings]
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
                    await postLogout(accessToken, signal).catch(() => {})
                }
                clearSession()
            } finally {
                setIsLoading(false)
            }
        },
        [accessToken, clearSession]
    )

    return (
        <UserContext.Provider
            value={{
                isLoggedIn: !!accessToken,
                accessToken,
                persistentSettingsRevision,
                register,
                login,
                logout,
                isLoginModalOpen: isAccountModalOpen,
                openLoginModal,
                openRegisterModal,
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
