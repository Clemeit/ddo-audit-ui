/**
 * Small localStorage flags for the account session. Shared by every tab; every access
 * is guarded because storage can be unavailable (private mode, blocked site data).
 */
import { InvalidationCode } from "../services/authSession"

/** A session probably exists, so try the refresh cookie on page load. */
export const SESSION_REHYDRATE_HINT_KEY = "v1-auth-session-hint"
/** A logout couldn't reach the server; retry it on the next visit. */
export const PENDING_LOGOUT_KEY = "v1-auth-pending-logout"
/** The user was logged out without asking to be; keep telling them until they act. */
export const LOGGED_OUT_NOTICE_KEY = "v1-auth-logged-out-notice"

export interface LoggedOutNotice {
    code: InvalidationCode
    at: number
}

const read = (key: string): string | null => {
    try {
        return window.localStorage.getItem(key)
    } catch {
        return null
    }
}

const write = (key: string, value: string | null) => {
    try {
        if (value === null) {
            window.localStorage.removeItem(key)
        } else {
            window.localStorage.setItem(key, value)
        }
    } catch {
        // Storage unavailable: fall back to this page's in-memory state only.
    }
}

export const hasSessionHint = () => read(SESSION_REHYDRATE_HINT_KEY) === "1"
export const setSessionHint = (enabled: boolean) =>
    write(SESSION_REHYDRATE_HINT_KEY, enabled ? "1" : null)

export const hasPendingLogout = () => read(PENDING_LOGOUT_KEY) === "1"
export const setPendingLogout = (pending: boolean) =>
    write(PENDING_LOGOUT_KEY, pending ? "1" : null)

export const getLoggedOutNotice = (): LoggedOutNotice | null => {
    const raw = read(LOGGED_OUT_NOTICE_KEY)
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw) as Partial<LoggedOutNotice>
        return {
            code:
                parsed.code === "session_expired" ||
                parsed.code === "session_revoked"
                    ? parsed.code
                    : "invalid",
            at: typeof parsed.at === "number" ? parsed.at : Date.now(),
        }
    } catch {
        return { code: "invalid", at: Date.now() }
    }
}

export const setLoggedOutNotice = (notice: LoggedOutNotice | null) =>
    write(LOGGED_OUT_NOTICE_KEY, notice ? JSON.stringify(notice) : null)
