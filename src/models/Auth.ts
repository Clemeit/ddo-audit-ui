interface UserObject {
    id: number
    username: string
    created_at: string
}

interface UserAccountObject {
    username: string
    password: string
}

interface UserAuthedResponse {
    data?: {
        access_token: string
        token_type: string
        expires_in: number
        refresh_token: string
        refresh_expires_in: number
        user?: UserObject
        message?: string
    }
    error?: string
}

interface RefreshPayload {
    refresh_token: string
}

interface UserLogoutResponse {
    data?: {
        message: string
    }
    error?: string
}

export type {
    UserObject,
    UserAccountObject,
    UserAuthedResponse,
    RefreshPayload,
    UserLogoutResponse,
}
