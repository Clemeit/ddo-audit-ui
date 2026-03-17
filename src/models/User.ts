import { UserObject } from "./Auth"
import { AccessToken } from "./Verification"

interface UserSettings {
    registeredCharacterIds?: number[]
    verifiedCharacterIds?: number[]
    accessTokens?: AccessToken[]
    friendIds?: number[]
    ignoreIds?: number[]
    lfmSettings?: any
    whoSettings?: any
    booleanFlags?: { [key: string]: boolean }
    dismissedCallouts?: string[]
}

interface GetSettingsResponse {
    data: {
        settings?: UserSettings
        originatingUserId?: string
    }
}

interface PostSettingsResponse {
    data: {
        user_id?: string
    }
}

interface UserProfile {
    data?: UserObject
    error?: string
}

interface UpdatePasswordPayload {
    old_password: string
    new_password: string
}

interface PersistentSettingsPayload {
    settings: {
        [key: string]: any
    }
}

interface PersistentSettingsResponse {
    data?: {
        settings: {
            [key: string]: any
        }
    }
    error?: string
}

export type {
    GetSettingsResponse,
    PostSettingsResponse,
    UserSettings,
    UserProfile,
    UpdatePasswordPayload,
    PersistentSettingsPayload,
    PersistentSettingsResponse,
}
