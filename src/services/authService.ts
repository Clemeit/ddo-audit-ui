import {
    RefreshPayload,
    UserAccountObject,
    UserAuthedResponse,
    UserLogoutResponse,
} from "../models/Auth.ts"
import { postRequest } from "./apiHelper.ts"

const AUTH_ENDPOINT = "auth"

function postRegister(
    payload: UserAccountObject,
    signal?: AbortSignal
): Promise<UserAuthedResponse> {
    return postRequest(`${AUTH_ENDPOINT}/register`, { data: payload, signal })
}

function postLogin(
    payload: UserAccountObject,
    signal?: AbortSignal
): Promise<UserAuthedResponse> {
    return postRequest(`${AUTH_ENDPOINT}/login`, { data: payload, signal })
}

function postRefresh(
    payload: RefreshPayload,
    signal?: AbortSignal
): Promise<UserAuthedResponse> {
    return postRequest(`${AUTH_ENDPOINT}/refresh`, { data: payload, signal })
}

function postLogout(
    accessToken: string,
    signal?: AbortSignal
): Promise<UserLogoutResponse> {
    return postRequest(`${AUTH_ENDPOINT}/logout`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
    })
}

export { postRegister, postLogin, postRefresh, postLogout }
