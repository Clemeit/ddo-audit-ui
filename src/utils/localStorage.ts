import { AccessToken } from "../models/Verification.ts"
import { Character } from "../models/Character.ts"
import { LocalStorageEntry } from "../models/LocalStorage.ts"
import { Area } from "../models/Area.ts"
import { Quest } from "../models/Lfm.ts"

const ACCESS_TOKENS_KEY = "access-tokens"
const REGISTERED_CHARACTERS_KEY = "registered-characters"
const FRIENDS_KEY = "friends"
const IGNORES_KEY = "ignores"
const CACHED_AREAS_KEY = "cached-areas"
const CACHED_QUEST_KEY = "cached-quests"

// Access Token functions
function getAccessTokens(): AccessToken[] {
    return getData<AccessToken>(ACCESS_TOKENS_KEY)
}

function getAccessTokensMetadata(): LocalStorageEntry<AccessToken[]> {
    return getMetadata<AccessToken>(ACCESS_TOKENS_KEY)
}

function setAccessTokens(tokens: AccessToken[]): void {
    setData<AccessToken>(ACCESS_TOKENS_KEY, tokens)
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
    return getData<Character>(REGISTERED_CHARACTERS_KEY)
}

function getRegisteredCharactersMetadata(): LocalStorageEntry<Character[]> {
    return getMetadata<Character>(REGISTERED_CHARACTERS_KEY)
}

function setRegisteredCharacters(characters: Character[]): void {
    setData<Character>(REGISTERED_CHARACTERS_KEY, characters)
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

// Friends functions
function getFriends(): Character[] {
    return getData<Character>(FRIENDS_KEY)
}

function getFriendsMetadata(): LocalStorageEntry<Character[]> {
    return getMetadata<Character>(FRIENDS_KEY)
}

function setFriends(characters: Character[]): void {
    setData<Character>(FRIENDS_KEY, characters)
}

function addFriend(character: Character): void {
    addItem<Character>(FRIENDS_KEY, character, (a, b) => a.id === b.id)
}

function removeFriend(character: Character): void {
    removeItem<Character>(FRIENDS_KEY, character, (a, b) => a.id === b.id)
}

// Ignores functions
function getIgnores(): Character[] {
    return getData<Character>(IGNORES_KEY)
}

function getIgnoresMetadata(): LocalStorageEntry<Character[]> {
    return getMetadata<Character>(IGNORES_KEY)
}

function setIgnores(characters: Character[]): void {
    setData<Character>(IGNORES_KEY, characters)
}

function addIgnore(character: Character): void {
    addItem<Character>(IGNORES_KEY, character, (a, b) => a.id === b.id)
}

function removeIgnore(character: Character): void {
    removeItem<Character>(IGNORES_KEY, character, (a, b) => a.id === b.id)
}

// Areas functions
function getAreas(): LocalStorageEntry<Area[]> {
    return getMetadata<Area>(CACHED_AREAS_KEY)
}

function setAreas(areas: Area[]): void {
    setData<Area>(CACHED_AREAS_KEY, areas)
}

// Quests functions
function getQuests(): LocalStorageEntry<Quest[]> {
    return getMetadata<Quest>(CACHED_QUEST_KEY)
}

function setQuests(quests: Quest[]): void {
    setData<Quest>(CACHED_QUEST_KEY, quests)
}

// Generic functions
function getMetadata<T>(key: string): LocalStorageEntry<T[]> {
    const metadata = getValue<LocalStorageEntry<T[]>>(key)
    if (!metadata) {
        return {
            createdAt: "",
            updatedAt: "",
            data: [],
        }
    }
    return metadata
}

function getData<T>(key: string): T[] {
    return getMetadata<T>(key).data || []
}

function setData<T>(key: string, data: T[]): void {
    const metadata = getMetadata<T>(key)
    const newEntry: LocalStorageEntry<T[]> = {
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
    const metadata = getMetadata<T>(key)
    const items = metadata.data || []
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
    const metadata = getMetadata<T>(key)
    const items = metadata.data || []
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
        const storageValue = localStorage.getItem(key)
        if (!storageValue) {
            return null
        }
        return JSON.parse(storageValue) as T
    } catch (e) {
        console.error(`Error parsing localStorage value for key "${key}":`, e)
        return null
    }
}

function setValue<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
        console.error(`Error setting localStorage value for key "${key}":`, e)
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
    getValue,
    setValue,
    getAreas,
    setAreas,
    getQuests,
    setQuests,
}
