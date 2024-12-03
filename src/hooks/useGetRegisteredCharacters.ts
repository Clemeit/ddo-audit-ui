import { useState, useEffect } from "react"
import {
    getAccessTokens as getAccessTokensFromLocalStorage,
    getRegisteredCharactersMetadata as getRegisteredCharactersMetadataFromLocalStorage,
    setRegisteredCharacters as setRegisteredCharactersInLocalStorage,
    removeRegisteredCharacter as removeRegisteredCharacterFromLocalStorage,
    removeAccessToken as removeAccessTokenFromLocalStorage,
} from "../utils/localStorage.ts"
import { getCharacterById } from "../services/characterService.ts"
import { Character } from "../models/Character.ts"
import { AccessToken } from "../models/Verification.ts"

const useGetRegisteredCharacters = () => {
    const [registeredCharacters, setRegisteredCharacters] = useState<
        Character[] | null
    >(null)
    const [registeredCharactersCached, setRegisteredCharactersCached] =
        useState<Character[] | null>(null)
    const [accessTokens, setAccessTokens] = useState<AccessToken[]>([])
    const [verifiedCharacters, setVerifiedCharacters] = useState<Character[]>(
        []
    )
    const [verifiedCharactersCached, setVerifiedCharactersCached] = useState<
        Character[]
    >([])
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)

    function reload() {
        setIsLoaded(false)
        const registeredCharactersMetadata =
            getRegisteredCharactersMetadataFromLocalStorage()
        const accessTokens = getAccessTokensFromLocalStorage()

        setRegisteredCharactersCached(registeredCharactersMetadata.data)
        setAccessTokens(accessTokens)

        const verifiedCharactersCached =
            registeredCharactersMetadata.data.filter((character: Character) =>
                accessTokens.some(
                    (token) => token.character_id === character.id
                )
            )
        setVerifiedCharactersCached(verifiedCharactersCached)

        // for every ID, look up the character data and add it to the list
        const promises = registeredCharactersMetadata.data.map(
            (character: Character) => getCharacterById(character.id)
        )
        Promise.all(promises)
            .then((responses) => {
                const characters = responses
                    .map((response) => response.data.data)
                    .filter((character) => character)
                setRegisteredCharacters(characters)
                setIsLoaded(true)

                const verifiedCharacters = characters.filter((character) =>
                    accessTokens.some(
                        (token) => token.character_id === character.id
                    )
                )
                setVerifiedCharacters(verifiedCharacters)

                // update cached data if it's older than an hour
                const lastUpdated = new Date(
                    registeredCharactersMetadata.updatedAt
                )
                if (
                    new Date().getTime() - lastUpdated.getTime() >
                    1000 * 60 * 60
                ) {
                    setRegisteredCharactersInLocalStorage(characters)
                }
            })
            .catch(() => {
                setIsError(true)
            })
    }

    function unregisterCharacter(character: Character) {
        // revoke the access token for this character
        const accessTokens = getAccessTokensFromLocalStorage()
        const token = accessTokens.find(
            (token) => token.character_id === character.id
        )
        if (token) removeAccessTokenFromLocalStorage(token)

        // unregister the character
        removeRegisteredCharacterFromLocalStorage(character)

        reload()
    }

    useEffect(() => {
        reload()
    }, [])

    return {
        registeredCharacters:
            registeredCharacters || registeredCharactersCached || [],
        verifiedCharacters:
            verifiedCharacters || verifiedCharactersCached || [],
        accessTokens,
        isLoaded,
        isError,
        reload,
        unregisterCharacter,
    }
}

export default useGetRegisteredCharacters
