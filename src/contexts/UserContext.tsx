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
import { subscribeToLocalStorageWrites } from "../utils/localStorage"

interface UserContextProps {
    isLoggedIn: boolean
    accessToken: string
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

    const setSession = useCallback((data: UserAuthedResponse["data"]) => {
        setAccessToken(data.access_token)
        setRefreshToken(data.refresh_token)
        setExpiresIn(data.expires_in)
    }, [])

    const clearSession = useCallback(() => {
        setAccessToken(null)
        setRefreshToken(null)
        setExpiresIn(null)
    }, [])

    const dirtyKeysRef = useRef<Set<string>>(new Set())
    const syncTimeoutRef = useRef<number | null>(null)
    const isApplyingServerRef = useRef<boolean>(false)

    const flushDirtyKeysToServer = useCallback(async () => {
        if (!accessToken) return
        if (dirtyKeysRef.current.size === 0) return
        // TODO
        console.log(
            "Flushing dirty keys to server:",
            Array.from(dirtyKeysRef.current)
        )

        // After successful sync:
        dirtyKeysRef.current.clear()
    }, [accessToken])

    const applyServerSettingsToLocal = useCallback(
        (serverSettings: Record<string, any>) => {
            isApplyingServerRef.current = true
            try {
                // TODO
                console.log(
                    "Applying server settings to localStorage:",
                    serverSettings
                )
            } finally {
                isApplyingServerRef.current = false
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
            void flushDirtyKeysToServer()
        }, 1000)
    }, [accessToken, flushDirtyKeysToServer])

    useEffect(() => {
        const unsubscribe = subscribeToLocalStorageWrites(({ key }) => {
            // filter for syncable keys, auth state, server-apply suppression, etc.
            dirtyKeysRef.current.add(key)
            scheduleDebouncedSync()
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

    const refreshSession = useCallback(
        async (signal?: AbortSignal) => {
            if (!refreshToken) return
            try {
                const response = await postRefresh(
                    { refresh_token: refreshToken },
                    signal
                )
                if (response?.data) setSession(response.data)
            } catch (error) {
                // Refresh token expired or invalid — session is over
                clearSession()
            }
        },
        [refreshToken]
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
                }
                return response
            } finally {
                setIsLoading(false)
            }
        },
        [setSession]
    )

    const login = useCallback(
        async (payload: UserAccountObject, signal?: AbortSignal) => {
            setIsLoading(true)
            try {
                const response = await postLogin(payload, signal)
                if (response?.data) {
                    setSession(response.data)
                    closeAccountModal()
                }
                return response
            } finally {
                setIsLoading(false)
            }
        },
        [setSession]
    )

    const logout = useCallback(
        async (signal?: AbortSignal) => {
            setIsLoading(true)
            try {
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
