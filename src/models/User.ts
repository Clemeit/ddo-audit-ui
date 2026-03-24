import { UserObject } from "./Auth"
import { AccessToken } from "./Verification"
import type { NormalizedPersistentSettings } from "../utils/settingsNormalizers"

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
    settings: Partial<NormalizedPersistentSettings>
}

interface PersistentSettingsResponse {
    data?: {
        settings: NormalizedPersistentSettings
    }
    error?: string
}

interface DeletePersistentSettingsResponse {
    data?: {
        deleted: boolean
    }
    error?: string
}

interface SimpleSetting {
    created_at?: string
    updated_at: string
}

interface AccessTokensSetting extends SimpleSetting {
    data: AccessToken[]
}

interface BooleanFlagsSetting extends SimpleSetting {
    data: {
        [key: string]: boolean
    }
}

interface DismissedCalloutsSetting extends SimpleSetting {
    data: string[]
}

interface FriendsIdListSetting extends SimpleSetting {
    data: number[]
}

interface IgnoreIdListSetting extends SimpleSetting {
    data: number[]
}

interface LfmSetting extends SimpleSetting {
    minLevel: number
    maxLevel: number
    filterByMyCharacters: boolean
    showNotEligible: boolean
    hideContentIDontOwn: boolean
    indicateContentIDontOwn: boolean
    ownedContent: string[]
    fontSize: number
    sortBy: {
        type: string
        ascending: boolean
    }
    showRaidTimerIndicator: boolean
    showMemberCount: boolean
    showQuestGuesses: boolean
    showQuestTips: boolean
    showCharacterGuildNames: boolean
    trackedCharacterIds: number[]
    showLfmPostedTime: boolean
    showQuestMetrics: boolean
    mouseOverDelay: number
    showLfmActivity: boolean
    isMultiColumn: boolean
    showEligibleCharacters: boolean
    hideGroupsPostedByIgnoredCharacters: boolean
    hideGroupsContainingIgnoredCharacters: boolean
    showIndicationForGroupsPostedByFriends: boolean
    showIndicationForGroupsContainingFriends: boolean
    highlightRaids: boolean
    hideAllLevelGroups: boolean
    showEligibilityDividers: boolean
    onlyShowRaids: boolean
    hideFullGroups: boolean
}

interface RegisteredCharacterIdListSetting extends SimpleSetting {
    data: number[]
}

interface RaidTimerSetting extends SimpleSetting {
    data: {
        sortType: string
        sortOrder: string
        hiddenTimers: {
            characterId: number
            timestamp: string
        }[]
    }
}

interface TimezoneSetting extends SimpleSetting {
    data: string
}

interface WhoSetting extends SimpleSetting {
    stringFilter: string
    classNameFilter: string[]
    minLevel: number
    maxLevel: number
    isGroupView: boolean
    shouldIncludeRegion: boolean
    isExactMatch: boolean
    sortBy: {
        type: string
        ascending: boolean
    }
    shouldSaveSettings: boolean
    shouldSaveClassFilter: boolean
    shouldSaveStringFilter: boolean
    shouldSaveLevelFilter: boolean
    shouldSaveSortBy: boolean
    shouldSaveGroupView: boolean
    shouldSaveExactMatch: boolean
    showInQuestIndicator: boolean
    showQuestName: boolean
    refreshInterval: number
    hideIgnoredCharacters: boolean
    pinRegisteredCharacters: boolean
    pinFriends: boolean
    alwaysShowRegisteredCharacters: boolean
    alwaysShowFriends: boolean
    hideClassFilterOnMobile: boolean
}

export type {
    GetSettingsResponse,
    PostSettingsResponse,
    UserSettings,
    UserProfile,
    UpdatePasswordPayload,
    PersistentSettingsPayload,
    PersistentSettingsResponse,
    AccessTokensSetting,
    BooleanFlagsSetting,
    DismissedCalloutsSetting,
    FriendsIdListSetting,
    IgnoreIdListSetting,
    LfmSetting,
    RegisteredCharacterIdListSetting,
    RaidTimerSetting,
    TimezoneSetting,
    WhoSetting,
    DeletePersistentSettingsResponse,
}
