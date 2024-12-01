import { AccessToken } from "../models/Verification.ts"
import { Character } from "../models/Character.ts"
import { getCharacterById } from "../services/characterService.ts"
import { LocalStorageEntry } from "../models/LocalStorage.ts"

function getAccessTokens(): AccessToken[] {
    try {
        const storageValue = localStorage.getItem("access-tokens")
        if (!storageValue) {
            return []
        }
        const entry: LocalStorageEntry = JSON.parse(storageValue)
        return entry.data
    } catch (e) {
        console.error(e)
        return []
    }
}

function setAccessTokens(tokens: AccessToken[]): void {
    try {
        const previousEntry: LocalStorageEntry = JSON.parse(
            localStorage.getItem("access-tokens") || "{}"
        )
        const entry: LocalStorageEntry = {
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
        const previousEntry: LocalStorageEntry = JSON.parse(
            localStorage.getItem("access-tokens") || "{}"
        )
        const tokens = getAccessTokens()
        tokens.push(token)
        const entry: LocalStorageEntry = {
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
        const previousEntry: LocalStorageEntry = JSON.parse(
            localStorage.getItem("access-tokens") || "{}"
        )
        const tokens = getAccessTokens()
        const newTokens = tokens.filter(
            (currentToken: AccessToken) =>
                currentToken.character_id !== token.character_id
        )
        const entry: LocalStorageEntry = {
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
        const entry: LocalStorageEntry = JSON.parse(storageValue)
        return entry.data
    } catch (e) {
        console.error(e)
        return []
    }
}

function setRegisteredCharacters(characters: Character[]): void {
    try {
        const previousEntry: LocalStorageEntry = JSON.parse(
            localStorage.getItem("registered-characters") || "{}"
        )
        const entry: LocalStorageEntry = {
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
        const previousEntry: LocalStorageEntry = JSON.parse(
            localStorage.getItem("registered-characters") || "{}"
        )
        const characters = getRegisteredCharacters()
        characters.push(character)
        const entry: LocalStorageEntry = {
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
        const previousEntry: LocalStorageEntry = JSON.parse(
            localStorage.getItem("registered-characters") || "{}"
        )
        const characters = getRegisteredCharacters()
        const newCharacters = characters.filter(
            (currentCharacter: Character) =>
                currentCharacter.id !== character.id
        )
        const entry: LocalStorageEntry = {
            createdAt: previousEntry.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            data: newCharacters,
        }
        localStorage.setItem("registered-characters", JSON.stringify(entry))
    } catch (e) {
        console.error(e)
    }
}

function updateRegisteredCharacters(): void {
    const characters = getRegisteredCharacters()
    const promises = characters.map((character: Character) =>
        getCharacterById(character.id)
    )
    Promise.all(promises).then((responses) => {
        const characters = responses
            .map((response: { data: { data: any } }) => response.data.data)
            .filter((character: Character) => character)
        setRegisteredCharacters(characters)
    })
}

export {
    getAccessTokens,
    setAccessTokens,
    addAccessToken,
    removeAccessToken,
    getRegisteredCharacters,
    setRegisteredCharacters,
    addRegisteredCharacter,
    removeRegisteredCharacter,
    updateRegisteredCharacters,
}
