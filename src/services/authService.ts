import {
    AccountDeleteResponse,
    UserAccountObject,
    UserAuthedResponse,
    UserLogoutResponse,
} from "../models/Auth.ts"
import { deleteRequest, postRequest } from "./apiHelper.ts"

const AUTH_ENDPOINT = "auth"

function postRegister(
    payload: UserAccountObject,
    signal?: AbortSignal
): Promise<UserAuthedResponse> {
    return postRequest(`${AUTH_ENDPOINT}/register`, {
        data: payload,
        signal,
        withCredentials: true,
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

function postRefresh(signal?: AbortSignal): Promise<UserAuthedResponse> {
    return postRequest(`${AUTH_ENDPOINT}/refresh`, {
        signal,
        withCredentials: true,
    })
}

function postLogout(
    accessToken: string,
    signal?: AbortSignal
): Promise<UserLogoutResponse> {
    return postRequest(`${AUTH_ENDPOINT}/logout`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
        withCredentials: true,
    })
}

function deleteAccount(
    accessToken: string,
    signal?: AbortSignal
): Promise<AccountDeleteResponse> {
    return deleteRequest(`${AUTH_ENDPOINT}/account`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
        withCredentials: true,
    })
}

export { postRegister, postLogin, postRefresh, postLogout, deleteAccount }
