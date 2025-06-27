import { AccessToken } from "../models/Verification.ts"
import { Character } from "../models/Character.ts"
import { LocalStorageEntry } from "../models/LocalStorage.ts"
import { Area } from "../models/Area.ts"
import { Quest } from "../models/Lfm.ts"

function getAccessTokens(): AccessToken[] {
    // try {
    //     const storageValue = localStorage.getItem("access-tokens")
    //     if (!storageValue) {
    //         return []
    //     }
    //     const entry: LocalStorageEntry<AccessToken[]> = JSON.parse(storageValue)
    //     return entry.data
    // } catch (e) {
    //     console.error(e)
    //     return []
    // }
    
    // TODO: Can't I just do this?
    try {
        const accessTokens = getValue<LocalStorageEntry<AccessToken[]>>("access-tokens")
        return accessTokens?.data || []
    } catch (e) {
        console.error(e)
        return []
    }
}

function getAccessTokensMetadata(): LocalStorageEntry<AccessToken[]> {
    try {
        const storageValue = localStorage.getItem("access-tokens")
        if (!storageValue) {
            return {
                createdAt: "",
                updatedAt: "",
                data: [],
            }
        }
        const result = JSON.parse(storageValue)
        return {
            createdAt: result.createdAt || "",
            updatedAt: result.updatedAt || "",
            data: result.data || [],
        }
    } catch (e) {
        console.error(e)
        return {
            createdAt: "",
            updatedAt: "",
            data: [],
        }
    }
}

function setAccessTokens(tokens: AccessToken[]): void {
    try {
        const previousEntry: LocalStorageEntry<AccessToken[]> = JSON.parse(
            localStorage.getItem("access-tokens") || "{}"
        )
        const entry: LocalStorageEntry<AccessToken[]> = {
            createdAt: previousEntry.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: tokens,
        }
        localStorage.setItem("access-tokens", JSON.stringify(entry))
    } catch (e) {
        console.error(e)
    }
}

function addAccessToken(token: AccessToken): void {
    try {
        const previousEntry: LocalStorageEntry<AccessToken[]> = JSON.parse(
            localStorage.getItem("access-tokens") || "{}"
        )
        const tokens = getAccessTokens()
        tokens.push(token)
        const entry: LocalStorageEntry<AccessToken[]> = {
            createdAt: previousEntry.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: tokens,
        }
        localStorage.setItem("access-tokens", JSON.stringify(entry))
    } catch (e) {
        console.error(e)
    }
}

function removeAccessToken(token: AccessToken): void {
    try {
        const previousEntry: LocalStorageEntry<AccessToken[]> = JSON.parse(
            localStorage.getItem("access-tokens") || "{}"
        )
        const tokens = getAccessTokens()
        const newTokens = tokens.filter(
            (currentToken: AccessToken) =>
                currentToken.character_id !== token.character_id
        )
        const entry: LocalStorageEntry<AccessToken[]> = {
            createdAt: previousEntry.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: newTokens,
        }
        localStorage.setItem("access-tokens", JSON.stringify(entry))
    } catch (e) {
        console.error(e)
    }
}

function getRegisteredCharacters(): Character[] {
    try {
        const storageValue = localStorage.getItem("registered-characters")
        if (!storageValue) {
            return []
        }
        const entry: LocalStorageEntry<Character[]> = JSON.parse(storageValue)
        return entry.data
    } catch (e) {
        console.error(e)
        return []
    }
}

function getRegisteredCharactersMetadata(): LocalStorageEntry<Character[]> {
    try {
        const storageValue = localStorage.getItem("registered-characters")
        if (!storageValue) {
            return {
                createdAt: "",
                updatedAt: "",
                data: [],
            }
        }
        const result = JSON.parse(storageValue)
        return {
            createdAt: result.createdAt || "",
            updatedAt: result.updatedAt || "",
            data: result.data || [],
        }
    } catch (e) {
        console.error(e)
        return {
            createdAt: "",
            updatedAt: "",
            data: [],
        }
    }
}

function setRegisteredCharacters(characters: Character[]): void {
    try {
        const previousEntry: LocalStorageEntry<Character[]> = JSON.parse(
            localStorage.getItem("registered-characters") || "{}"
        )
        const entry: LocalStorageEntry<Character[]> = {
            createdAt: previousEntry.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: characters,
        }
        localStorage.setItem("registered-characters", JSON.stringify(entry))
    } catch (e) {
        console.error(e)
    }
}

function addRegisteredCharacter(character: Character): void {
    try {
        const previousEntry: LocalStorageEntry<Character[]> = JSON.parse(
            localStorage.getItem("registered-characters") || "{}"
        )
        const characters = getRegisteredCharacters()
        characters.push(character)
        const entry: LocalStorageEntry<Character[]> = {
            createdAt: previousEntry.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: characters,
        }
        localStorage.setItem("registered-characters", JSON.stringify(entry))
    } catch (e) {
        console.error(e)
    }
}

function removeRegisteredCharacter(character: Character): void {
    try {
        const previousEntry: LocalStorageEntry<Character[]> = JSON.parse(
            localStorage.getItem("registered-characters") || "{}"
        )
        const characters = getRegisteredCharacters()
        const newCharacters = characters.filter(
            (currentCharacter: Character) =>
                currentCharacter.id !== character.id
        )
        const entry: LocalStorageEntry<Character[]> = {
            createdAt: previousEntry.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: newCharacters,
        }
        localStorage.setItem("registered-characters", JSON.stringify(entry))
    } catch (e) {
        console.error(e)
    }
}

function getFriends(): Character[] {
    try {
        const storageValue = localStorage.getItem("friends")
        if (!storageValue) {
            return []
        }
        const entry: LocalStorageEntry<Character[]> = JSON.parse(storageValue)
        return entry.data
    } catch (e) {
        console.error(e)
        return []
    }
}

function getFriendsMetadata(): LocalStorageEntry<Character[]> {
    try {
        const storageValue = localStorage.getItem("friends")
        if (!storageValue) {
            return {
                createdAt: "",
                updatedAt: "",
                data: [],
            }
        }
        const result = JSON.parse(storageValue)
        return {
            createdAt: result.createdAt || "",
            updatedAt: result.updatedAt || "",
            data: result.data || [],
        }
    } catch (e) {
        console.error(e)
        return {
            createdAt: "",
            updatedAt: "",
            data: [],
        }
    }
}

function setFriends(characters: Character[]): void {
    try {
        const previousEntry: LocalStorageEntry<Character[]> = JSON.parse(
            localStorage.getItem("friends") || "{}"
        )
        const entry: LocalStorageEntry<Character[]> = {
            createdAt: previousEntry.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: characters,
        }
        localStorage.setItem("friends", JSON.stringify(entry))
    } catch (e) {
        console.error(e)
    }
}

function addFriend(character: Character): void {
    try {
        const previousEntry: LocalStorageEntry<Character[]> = JSON.parse(
            localStorage.getItem("friends") || "{}"
        )
        const characters = getFriends()
        characters.push(character)
        const entry: LocalStorageEntry<Character[]> = {
            createdAt: previousEntry.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: characters,
        }
        localStorage.setItem("friends", JSON.stringify(entry))
    } catch (e) {
        console.error(e)
    }
}

function removeFriend(character: Character): void {
    try {
        const previousEntry: LocalStorageEntry<Character[]> = JSON.parse(
            localStorage.getItem("friends") || "{}"
        )
        const characters = getFriends()
        const newCharacters = characters.filter(
            (currentCharacter: Character) =>
                currentCharacter.id !== character.id
        )
        const entry: LocalStorageEntry<Character[]> = {
            createdAt: previousEntry.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: newCharacters,
        }
        localStorage.setItem("friends", JSON.stringify(entry))
    } catch (e) {
        console.error(e)
    }
}

function getAreas(): LocalStorageEntry<Area[]> {
    try {
        const storageValue = localStorage.getItem("cached-areas")
        if (!storageValue) {
            return {
                createdAt: "",
                updatedAt: "",
                data: [],
            }
        }
        const result = JSON.parse(storageValue)
        return {
            createdAt: result.createdAt || "",
            updatedAt: result.updatedAt || "",
            data: result.data || [],
        }
    } catch (e) {
        console.error(e)
        return {
            createdAt: "",
            updatedAt: "",
            data: [],
        }
    }
}

function setAreas(areas: Area[]): void {
    try {
        const previousEntry: LocalStorageEntry<Area[]> = JSON.parse(
            localStorage.getItem("cached-areas") || "{}"
        )
        const entry: LocalStorageEntry<Area[]> = {
            createdAt: previousEntry.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: areas,
        }
        localStorage.setItem("cached-areas", JSON.stringify(entry))
    } catch (e) {
        console.error(e)
    }
}

function getQuests(): LocalStorageEntry<Quest[]> {
    try {
        const storageValue = localStorage.getItem("cached-quests")
        if (!storageValue) {
            return {
                createdAt: "",
                updatedAt: "",
                data: [],
            }
        }
        const result = JSON.parse(storageValue)
        return {
            createdAt: result.createdAt || "",
            updatedAt: result.updatedAt || "",
            data: result.data || [],
        }
    } catch (e) {
        console.error(e)
        return {
            createdAt: "",
            updatedAt: "",
            data: [],
        }
    }
}

function setQuests(quests: Quest[]): void {
    try {
        const previousEntry: LocalStorageEntry<Quest[]> = JSON.parse(
            localStorage.getItem("cached-quests") || "{}"
        )
        const entry: LocalStorageEntry<Quest[]> = {
            createdAt: previousEntry.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: quests,
        }
        localStorage.setItem("cached-quests", JSON.stringify(entry))
    } catch (e) {
        console.error(e)
    }
}

function getValue<T>(key: string): T | null {
    try {
        const storageValue = localStorage.getItem(key)
        if (!storageValue) {
            return null
        }
        return JSON.parse(storageValue) as T
    } catch (e) {
        throw new Error(`Failed to get value for key "${key}": ${e} - Value: ${localStorage.getItem(key)}`)
    }
}

function setValue<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
        console.error(e)
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
    getValue,
    setValue,
    getAreas,
    setAreas,
    getQuests,
    setQuests,
}
