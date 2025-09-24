import { AccessToken } from "./Verification"

interface GetSettingsResponse {
    data: {
        settings?: {
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
        originatingUserId?: string
    }
}

interface PostSettingsResponse {
    data: {
        user_id?: string
    }
}

export type { GetSettingsResponse, PostSettingsResponse }
