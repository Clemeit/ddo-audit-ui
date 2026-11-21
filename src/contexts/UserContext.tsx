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
    postRegister,
    deleteAccount as deleteAccountRequest,
} from "../services/authService"
import { UserAccountObject, UserAuthedResponse } from "../models/Auth"
import {
    AuthEvent,
    AuthSession,
    AuthSnapshot,
    InvalidationCode,
    NotLoggedInError,
    SessionEndReason,
    createAuthSession,
    isNotLoggedIn,
} from "../services/authSession"
import {
    LOGGED_OUT_NOTICE_KEY,
    getLoggedOutNotice,
    hasPendingLogout,
    hasSessionHint,
    setLoggedOutNotice,
    setPendingLogout,
    setSessionHint,
} from "../utils/authStorage"
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
import { Character } from "../models/Character"
import { useNotificationContext } from "./NotificationContext"
import { API_URL } from "../constants/client"
import Button from "../components/global/Button"

interface UserContextProps {
    isLoggedIn: boolean
    accessToken: string
    persistentSettingsRevision: number
    /** Why the last session ended ("user" = they logged out); null while logged in. */
    logoutReason: SessionEndReason | null
    /**
     * Run an authenticated request with a valid access token, refreshing first if it is
     * about to expire and once more if the server answers 401. Throws NotLoggedInError
     * when there is no session.
     */
    authedRequest: <T>(request: (accessToken: string) => Promise<T>) => Promise<T>
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
    logout: () => Promise<void>
    deleteAccount: (password: string, signal?: AbortSignal) => Promise<void>
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

const LOGGED_OUT_NOTICE_ID = "auth-logged-out-notice"
/** Re-pull server settings when a tab comes back after being hidden this long. */
const SETTINGS_PULL_AFTER_HIDDEN_MS = 15 * 60 * 1000
const LOGOUT_FLUSH_BUDGET_MS = 2000
/** Browsers cap keepalive request bodies at 64KB in total. */
const KEEPALIVE_BODY_LIMIT = 60_000
const MAX_SYNC_RETRY_AFTER_MS = 60 * 60 * 1000

const LOGGED_OUT_NOTICE_COPY: Record<
    InvalidationCode,
    { title: string; message: string }
> = {
    session_expired: {
        title: "Your session expired",
        message:
            "For your security, you're asked to log in again every 90 days. Log back in to keep syncing your settings and alerts.",
    },
    session_revoked: {
        title: "You were logged out",
        message:
            "Your session was ended, for example because your password was changed or you logged out on another device. Log back in to keep syncing your settings and alerts.",
    },
    invalid: {
        title: "You were logged out",
        message:
            "Log back in to keep syncing your settings and alerts across devices.",
    },
}

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

const getStatus = (error: unknown): number | undefined =>
    axios.isAxiosError(error) ? error.response?.status : undefined

/** The session is gone or was refused; the auth session already handled the logout. */
const isSessionError = (error: unknown): boolean =>
    isNotLoggedIn(error) || getStatus(error) === 401

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T | void> =>
    Promise.race([
        promise,
        new Promise<void>((resolve) => window.setTimeout(resolve, ms)),
    ])

export const UserProvider = ({ children }: Props) => {
    const [persistentSettingsRevision, setPersistentSettingsRevision] =
        useState<number>(0)
    const { createNotification, dismissNotification, removeNotification } =
        useNotificationContext()

    const [accessToken, setAccessToken] = useState<string>(null)
    const [logoutReason, setLogoutReason] = useState<SessionEndReason | null>(
        null
    )
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

    const sessionRef = useRef<AuthSession | null>(null)
    const dirtyKeysRef = useRef<Set<string>>(new Set())
    const syncedValueSnapshotRef = useRef<Map<string, string>>(new Map())
    const syncTimeoutRef = useRef<number | null>(null)
    const isApplyingServerRef = useRef<boolean>(false)
    /** Settled when the settings pull started by a restored/remote session finishes. */
    const sessionSyncPromiseRef = useRef<Promise<void> | null>(null)

    const getSession = useCallback((): AuthSession => {
        if (!sessionRef.current) {
            sessionRef.current = createAuthSession()
        }
        return sessionRef.current
    }, [])

    const isSessionActive = useCallback(
        () => !!sessionRef.current?.getState().accessToken,
        []
    )

    const authedRequest = useCallback(
        <T,>(request: (token: string) => Promise<T>): Promise<T> => {
            const session = sessionRef.current
            if (!session) return Promise.reject(new NotLoggedInError())
            return session.authedRequest(request)
        },
        []
    )

    const clearSyncTimeout = useCallback(() => {
        if (syncTimeoutRef.current !== null) {
            window.clearTimeout(syncTimeoutRef.current)
            syncTimeoutRef.current = null
        }
    }, [])

    // ----- settings sync -----

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

    /** Dirty keys whose value really differs from what the server last had. */
    const collectChangedDirtyKeys = useCallback((): string[] => {
        const keysToFlush = Array.from(dirtyKeysRef.current)
        const changedKeys = keysToFlush.filter((key) => {
            const currentSerialized = serializePersistentValue(key)
            const previousSerialized =
                syncedValueSnapshotRef.current.get(key) ?? null
            return (
                currentSerialized !== null &&
                currentSerialized !== previousSerialized
            )
        })
        // Keys marked dirty but already in sync need no flush.
        for (const key of keysToFlush) {
            if (!changedKeys.includes(key)) {
                dirtyKeysRef.current.delete(key)
            }
        }
        return changedKeys
    }, [serializePersistentValue])

    const flushAllLocalSettingsToServer = useCallback(
        async (signal?: AbortSignal) => {
            const allData = getPersistentDataByKeys(PERSISTENT_KEYS)
            const normalizedAllData = normalizeAllPersistentSettings(allData)
            try {
                await authedRequest((token) =>
                    putPersistentSettings(
                        token,
                        { settings: normalizedAllData },
                        signal
                    )
                )
                dirtyKeysRef.current.clear()
                for (const key of Object.keys(normalizedAllData)) {
                    if (!isPersistentKey(key)) continue
                    syncedValueSnapshotRef.current.set(
                        key,
                        serializeComparable(key, normalizedAllData[key])
                    )
                }
            } catch (error) {
                if (isAbortError(error) || isSessionError(error)) return
                logMessage("Failed to sync settings to server", "error", {
                    metadata: getErrorMetadata(error),
                })
            }
        },
        [authedRequest, serializeComparable]
    )

    // Declared before flushDirtyKeysToServer, which reschedules itself on 429.
    const flushDirtyRef = useRef<() => Promise<void>>(async () => {})

    const scheduleFlush = useCallback(
        (delayMs: number) => {
            clearSyncTimeout()
            syncTimeoutRef.current = window.setTimeout(() => {
                syncTimeoutRef.current = null
                void flushDirtyRef.current()
            }, delayMs)
        },
        [clearSyncTimeout]
    )

    const flushDirtyKeysToServer = useCallback(
        async (signal?: AbortSignal) => {
            if (!isSessionActive()) return
            const changedKeys = collectChangedDirtyKeys()
            if (changedKeys.length === 0) return

            const data = getPersistentDataByKeys(changedKeys)
            const normalized = normalizePartialPersistentSettings(
                data,
                changedKeys
            )
            try {
                await authedRequest((token) =>
                    patchPersistentSettings(
                        token,
                        { settings: normalized },
                        signal
                    )
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
                if (isAbortError(error) || isSessionError(error)) return
                if (getStatus(error) === 429) {
                    // Keep the keys dirty and try again once the limit resets.
                    const retryAfterSeconds = Number(
                        axios.isAxiosError(error)
                            ? error.response?.headers?.["retry-after"]
                            : NaN
                    )
                    const delayMs = Number.isFinite(retryAfterSeconds)
                        ? Math.min(
                              retryAfterSeconds * 1000,
                              MAX_SYNC_RETRY_AFTER_MS
                          )
                        : 60_000
                    scheduleFlush(delayMs)
                    return
                }
                logMessage("Failed to sync settings to server", "error", {
                    metadata: getErrorMetadata(error),
                })
            }
        },
        [
            authedRequest,
            collectChangedDirtyKeys,
            isSessionActive,
            scheduleFlush,
            serializeComparable,
        ]
    )
    flushDirtyRef.current = () => flushDirtyKeysToServer()

    const scheduleDebouncedSync = useCallback(() => {
        if (!isSessionActive()) return
        if (isApplyingServerRef.current) return
        if (dirtyKeysRef.current.size === 0) return
        scheduleFlush(1000)
    }, [isSessionActive, scheduleFlush])

    useEffect(() => {
        if (!accessToken) {
            syncedValueSnapshotRef.current.clear()
        }
    }, [accessToken])

    useEffect(() => {
        const unsubscribe = subscribeToLocalStorageWrites(({ key }) => {
            if (isPersistentKey(key) && !isApplyingServerRef.current) {
                dirtyKeysRef.current.add(key)
                scheduleDebouncedSync()
            }
        })

        return unsubscribe
    }, [scheduleDebouncedSync])

    const applyServerSettingsToLocal = useCallback(
        async (
            serverSettings: unknown,
            skipKeys: Set<string>,
            signal?: AbortSignal
        ) => {
            const raw: Record<string, unknown> =
                isRecord(serverSettings) && !Array.isArray(serverSettings)
                    ? serverSettings
                    : {}
            const normalized = normalizeAllPersistentSettings(
                raw
            ) as unknown as Record<string, unknown>

            // The normalizer fills every key with a default, but a key the server copy
            // lacks (or holds in an unusable shape) says nothing about this device's
            // value. Applying the default would wipe it, e.g. friends -> []. Keep the
            // local value and upload it so the server copy fills in.
            const missingKeys: string[] = []
            for (const key of Object.keys(normalized)) {
                const absent =
                    !(key in raw) ||
                    raw[key] === null ||
                    (isIdOnlyKey(key) && !Array.isArray(raw[key]))
                if (absent) {
                    delete normalized[key]
                    missingKeys.push(key)
                }
            }

            // Local edits that haven't reached the server yet win over server values.
            for (const key of Array.from(skipKeys)) delete normalized[key]

            /** Write server values to localStorage without marking them as local edits. */
            const writeServerValues = (write: () => void) => {
                isApplyingServerRef.current = true
                try {
                    write()
                } finally {
                    isApplyingServerRef.current = false
                }
            }
            const recordSynced = (key: string) => {
                if (!isPersistentKey(key)) return
                syncedValueSnapshotRef.current.set(
                    key,
                    serializeComparable(key, normalized[key])
                )
            }

            // Plain settings apply right away.
            const {
                friends: friendIds,
                ignores: ignoreIds,
                "registered-characters": registeredIds,
                ...nonCharSettings
            } = normalized
            writeServerValues(() => {
                setPersistentData(nonCharSettings as Record<string, any>)
                for (const key of Object.keys(nonCharSettings))
                    recordSynced(key)
            })
            setPersistentSettingsRevision((prev) => prev + 1)

            // Character lists need a lookup first, which can take a while. Write
            // tracking stays on meanwhile, so a list edited during the lookup counts
            // as a local edit (marked dirty, then flushed). Note each list's IDs now
            // to spot such edits afterwards.
            const characterKeys = Object.keys(normalized).filter(isIdOnlyKey)
            const idsBeforeLookups = new Map<string, string | null>()
            for (const key of characterKeys) {
                idsBeforeLookups.set(key, serializePersistentValue(key))
            }

            const [friendsResult, ignoresResult, registeredResult] =
                await Promise.all([
                    friendIds === undefined
                        ? Promise.resolve(undefined)
                        : hydrateCharacterIds(friendIds as number[], signal),
                    ignoreIds === undefined
                        ? Promise.resolve(undefined)
                        : hydrateCharacterIds(ignoreIds as number[], signal),
                    registeredIds === undefined
                        ? Promise.resolve(undefined)
                        : hydrateCharacterIds(
                              registeredIds as number[],
                              signal
                          ),
                ])

            const applyCharacterList = (
                key: string,
                label: string,
                result: Character[] | null | undefined,
                save: (characters: Character[]) => void
            ) => {
                // Missing on the server: keep the local list (uploaded below).
                if (!(key in normalized)) return
                // Edited locally during the lookup: the local edit wins.
                if (
                    serializePersistentValue(key) !== idsBeforeLookups.get(key)
                ) {
                    return
                }
                if (result) {
                    save(result)
                } else if (result === null) {
                    logMessage(
                        `Character hydration failed for ${label}; existing local data preserved`,
                        "warn",
                        {}
                    )
                }
                recordSynced(key)
            }
            writeServerValues(() => {
                applyCharacterList(
                    "friends",
                    "friends",
                    friendsResult,
                    setFriends
                )
                applyCharacterList(
                    "ignores",
                    "ignores",
                    ignoresResult,
                    setIgnores
                )
                applyCharacterList(
                    "registered-characters",
                    "registered characters",
                    registeredResult,
                    setRegisteredCharacters
                )
            })
            if (characterKeys.length > 0) {
                setPersistentSettingsRevision((prev) => prev + 1)
            }

            // Fill in what the server copy was missing, and flush edits made during
            // the lookups. Dropping the snapshot forces the upload even when it
            // happens to match what this tab last synced (e.g. after the server
            // copy was deleted).
            for (const key of missingKeys) {
                if (!isPersistentKey(key)) continue
                syncedValueSnapshotRef.current.delete(key)
                dirtyKeysRef.current.add(key)
            }
            scheduleDebouncedSync()
        },
        [
            isIdOnlyKey,
            scheduleDebouncedSync,
            serializeComparable,
            serializePersistentValue,
        ]
    )

    /**
     * Pull the account's settings into localStorage. Pending local edits are pushed
     * first and never overwritten; an empty server copy is seeded from this device.
     */
    const fetchAndApplyServerSettings = useCallback(
        async (signal?: AbortSignal) => {
            try {
                clearSyncTimeout()
                await flushDirtyKeysToServer(signal)
                const response = await authedRequest((token) =>
                    getPersistentSettings(token, signal)
                )
                const serverSettings = response?.data?.settings
                if (
                    !serverSettings ||
                    typeof serverSettings !== "object" ||
                    Object.keys(serverSettings).length === 0
                ) {
                    await flushAllLocalSettingsToServer(signal)
                    return
                }
                await applyServerSettingsToLocal(
                    serverSettings,
                    new Set(dirtyKeysRef.current),
                    signal
                )
            } catch (error: unknown) {
                if (isAbortError(error) || isSessionError(error)) return
                if (getStatus(error) === 404) {
                    await flushAllLocalSettingsToServer(signal)
                    return
                }
                logMessage("Failed to fetch settings from server", "warn", {
                    metadata: getErrorMetadata(error),
                })
            }
        },
        [
            applyServerSettingsToLocal,
            authedRequest,
            clearSyncTimeout,
            flushAllLocalSettingsToServer,
            flushDirtyKeysToServer,
        ]
    )

    // ----- logged-out notice -----

    const syncLoggedOutNotice = useCallback(() => {
        const notice = getLoggedOutNotice()
        if (!notice || isSessionActive()) {
            removeNotification(LOGGED_OUT_NOTICE_ID)
            return
        }
        const copy =
            LOGGED_OUT_NOTICE_COPY[notice.code] ?? LOGGED_OUT_NOTICE_COPY.invalid
        createNotification({
            id: LOGGED_OUT_NOTICE_ID,
            title: copy.title,
            message: copy.message,
            type: "warning",
            // No ttl: it stays (across visits too) until they log in or dismiss it.
            onDismiss: () => setLoggedOutNotice(null),
            actions: (
                <>
                    <Button type="primary" small onClick={openLoginModal}>
                        Log In
                    </Button>
                    <Button
                        type="secondary"
                        small
                        onClick={() => dismissNotification(LOGGED_OUT_NOTICE_ID)}
                    >
                        Dismiss
                    </Button>
                </>
            ),
        })
    }, [
        createNotification,
        dismissNotification,
        isSessionActive,
        openLoginModal,
        removeNotification,
    ])

    // Another tab dismissed or raised the notice.
    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key === LOGGED_OUT_NOTICE_KEY) syncLoggedOutNotice()
        }
        window.addEventListener("storage", onStorage)
        return () => window.removeEventListener("storage", onStorage)
    }, [syncLoggedOutNotice])

    useEffect(() => {
        if (firstLoadComplete) syncLoggedOutNotice()
    }, [firstLoadComplete, accessToken, syncLoggedOutNotice])

    // ----- session events -----

    const resetSyncState = useCallback(() => {
        clearSyncTimeout()
        syncedValueSnapshotRef.current.clear()
    }, [clearSyncTimeout])

    const handleAuthEvent = useCallback(
        (snapshot: AuthSnapshot, event: AuthEvent) => {
            setAccessToken(snapshot.accessToken)
            if (event.type === "session-started") {
                setSessionHint(true)
                setLoggedOutNotice(null)
                setLogoutReason(null)
                if (event.origin !== "local") {
                    // Restored on load, or logged in from another tab: pull settings here
                    // too (login/register do their own pull).
                    sessionSyncPromiseRef.current = fetchAndApplyServerSettings()
                }
            } else if (event.type === "session-ended") {
                resetSyncState()
                setSessionHint(false)
                setLogoutReason(event.reason)
                if (event.reason === "invalidated" && event.origin === "local") {
                    setLoggedOutNotice({
                        code: event.code ?? "invalid",
                        at: Date.now(),
                    })
                    logMessage("Session ended by the server", "info", {
                        metadata: { code: event.code ?? "invalid" },
                    })
                }
                syncLoggedOutNotice()
            }
        },
        [fetchAndApplyServerSettings, resetSyncState, syncLoggedOutNotice]
    )
    const handleAuthEventRef = useRef(handleAuthEvent)
    handleAuthEventRef.current = handleAuthEvent

    // Own the auth session for this provider's lifetime, and resume any existing session.
    useEffect(() => {
        const session = getSession()
        const unsubscribe = session.subscribe((snapshot, event) =>
            handleAuthEventRef.current(snapshot, event)
        )
        let cancelled = false

        const startup = async () => {
            if (hasPendingLogout()) {
                // The last logout never reached the server; finish it before anything else.
                try {
                    await postLogout(null)
                    setPendingLogout(false)
                } catch {
                    // Still unreachable: keep the flag and try again next visit.
                }
                setSessionHint(false)
                return
            }
            if (!hasSessionHint()) return

            setIsLoading(true)
            const fallback = window.setTimeout(() => {
                // Don't hold the login button hostage to a slow network.
                if (!cancelled) setFirstLoadComplete(true)
            }, 3000)
            try {
                const outcome = await session.restore()
                if (outcome === "ok" && sessionSyncPromiseRef.current) {
                    await sessionSyncPromiseRef.current
                }
            } catch (error) {
                logMessage("Failed to restore session", "warn", {
                    metadata: getErrorMetadata(error),
                })
            } finally {
                window.clearTimeout(fallback)
                if (!cancelled) setIsLoading(false)
            }
        }

        void startup().finally(() => {
            if (!cancelled) setFirstLoadComplete(true)
        })

        return () => {
            cancelled = true
            unsubscribe()
            session.dispose()
            if (sessionRef.current === session) sessionRef.current = null
        }
    }, [getSession])

    // Flush pending edits when the page is hidden or unloaded, and pull fresh settings
    // when a long-hidden tab comes back.
    useEffect(() => {
        let hiddenSince: number | null = document.hidden ? Date.now() : null

        const onVisibilityChange = () => {
            if (document.hidden) {
                hiddenSince = Date.now()
                if (syncTimeoutRef.current !== null) {
                    clearSyncTimeout()
                    void flushDirtyKeysToServer()
                }
                return
            }
            const hiddenFor = hiddenSince === null ? 0 : Date.now() - hiddenSince
            hiddenSince = null
            if (isSessionActive() && hiddenFor >= SETTINGS_PULL_AFTER_HIDDEN_MS) {
                void fetchAndApplyServerSettings()
            }
        }

        const onPageHide = () => {
            const token = sessionRef.current?.getState().accessToken
            if (!token || dirtyKeysRef.current.size === 0) return
            const changedKeys = collectChangedDirtyKeys()
            if (changedKeys.length === 0) return
            const settings = normalizePartialPersistentSettings(
                getPersistentDataByKeys(changedKeys),
                changedKeys
            )
            const body = JSON.stringify({ settings })
            if (body.length > KEEPALIVE_BODY_LIMIT) return
            try {
                // keepalive lets the request outlive the page; axios can't do that.
                void fetch(`${API_URL}/v1/user/settings/persistent`, {
                    method: "PATCH",
                    keepalive: true,
                    credentials: "include",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body,
                }).catch(() => undefined)
            } catch {
                // Best effort only.
            }
        }

        document.addEventListener("visibilitychange", onVisibilityChange)
        window.addEventListener("pagehide", onPageHide)
        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange)
            window.removeEventListener("pagehide", onPageHide)
        }
    }, [
        clearSyncTimeout,
        collectChangedDirtyKeys,
        fetchAndApplyServerSettings,
        flushDirtyKeysToServer,
        isSessionActive,
    ])

    // ----- account lifecycle -----

    /** Finish a logout that never reached the server before starting a new session. */
    const settlePendingLogout = useCallback(async () => {
        if (!hasPendingLogout()) return
        try {
            await postLogout(null)
        } catch {
            // The new login replaces this browser's cookie anyway.
        }
        setPendingLogout(false)
    }, [])

    const beginSession = useCallback(
        async (data: UserAuthedResponse["data"], signal?: AbortSignal) => {
            // Edits made while logged out don't belong to this account; the server wins.
            dirtyKeysRef.current.clear()
            getSession().startSession(data)
            closeAccountModal()
            await fetchAndApplyServerSettings(signal)
        },
        [closeAccountModal, fetchAndApplyServerSettings, getSession]
    )

    const register = useCallback(
        async (payload: UserAccountObject, signal?: AbortSignal) => {
            setIsLoading(true)
            try {
                await settlePendingLogout()
                const response = await postRegister(payload, signal)
                if (response?.data) {
                    await beginSession(response.data, signal)
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
                if (isAbortError(error)) {
                    return null
                }
                if (getStatus(error) !== 409) {
                    logMessage("User registration failed", "error", {
                        metadata: getErrorMetadata(error),
                    })
                }
                throw error
            } finally {
                setIsLoading(false)
            }
        },
        [beginSession, createNotification, settlePendingLogout]
    )

    const login = useCallback(
        async (payload: UserAccountObject, signal?: AbortSignal) => {
            setIsLoading(true)
            try {
                await settlePendingLogout()
                const response = await postLogin(payload, signal)
                if (response?.data) {
                    await beginSession(response.data, signal)
                }
                return response
            } catch (error) {
                if (isAbortError(error)) {
                    return null
                }
                const status = getStatus(error)
                if (status !== 401 && status !== 429) {
                    logMessage("User login failed", "error", {
                        metadata: getErrorMetadata(error),
                    })
                }
                throw error
            } finally {
                setIsLoading(false)
            }
        },
        [beginSession, settlePendingLogout]
    )

    const logout = useCallback(async () => {
        setIsLoading(true)
        try {
            clearSyncTimeout()
            // Give unsynced edits a moment to reach the account before leaving it.
            await withTimeout(
                flushDirtyKeysToServer().catch(() => undefined),
                LOGOUT_FLUSH_BUDGET_MS
            )
            const token = sessionRef.current?.getState().accessToken ?? null
            let reachedServer = true
            try {
                await postLogout(token)
                setPendingLogout(false)
            } catch (error) {
                reachedServer = false
                setPendingLogout(true)
                logMessage("Logout request failed; will retry next visit", "warn", {
                    metadata: getErrorMetadata(error),
                })
            }
            dirtyKeysRef.current.clear()
            setLoggedOutNotice(null)
            getSession().endSession("user")
            createNotification(
                reachedServer
                    ? {
                          title: "Logged Out",
                          message: "You have been logged out successfully.",
                          type: "success",
                          ttl: 5000,
                      }
                    : {
                          title: "Logged Out",
                          message:
                              "You're logged out on this device. We couldn't reach the server to end the session, so we'll finish that on your next visit.",
                          type: "warning",
                          ttl: 10000,
                      }
            )
        } finally {
            setIsLoading(false)
        }
    }, [clearSyncTimeout, createNotification, flushDirtyKeysToServer, getSession])

    const deleteAccount = useCallback(
        async (password: string, signal?: AbortSignal) => {
            setIsLoading(true)
            try {
                clearSyncTimeout()
                try {
                    await authedRequest((token) =>
                        deleteAccountRequest(token, password, signal)
                    )
                } catch (error) {
                    // 404: an earlier attempt already deleted it (its response was lost).
                    if (getStatus(error) !== 404) throw error
                }
                dirtyKeysRef.current.clear()
                setLoggedOutNotice(null)
                setPendingLogout(false)
                getSession().endSession("user")
                createNotification({
                    title: "Account Deleted",
                    message: "Your account has been deleted successfully.",
                    type: "success",
                    ttl: 10000,
                })
            } catch (error) {
                if (isAbortError(error)) {
                    return
                }
                if (getStatus(error) !== 400) {
                    logMessage("Account deletion failed", "error", {
                        metadata: getErrorMetadata(error),
                    })
                }
                throw error
            } finally {
                setIsLoading(false)
            }
        },
        [authedRequest, clearSyncTimeout, createNotification, getSession]
    )

    const deleteSettings = useCallback(
        async (signal?: AbortSignal) => {
            setIsLoading(true)
            try {
                clearSyncTimeout()
                const response = await authedRequest((token) =>
                    deletePersistentSettings(token, signal)
                )
                if (response?.data?.deleted) {
                    createNotification({
                        title: "Settings Deleted",
                        message: "Your settings have been deleted successfully.",
                        type: "success",
                        ttl: 10000,
                    })
                } else {
                    throw new Error(
                        "Unexpected response from server: " +
                            JSON.stringify(response)
                    )
                }
            } catch (error) {
                if (isAbortError(error)) {
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
        [authedRequest, clearSyncTimeout, createNotification]
    )

    const changePassword = useCallback(
        async (payload: UpdatePasswordPayload, signal?: AbortSignal) => {
            setIsLoading(true)
            try {
                const response = await authedRequest((token) =>
                    putUpdatePassword(token, payload, signal)
                )
                if (response?.data) {
                    // A new server session; other tabs pick the token up from the broadcast.
                    getSession().startSession(response.data)
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
                if (isAbortError(error)) {
                    return
                }
                if (getStatus(error) !== 400) {
                    logMessage("Password change failed", "error", {
                        metadata: getErrorMetadata(error),
                    })
                }
                throw error
            } finally {
                setIsLoading(false)
            }
        },
        [authedRequest, closeAccountModal, createNotification, getSession]
    )

    return (
        <UserContext.Provider
            value={{
                isLoggedIn: !!accessToken,
                accessToken,
                persistentSettingsRevision,
                logoutReason,
                authedRequest,
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
