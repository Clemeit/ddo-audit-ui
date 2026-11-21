import {
    AccountDeleteResponse,
    UserAccountObject,
    UserAuthedResponse,
    UserLogoutResponse,
} from "../models/Auth.ts"
import { deleteRequest, postRequest } from "./apiHelper.ts"

const AUTH_ENDPOINT = "auth"

// Registration isn't idempotent: retrying after a lost response would report
// "username taken" for the account that was just created.
function postRegister(
    payload: UserAccountObject,
    signal?: AbortSignal
): Promise<UserAuthedResponse> {
    return postRequest(`${AUTH_ENDPOINT}/register`, {
        data: payload,
        signal,
        withCredentials: true,
        noRetry: true,
    })
}

function postLogin(
    payload: UserAccountObject,
    signal?: AbortSignal
): Promise<UserAuthedResponse> {
    return postRequest(`${AUTH_ENDPOINT}/login`, {
        data: payload,
        signal,
        withCredentials: true,
    })
}

/**
 * Exchange the HttpOnly refresh cookie for a new access token.
 *
 * Takes no AbortSignal on purpose: abandoning a refresh after the server has rotated the
 * cookie would lose the new one. Retrying is safe; the server honours a just-rotated
 * token for a short grace window.
 */
function postRefresh(): Promise<UserAuthedResponse> {
    return postRequest(`${AUTH_ENDPOINT}/refresh`, {
        withCredentials: true,
    })
}

/**
 * End this browser's session. The server identifies it from the refresh cookie, so this
 * works without a (still valid) access token; one is sent when available as a fallback.
 */
function postLogout(
    accessToken?: string | null,
    signal?: AbortSignal
): Promise<UserLogoutResponse> {
    return postRequest(`${AUTH_ENDPOINT}/logout`, {
        headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
        signal,
        withCredentials: true,
        timeout: 8000,
    })
}

// Not retried: a retry after a lost success response would get 404 and report failure.
function deleteAccount(
    accessToken: string,
    password: string,
    signal?: AbortSignal
): Promise<AccountDeleteResponse> {
    return deleteRequest(`${AUTH_ENDPOINT}/account`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { password },
        signal,
        withCredentials: true,
        noRetry: true,
    })
}

export { postRegister, postLogin, postRefresh, postLogout, deleteAccount }
