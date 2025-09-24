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

export type { GetSettingsResponse, PostSettingsResponse, UserSettings }
