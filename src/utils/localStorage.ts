import { AccessToken } from "../models/Verification.ts"
import { Character } from "../models/Character.ts"
import { LocalStorageEntry } from "../models/LocalStorage.ts"
import { Area } from "../models/Area.ts"
import { Quest } from "../models/Lfm.ts"
import logMessage from "./logUtils.ts"
import { RaidTimerStorage } from "../models/RaidTimers.ts"
import { NotificationPreferences } from "../models/Notification.ts"

const VERSION_PREFIX = "v1-"

const ACCESS_TOKENS_KEY = "access-tokens"
const REGISTERED_CHARACTERS_KEY = "registered-characters"
const DISMISSED_CALLOUTS_KEY = "dismissed-feature-callouts"
const FRIENDS_KEY = "friends"
const IGNORES_KEY = "ignores"
const CACHED_AREAS_KEY = "cached-areas"
const CACHED_QUEST_KEY = "cached-quests"
const BOOLEAN_FLAGS_KEY = "boolean-flags"
const LFM_SETTINGS_KEY = "lfm-settings"
const WHO_SETTINGS_KEY = "who-settings"
const RAID_TIMER_SETTINGS_KEY = "timer-settings"
const TIMEZONE_KEY = "timezone"
const UPDATE_DISMISSED_KEY = "update-dismissed"
const UPDATE_SHOWN_KEY = "update-shown"
const NOTIFICATION_PREFERENCES_KEY = "notification-preferences"

export const PERSISTENT_KEYS = [
    ACCESS_TOKENS_KEY,
    REGISTERED_CHARACTERS_KEY,
    DISMISSED_CALLOUTS_KEY,
    FRIENDS_KEY,
    IGNORES_KEY,
    BOOLEAN_FLAGS_KEY,
    LFM_SETTINGS_KEY,
    WHO_SETTINGS_KEY,
] as const

export type PersistentKey = (typeof PERSISTENT_KEYS)[number]

const PERSISTENT_KEY_SET: ReadonlySet<string> = new Set(PERSISTENT_KEYS)

export function isPersistentKey(key: string): key is PersistentKey {
    return PERSISTENT_KEY_SET.has(key)
}

function getPersistentDefaultValue(key: PersistentKey): unknown {
    switch (key) {
        case ACCESS_TOKENS_KEY:
        case REGISTERED_CHARACTERS_KEY:
        case DISMISSED_CALLOUTS_KEY:
        case FRIENDS_KEY:
        case IGNORES_KEY:
            return []
        case BOOLEAN_FLAGS_KEY:
        case LFM_SETTINGS_KEY:
        case WHO_SETTINGS_KEY:
            return {}
        default:
            return {}
    }
}

function normalizePersistentValue(key: PersistentKey, value: unknown): unknown {
    switch (key) {
        case ACCESS_TOKENS_KEY:
        case REGISTERED_CHARACTERS_KEY:
        case DISMISSED_CALLOUTS_KEY:
        case FRIENDS_KEY:
        case IGNORES_KEY:
            return Array.isArray(value) ? value : []
        case BOOLEAN_FLAGS_KEY:
        case LFM_SETTINGS_KEY:
        case WHO_SETTINGS_KEY:
            return value && typeof value === "object" && !Array.isArray(value)
                ? value
                : {}
        default:
            return getPersistentDefaultValue(key)
    }
}

export const BOOLEAN_FLAGS = {
    hideAlphaRelease: "hide-alpha-release",
    hide32BitServers: "hide-32bit-servers",
    bankToonsDisclaimer: "bank-toons-disclaimer",
    hideActivityDevelopmentNotice: "hide-activity-development-notice",
    hideSelfFromPartyList: "hide-self-from-party-list",
}

type LocalStorageWriteEvent = {
    key: string
    storageKey: string
    value: unknown
    updatedAt: string
}

type LocalStorageWriteListener = (event: LocalStorageWriteEvent) => void

const writeListeners = new Set<LocalStorageWriteListener>()

export function subscribeToLocalStorageWrites(
    listener: LocalStorageWriteListener
): () => void {
    writeListeners.add(listener)

    // unsubscriber
    return () => {
        writeListeners.delete(listener)
    }
}

function notifyLocalStorageWrite(event: LocalStorageWriteEvent): void {
    for (const listener of Array.from(writeListeners)) {
        try {
            listener(event)
        } catch (e) {
            logMessage("localStorage write listener failed", "warn", {
                metadata: {
                    key: event.key,
                    error: e instanceof Error ? e.message : String(e),
                },
            })
        }
    }
}

function getBooleanFlags(): Record<string, boolean> {
    const flags = getValue<Record<string, boolean>>(BOOLEAN_FLAGS_KEY)
    return flags || {}
}

function setBooleanFlag(key: string, value: boolean): void {
    const flags = getBooleanFlags()
    flags[key] = value
    setValue(BOOLEAN_FLAGS_KEY, flags)
}

function removeBooleanFlag(key: string): void {
    const flags = getBooleanFlags()
    delete flags[key]
    setValue(BOOLEAN_FLAGS_KEY, flags)
}

function getBooleanFlag(key: string): boolean | null {
    const flags = getBooleanFlags()
    return flags[key] ?? null
}

function clearBooleanFlags(): void {
    setValue(BOOLEAN_FLAGS_KEY, {})
}

// Lfm settings functions
function getLfmSettings(): any {
    return getData<any>(LFM_SETTINGS_KEY, {})
}

function setLfmSettings(settings: any): void {
    setData<any>(LFM_SETTINGS_KEY, settings)
}

// Who settings functions
function getWhoSettings(): any {
    return getData<any>(WHO_SETTINGS_KEY, {})
}

function setWhoSettings(settings: any): void {
    setData<any>(WHO_SETTINGS_KEY, settings)
}

// Access Token functions
function getAccessTokens(): AccessToken[] {
    return getData<AccessToken[]>(ACCESS_TOKENS_KEY, [])
}

function getAccessTokensMetadata(): LocalStorageEntry<AccessToken[]> {
    return getMetadata<AccessToken[]>(ACCESS_TOKENS_KEY, [])
}

function setAccessTokens(tokens: AccessToken[]): void {
    setData<AccessToken[]>(ACCESS_TOKENS_KEY, tokens)
}

function addAccessToken(token: AccessToken): void {
    addItem<AccessToken>(
        ACCESS_TOKENS_KEY,
        token,
        (a, b) => a.character_id === b.character_id
    )
}

function removeAccessToken(token: AccessToken): void {
    removeItem<AccessToken>(
        ACCESS_TOKENS_KEY,
        token,
        (a, b) => a.character_id === b.character_id
    )
}

// Registered Characters functions
function getRegisteredCharacters(): Character[] {
    return getData<Character[]>(REGISTERED_CHARACTERS_KEY, [])
}

function getRegisteredCharactersMetadata(): LocalStorageEntry<Character[]> {
    return getMetadata<Character[]>(REGISTERED_CHARACTERS_KEY, [])
}

function setRegisteredCharacters(characters: Character[]): void {
    setData<Character[]>(REGISTERED_CHARACTERS_KEY, characters)
}

function addRegisteredCharacter(character: Character): void {
    addItem<Character>(
        REGISTERED_CHARACTERS_KEY,
        character,
        (a, b) => a.id === b.id
    )
}

function removeRegisteredCharacter(character: Character): void {
    removeItem<Character>(
        REGISTERED_CHARACTERS_KEY,
        character,
        (a, b) => a.id === b.id
    )
}

// Raid timer settings functions
function getRaidTimerSettings(): RaidTimerStorage {
    return getData<RaidTimerStorage>(RAID_TIMER_SETTINGS_KEY, {})
}

function setRaidTimerSettings(settings: RaidTimerStorage): void {
    setData<RaidTimerStorage>(RAID_TIMER_SETTINGS_KEY, settings)
}

// Feature callouts functions
function getDismissedFeatureCallouts(): string[] {
    return getData<string[]>(DISMISSED_CALLOUTS_KEY, [])
}

function addDismissedFeatureCallout(callout: string): void {
    addItem<string>(DISMISSED_CALLOUTS_KEY, callout, (a, b) => a === b)
}

// Update dismissed functions
function setUpdateDismissed(timestamp: string): void {
    setData<string>(UPDATE_DISMISSED_KEY, timestamp)
}

function getUpdateDismissed(): string | null {
    return getData<string>(UPDATE_DISMISSED_KEY, null)
}

// Update shown functions
function setUpdateShown(timestamp: string): void {
    setData<string>(UPDATE_SHOWN_KEY, timestamp)
}

function getUpdateShown(): string | null {
    return getData<string>(UPDATE_SHOWN_KEY, null)
}

// Friends functions
function getFriends(): Character[] {
    return getData<Character[]>(FRIENDS_KEY, [])
}

function getFriendsMetadata(): LocalStorageEntry<Character[]> {
    return getMetadata<Character[]>(FRIENDS_KEY, [])
}

function setFriends(characters: Character[]): void {
    setData<Character[]>(FRIENDS_KEY, characters)
}

function addFriend(character: Character): void {
    addItem<Character>(FRIENDS_KEY, character, (a, b) => a.id === b.id)
}

function removeFriend(character: Character): void {
    removeItem<Character>(FRIENDS_KEY, character, (a, b) => a.id === b.id)
}

function getFriendIds(): number[] {
    const characters = getData<Character[]>(FRIENDS_KEY, [])
    return Array.isArray(characters)
        ? characters
              .map((c) => c.id)
              .filter((id): id is number => typeof id === "number")
        : []
}

// Ignores functions
function getIgnores(): Character[] {
    return getData<Character[]>(IGNORES_KEY, [])
}

function getIgnoresMetadata(): LocalStorageEntry<Character[]> {
    return getMetadata<Character[]>(IGNORES_KEY, [])
}

function setIgnores(characters: Character[]): void {
    setData<Character[]>(IGNORES_KEY, characters)
}

function addIgnore(character: Character): void {
    addItem<Character>(IGNORES_KEY, character, (a, b) => a.id === b.id)
}

function removeIgnore(character: Character): void {
    removeItem<Character>(IGNORES_KEY, character, (a, b) => a.id === b.id)
}

function getIgnoreIds(): number[] {
    const characters = getData<Character[]>(IGNORES_KEY, [])
    return Array.isArray(characters)
        ? characters
              .map((c) => c.id)
              .filter((id): id is number => typeof id === "number")
        : []
}

function getRegisteredCharacterIds(): number[] {
    const characters = getData<Character[]>(REGISTERED_CHARACTERS_KEY, [])
    return Array.isArray(characters)
        ? characters
              .map((c) => c.id)
              .filter((id): id is number => typeof id === "number")
        : []
}

// Areas functions
function getAreas(): LocalStorageEntry<Area[]> {
    return getMetadata<Area[]>(CACHED_AREAS_KEY, [])
}

function setAreas(areas: Area[]): void {
    setData<Area[]>(CACHED_AREAS_KEY, areas)
}

// Quests functions
function getQuests(): LocalStorageEntry<Quest[]> {
    return getMetadata<Quest[]>(CACHED_QUEST_KEY, [])
}

function setQuests(quests: Quest[]): void {
    setData<Quest[]>(CACHED_QUEST_KEY, quests)
}

// Timezone functions
function getTimezone(): string | null {
    return getData<string>(TIMEZONE_KEY, null)
}

function setTimezone(timezone: string): void {
    setData<string>(TIMEZONE_KEY, timezone)
}

// Tracked character IDs functions
function getTrackedCharacterIds(): number[] {
    const settings = getData<any>(LFM_SETTINGS_KEY, {})
    return settings?.trackedCharacterIds || []
}

function setTrackedCharacterIds(ids: number[]): void {
    const settings = getData<any>(LFM_SETTINGS_KEY, {})
    settings.trackedCharacterIds = ids
    setData<any>(LFM_SETTINGS_KEY, settings)
}

// Notification preferences functions
function getNotificationPreferences(): NotificationPreferences {
    return getData<NotificationPreferences>(NOTIFICATION_PREFERENCES_KEY, {})
}

function setNotificationPreferences(
    preferences: NotificationPreferences
): void {
    setData<NotificationPreferences>(NOTIFICATION_PREFERENCES_KEY, preferences)
}

// Persistent settings functions
function getPersistentDataByKeys(keys: readonly string[]): Record<string, any> {
    const result: Record<string, any> = {}
    for (const key of keys) {
        if (isPersistentKey(key)) {
            // For character list keys, upload IDs only — not full Character objects
            if (
                key === FRIENDS_KEY ||
                key === IGNORES_KEY ||
                key === REGISTERED_CHARACTERS_KEY
            ) {
                if (key === FRIENDS_KEY) result[key] = getFriendIds()
                else if (key === IGNORES_KEY) result[key] = getIgnoreIds()
                else result[key] = getRegisteredCharacterIds()
            } else {
                const fallback = getPersistentDefaultValue(key)
                const value = getData<any>(key, fallback)
                result[key] = normalizePersistentValue(key, value)
            }
        }
    }
    return result
}

function setPersistentData(data: Record<string, any>): void {
    for (const key in data) {
        if (isPersistentKey(key)) {
            const normalizedValue = normalizePersistentValue(key, data[key])
            if (normalizedValue !== data[key]) {
                console.warn(
                    `Coercing invalid persistent value for key "${key}" to a safe default.`,
                    data[key]
                )
            }
            setData<any>(key, normalizedValue)
        } else {
            console.warn(
                `Attempted to set non-persistent key "${key}" with value:`,
                data[key]
            )
        }
    }
}

// Generic functions
function isJsonEqual(a: unknown, b: unknown): boolean {
    try {
        return JSON.stringify(a) === JSON.stringify(b)
    } catch {
        return false
    }
}

function getMetadata<T>(key: string, fallback?: any): LocalStorageEntry<T> {
    const metadata = getValue<LocalStorageEntry<T>>(key)
    if (!metadata) {
        return {
            createdAt: "",
            updatedAt: "",
            data: fallback || null,
        }
    }
    return metadata
}

function getData<T>(key: string, fallback?: any): T {
    return getMetadata<T>(key, fallback).data || fallback || null
}

function setData<T>(key: string, data: T): void {
    const metadata = getMetadata<T>(key)
    if (isJsonEqual(metadata.data, data)) return
    const newEntry: LocalStorageEntry<T> = {
        createdAt: metadata.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: data,
    }
    setValue(key, newEntry)
}

function addItem<T>(
    key: string,
    item: T,
    compareFn: (a: T, b: T) => boolean
): void {
    const metadata = getMetadata<T>(key, [])
    const items = metadata.data || []
    if (!Array.isArray(items)) {
        throw new Error(`Data for key "${key}" is not an array`)
    }
    if (items.some((existing) => compareFn(existing, item))) {
        return
    }
    items.push(item)
    const newEntry: LocalStorageEntry<T[]> = {
        createdAt: metadata.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: items,
    }
    setValue(key, newEntry)
}

function removeItem<T>(
    key: string,
    item: T,
    compareFn: (a: T, b: T) => boolean
): void {
    const metadata = getMetadata<T>(key, [])
    const items = metadata.data || []
    if (!Array.isArray(items)) {
        throw new Error(`Data for key "${key}" is not an array`)
    }
    if (!items.some((existing) => compareFn(existing, item))) {
        return
    }
    const newItems = items.filter((existing) => !compareFn(existing, item))
    const newEntry: LocalStorageEntry<T[]> = {
        createdAt: metadata.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: newItems,
    }
    setValue(key, newEntry)
}

function getValue<T>(key: string): T | null {
    try {
        const storageValue = localStorage.getItem(VERSION_PREFIX + key)
        if (!storageValue) {
            return null
        }
        return JSON.parse(storageValue) as T
    } catch (e) {
        logMessage(
            `Failed to parse localStorage value for key "${VERSION_PREFIX + key}"`,
            "error",
            {
                metadata: {
                    key: VERSION_PREFIX + key,
                    error: e instanceof Error ? e.message : String(e),
                },
            }
        )
        console.error(
            `Error parsing localStorage value for key "${VERSION_PREFIX + key}":`,
            e
        )
        return null
    }
}

function setValue<T>(key: string, value: T): void {
    const storageKey = VERSION_PREFIX + key
    try {
        const next = JSON.stringify(value)
        const prev = localStorage.getItem(storageKey)
        if (prev === next) return
        localStorage.setItem(storageKey, JSON.stringify(value))
        notifyLocalStorageWrite({
            key,
            storageKey,
            value,
            updatedAt: new Date().toISOString(),
        })
    } catch (e) {
        logMessage(
            `Failed to set localStorage value for key "${storageKey}"`,
            "error",
            {
                metadata: {
                    key: storageKey,
                    error: e instanceof Error ? e.message : String(e),
                },
            }
        )
        console.error(
            `Error setting localStorage value for key "${storageKey}":`,
            e
        )
    }
}

export {
    getAccessTokens,
    getAccessTokensMetadata,
    setAccessTokens,
    addAccessToken,
    removeAccessToken,
    getRegisteredCharacters,
    getRegisteredCharactersMetadata,
    setRegisteredCharacters,
    addRegisteredCharacter,
    removeRegisteredCharacter,
    getDismissedFeatureCallouts,
    addDismissedFeatureCallout,
    getFriends,
    getFriendsMetadata,
    addFriend,
    removeFriend,
    setFriends,
    getIgnores,
    getIgnoresMetadata,
    addIgnore,
    removeIgnore,
    setIgnores,
    getFriendIds,
    getIgnoreIds,
    getRegisteredCharacterIds,
    getAreas,
    setAreas,
    getQuests,
    setQuests,
    getBooleanFlags,
    setBooleanFlag,
    removeBooleanFlag,
    getBooleanFlag,
    clearBooleanFlags,
    addItem,
    removeItem,
    getLfmSettings,
    setLfmSettings,
    getWhoSettings,
    setWhoSettings,
    getRaidTimerSettings,
    setRaidTimerSettings,
    getTimezone,
    setTimezone,
    getTrackedCharacterIds,
    setTrackedCharacterIds,
    getUpdateDismissed,
    setUpdateDismissed,
    getUpdateShown,
    setUpdateShown,
    getNotificationPreferences,
    setNotificationPreferences,
    getPersistentDataByKeys,
    setPersistentData,
}
