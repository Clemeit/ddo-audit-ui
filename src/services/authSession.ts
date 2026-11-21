/**
 * Access-token lifecycle for the logged-in user, shared by every tab of this browser.
 *
 * - The access token lives only in memory. The refresh token is an HttpOnly cookie that
 *   the server rotates on every refresh.
 * - Refreshes are serialised across tabs with the Web Locks API, and the resulting token
 *   is shared over a BroadcastChannel. Without that, tabs refreshing at the same moment
 *   (waking from sleep, session restore) race each other's cookie rotation.
 * - A refresh request is never aborted: abandoning it after the server rotated the cookie
 *   would throw the new cookie away.
 * - Only a 401 from /auth/refresh ends the session. Network errors, 5xx, 429 and 403
 *   are transient and retried with backoff indefinitely.
 *
 * Framework-free so it can be unit tested. UserContext owns one instance.
 */
import axios from "axios"
import { postRefresh as defaultPostRefresh } from "./authService"
import { UserAuthedResponse } from "../models/Auth"

export type SessionEndReason = "user" | "invalidated"
export type InvalidationCode = "invalid" | "session_expired" | "session_revoked"

export type AuthTokenData = NonNullable<UserAuthedResponse["data"]>

export interface AuthSnapshot {
    accessToken: string | null
    expiresAt: number | null
}

export type AuthEvent =
    /** A token arrived while logged out. origin: who obtained it. */
    | { type: "session-started"; origin: "local" | "remote" | "restored" }
    /** The token was refreshed or replaced within an existing session. */
    | { type: "token-updated" }
    | {
          type: "session-ended"
          reason: SessionEndReason
          code?: InvalidationCode
          origin: "local" | "remote"
      }

type Listener = (snapshot: AuthSnapshot, event: AuthEvent) => void

type ChannelMessage =
    | { type: "token"; accessToken: string; expiresAt: number }
    | { type: "logout"; reason: SessionEndReason; code?: InvalidationCode }

interface ChannelLike {
    postMessage(message: unknown): void
    close(): void
    onmessage: ((event: MessageEvent) => void) | null
}

interface LocksLike {
    request<T>(name: string, callback: () => Promise<T>): Promise<T>
}

export interface AuthSessionDeps {
    postRefresh?: () => Promise<UserAuthedResponse>
    now?: () => number
    random?: () => number
    locks?: LocksLike | null
    createChannel?: (() => ChannelLike | null) | null
    setTimeout?: (fn: () => void, ms: number) => number
    clearTimeout?: (id: number) => void
    /** Where visibility/online/focus listeners attach; null disables them. */
    eventTarget?: Pick<Window, "addEventListener" | "removeEventListener"> | null
    isDocumentVisible?: () => boolean
}

export class NotLoggedInError extends Error {
    constructor() {
        super("Not logged in")
        this.name = "NotLoggedInError"
    }
}

export class TransientRefreshError extends Error {
    readonly retryAfterMs: number | null
    readonly cause: unknown
    constructor(cause: unknown, retryAfterMs: number | null) {
        super("Session refresh failed temporarily")
        this.name = "TransientRefreshError"
        this.cause = cause
        this.retryAfterMs = retryAfterMs
    }
}

/** Name-based so it survives any class transpilation of Error subclasses. */
export const isTransient = (error: unknown): error is TransientRefreshError =>
    (error as { name?: string } | null)?.name === "TransientRefreshError"

export const isNotLoggedIn = (error: unknown): error is NotLoggedInError =>
    (error as { name?: string } | null)?.name === "NotLoggedInError"

export const REFRESH_LOCK_NAME = "ddo-audit-auth-refresh"
export const AUTH_CHANNEL_NAME = "ddo-audit-auth"
/** Refresh when less than this is left on the access token. */
export const REFRESH_MARGIN_MS = 60_000
/** Retry delays after a transient refresh failure; the last one repeats forever. */
export const RETRY_DELAYS_MS = [5_000, 10_000, 30_000, 60_000, 120_000, 300_000]

const VALID_CODES: InvalidationCode[] = [
    "invalid",
    "session_expired",
    "session_revoked",
]

type RefreshOutcome =
    | { kind: "ok"; accessToken: string }
    | { kind: "invalid"; code: InvalidationCode }
    /** A login/logout happened while this refresh was in flight; its result was dropped. */
    | { kind: "superseded" }

const getStatus = (error: unknown): number | undefined =>
    axios.isAxiosError(error) ? error.response?.status : undefined

const getRetryAfterMs = (error: unknown): number | null => {
    if (!axios.isAxiosError(error)) return null
    const header = error.response?.headers?.["retry-after"]
    const seconds = Number(header)
    return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : null
}

const getInvalidationCode = (error: unknown): InvalidationCode => {
    const code = axios.isAxiosError(error)
        ? (error.response?.data as { code?: unknown } | undefined)?.code
        : undefined
    return VALID_CODES.includes(code as InvalidationCode)
        ? (code as InvalidationCode)
        : "invalid"
}

const defaultCreateChannel = (): ChannelLike | null => {
    try {
        return typeof BroadcastChannel === "undefined"
            ? null
            : (new BroadcastChannel(AUTH_CHANNEL_NAME) as ChannelLike)
    } catch {
        return null
    }
}

const defaultLocks = (): LocksLike | null => {
    try {
        const locks = (navigator as Navigator & { locks?: LocksLike }).locks
        return locks && typeof locks.request === "function" ? locks : null
    } catch {
        return null
    }
}

export interface AuthSession {
    getState(): AuthSnapshot
    subscribe(listener: Listener): () => void
    /** Adopt a token from login/register/password change (a brand-new server session). */
    startSession(data: AuthTokenData): void
    /** Drop the session locally and tell the other tabs. */
    endSession(reason: SessionEndReason, code?: InvalidationCode): void
    /**
     * Try to resume a session from the refresh cookie (page load). On a transient failure
     * it keeps retrying in the background and emits session-started if one succeeds.
     */
    restore(): Promise<"ok" | "invalid" | "transient" | "superseded">
    /** A token good for at least REFRESH_MARGIN_MS, refreshing first if needed. */
    getValidAccessToken(): Promise<string | null>
    /** Run fn with a valid token; on a 401, refresh once and retry. */
    authedRequest<T>(fn: (accessToken: string) => Promise<T>): Promise<T>
    dispose(): void
}

export function createAuthSession(deps: AuthSessionDeps = {}): AuthSession {
    const postRefresh = deps.postRefresh ?? defaultPostRefresh
    const now = deps.now ?? (() => Date.now())
    const random = deps.random ?? Math.random
    const locks = deps.locks === undefined ? defaultLocks() : deps.locks
    const channel =
        deps.createChannel === null
            ? null
            : (deps.createChannel ?? defaultCreateChannel)()
    const setTimer =
        deps.setTimeout ??
        ((fn: () => void, ms: number) => window.setTimeout(fn, ms))
    const clearTimer =
        deps.clearTimeout ?? ((id: number) => window.clearTimeout(id))
    const eventTarget =
        deps.eventTarget === undefined
            ? typeof window !== "undefined"
                ? window
                : null
            : deps.eventTarget
    const isDocumentVisible =
        deps.isDocumentVisible ??
        (() => typeof document === "undefined" || !document.hidden)

    let state: AuthSnapshot = { accessToken: null, expiresAt: null }
    /** Bumped on every login/logout so in-flight refreshes can tell they're stale. */
    let generation = 0
    let inflight: Promise<RefreshOutcome> | null = null
    let timer: number | null = null
    let retryAttempt = 0
    /** Retrying a failed restore() (logged out, but the session may still be alive). */
    let restoring = false
    let disposed = false
    const listeners = new Set<Listener>()

    const emit = (event: AuthEvent) => {
        const snapshot = { ...state }
        listeners.forEach((listener) => {
            try {
                listener(snapshot, event)
            } catch (error) {
                console.error("Auth session listener failed", error)
            }
        })
    }

    const broadcast = (message: ChannelMessage) => {
        try {
            channel?.postMessage(message)
        } catch {
            // A closed channel just means no cross-tab sync.
        }
    }

    const cancelTimer = () => {
        if (timer !== null) {
            clearTimer(timer)
            timer = null
        }
    }

    const schedule = (delayMs: number) => {
        cancelTimer()
        if (disposed) return
        timer = setTimer(
            () => {
                timer = null
                void runScheduledRefresh()
            },
            Math.max(0, delayMs)
        )
    }

    const scheduleKeepAlive = () => {
        if (state.expiresAt === null) return
        retryAttempt = 0
        // Small jitter so tabs don't all wake at the same instant.
        const jitter = Math.floor(random() * 5_000)
        schedule(state.expiresAt - now() - REFRESH_MARGIN_MS - jitter)
    }

    const scheduleRetry = (retryAfterMs: number | null) => {
        const backoff =
            RETRY_DELAYS_MS[Math.min(retryAttempt, RETRY_DELAYS_MS.length - 1)]
        retryAttempt += 1
        schedule(Math.max(backoff, retryAfterMs ?? 0))
    }

    const applyToken = (
        accessToken: string,
        expiresAt: number,
        origin: "local" | "remote" | "restored"
    ) => {
        const wasLoggedIn = state.accessToken !== null
        state = { accessToken, expiresAt }
        restoring = false
        scheduleKeepAlive()
        emit(
            wasLoggedIn
                ? { type: "token-updated" }
                : { type: "session-started", origin }
        )
    }

    const clearLocal = (
        reason: SessionEndReason,
        code: InvalidationCode | undefined,
        origin: "local" | "remote"
    ) => {
        generation += 1
        cancelTimer()
        restoring = false
        retryAttempt = 0
        state = { accessToken: null, expiresAt: null }
        emit({ type: "session-ended", reason, code, origin })
    }

    const hasFreshToken = () =>
        state.accessToken !== null &&
        state.expiresAt !== null &&
        state.expiresAt - now() > REFRESH_MARGIN_MS

    /**
     * One refresh round-trip under the cross-tab lock. `staleToken` is the token the
     * caller found wanting; if another tab already replaced it, no request is needed.
     */
    const refreshOnce = (staleToken: string | null): Promise<RefreshOutcome> => {
        const startGeneration = generation
        const run = async (): Promise<RefreshOutcome> => {
            if (generation !== startGeneration) return { kind: "superseded" }
            if (hasFreshToken() && state.accessToken !== staleToken) {
                return { kind: "ok", accessToken: state.accessToken as string }
            }
            try {
                const response = await postRefresh()
                if (generation !== startGeneration) return { kind: "superseded" }
                const data = response?.data
                if (!data?.access_token) {
                    throw new TransientRefreshError(
                        new Error("Refresh response had no access token"),
                        null
                    )
                }
                const expiresAt = now() + data.expires_in * 1000
                applyToken(
                    data.access_token,
                    expiresAt,
                    restoring ? "restored" : "local"
                )
                broadcast({
                    type: "token",
                    accessToken: data.access_token,
                    expiresAt,
                })
                return { kind: "ok", accessToken: data.access_token }
            } catch (error) {
                if (isTransient(error)) throw error
                if (generation !== startGeneration) return { kind: "superseded" }
                if (getStatus(error) === 401) {
                    return { kind: "invalid", code: getInvalidationCode(error) }
                }
                throw new TransientRefreshError(error, getRetryAfterMs(error))
            }
        }
        return locks ? locks.request(REFRESH_LOCK_NAME, run) : run()
    }

    /** Single-flight within this tab; the lock handles the other tabs. */
    const refresh = (staleToken: string | null): Promise<RefreshOutcome> => {
        if (!inflight) {
            inflight = refreshOnce(staleToken).finally(() => {
                inflight = null
            })
        }
        return inflight
    }

    const handleInvalid = (code: InvalidationCode) => {
        clearLocal("invalidated", code, "local")
        broadcast({ type: "logout", reason: "invalidated", code })
    }

    async function runScheduledRefresh() {
        if (disposed) return
        if (!state.accessToken && !restoring) return
        try {
            const outcome = await refresh(state.accessToken)
            if (outcome.kind === "invalid") handleInvalid(outcome.code)
        } catch (error) {
            if (isTransient(error)) {
                scheduleRetry(error.retryAfterMs)
                return
            }
            throw error
        }
    }

    const onWake = () => {
        if (disposed || !isDocumentVisible()) return
        // Timers are throttled in background tabs and frozen during sleep; catch up now.
        if (state.accessToken && !hasFreshToken()) {
            void runScheduledRefresh()
        } else if (restoring || (state.accessToken && retryAttempt > 0)) {
            void runScheduledRefresh()
        }
    }

    const onOnline = () => {
        if (disposed) return
        if (restoring || retryAttempt > 0 || (state.accessToken && !hasFreshToken())) {
            void runScheduledRefresh()
        }
    }

    eventTarget?.addEventListener("visibilitychange", onWake)
    eventTarget?.addEventListener("focus", onWake)
    eventTarget?.addEventListener("online", onOnline)

    if (channel) {
        channel.onmessage = (event: MessageEvent) => {
            const message = event.data as ChannelMessage
            if (!message || typeof message !== "object") return
            if (message.type === "token") {
                if (
                    typeof message.accessToken !== "string" ||
                    typeof message.expiresAt !== "number"
                ) {
                    return
                }
                // Another tab refreshed or logged in. Newer wins; a new login/password
                // change also replaces our (now revoked) token.
                if (
                    state.accessToken === message.accessToken ||
                    (state.expiresAt !== null &&
                        message.expiresAt < state.expiresAt &&
                        state.accessToken !== null)
                ) {
                    return
                }
                generation += 1
                applyToken(message.accessToken, message.expiresAt, "remote")
            } else if (message.type === "logout") {
                if (message.reason === "user") {
                    if (state.accessToken === null && !restoring) return
                    clearLocal("user", undefined, "remote")
                    return
                }
                // Another tab's refresh was refused. That tab may simply have sent a
                // cookie that this tab has since replaced (e.g. by logging in), so check
                // with our own refresh before giving up a session that may be fine.
                if (state.accessToken !== null) void verifyRemoteInvalidation()
            }
        }
    }

    async function verifyRemoteInvalidation() {
        try {
            const outcome = await refresh(state.accessToken)
            if (outcome.kind === "invalid") handleInvalid(outcome.code)
        } catch (error) {
            if (isTransient(error)) {
                scheduleRetry(error.retryAfterMs)
            }
        }
    }

    async function getValidAccessToken(): Promise<string | null> {
        if (!state.accessToken) return null
        if (hasFreshToken()) return state.accessToken
        try {
            const outcome = await refresh(state.accessToken)
            if (outcome.kind === "ok") return outcome.accessToken
            if (outcome.kind === "invalid") {
                handleInvalid(outcome.code)
                return null
            }
            return state.accessToken
        } catch (error) {
            if (isTransient(error)) {
                if (retryAttempt === 0) scheduleRetry(error.retryAfterMs)
                // Still usable if it hasn't actually expired yet.
                if (state.expiresAt !== null && state.expiresAt > now()) {
                    return state.accessToken
                }
            }
            throw error
        }
    }

    async function authedRequest<T>(
        fn: (accessToken: string) => Promise<T>
    ): Promise<T> {
        const token = await getValidAccessToken()
        if (!token) throw new NotLoggedInError()
        try {
            return await fn(token)
        } catch (error) {
            if (getStatus(error) !== 401) throw error
            let outcome: RefreshOutcome
            try {
                outcome = await refresh(token)
            } catch (refreshError) {
                if (isTransient(refreshError)) {
                    if (retryAttempt === 0) scheduleRetry(refreshError.retryAfterMs)
                    throw error
                }
                throw refreshError
            }
            if (outcome.kind === "invalid") {
                handleInvalid(outcome.code)
                throw error
            }
            const retryToken =
                outcome.kind === "ok" ? outcome.accessToken : state.accessToken
            if (!retryToken) throw new NotLoggedInError()
            // A second 401 is passed through; it doesn't end the session.
            return fn(retryToken)
        }
    }

    return {
        getState: () => ({ ...state }),

        subscribe(listener) {
            listeners.add(listener)
            return () => {
                listeners.delete(listener)
            }
        },

        startSession(data) {
            generation += 1
            const expiresAt = now() + data.expires_in * 1000
            applyToken(data.access_token, expiresAt, "local")
            broadcast({ type: "token", accessToken: data.access_token, expiresAt })
        },

        endSession(reason, code) {
            clearLocal(reason, code, "local")
            broadcast({ type: "logout", reason, code })
        },

        async restore() {
            restoring = true
            try {
                const outcome = await refresh(null)
                if (outcome.kind === "invalid") {
                    restoring = false
                    handleInvalid(outcome.code)
                    return "invalid"
                }
                return outcome.kind === "ok" ? "ok" : "superseded"
            } catch (error) {
                if (isTransient(error) && restoring) {
                    scheduleRetry(error.retryAfterMs)
                    return "transient"
                }
                restoring = false
                throw error
            }
        },

        getValidAccessToken,

        authedRequest,

        dispose() {
            disposed = true
            cancelTimer()
            listeners.clear()
            eventTarget?.removeEventListener("visibilitychange", onWake)
            eventTarget?.removeEventListener("focus", onWake)
            eventTarget?.removeEventListener("online", onOnline)
            if (channel) {
                channel.onmessage = null
                channel.close()
            }
        },
    }
}
