import { useState, useEffect, useCallback } from "react"
import {
    getAccessTokens as getAccessTokensFromLocalStorage,
    getRegisteredCharactersMetadata as getRegisteredCharactersMetadataFromLocalStorage,
    setRegisteredCharacters as setRegisteredCharactersInLocalStorage,
    removeRegisteredCharacter as removeRegisteredCharacterFromLocalStorage,
    removeAccessToken as removeAccessTokenFromLocalStorage,
} from "../utils/localStorage.ts"
import { getCharactersByIds } from "../services/characterService.ts"
import { Character } from "../models/Character.ts"
import { AccessToken } from "../models/Verification.ts"
import { CACHED_CHARACTER_EXPIRY_TIME } from "../constants/client.ts"

interface Props {
    enabled?: boolean
}

const useGetRegisteredCharacters = ({ enabled = true }: Props = {}) => {
    const [registeredCharacters, setRegisteredCharacters] = useState<
        Character[] | undefined
    >(undefined)
    const [registeredCharactersCached, setRegisteredCharactersCached] =
        useState<Character[] | undefined>(undefined)
    const [accessTokens, setAccessTokens] = useState<AccessToken[] | undefined>(
        undefined
    )
    const [verifiedCharacters, setVerifiedCharacters] = useState<
        Character[] | undefined
    >(undefined)
    const [verifiedCharactersCached, setVerifiedCharactersCached] = useState<
        Character[] | undefined
    >(undefined)
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)
    const [lastReload, setLastReload] = useState<Date>(new Date())

    const reload = useCallback(() => {
        setIsLoaded(false)
        setLastReload(new Date())
        const registeredCharactersMetadata =
            getRegisteredCharactersMetadataFromLocalStorage()
        if (
            !registeredCharactersMetadata ||
            registeredCharactersMetadata.data?.length === 0
        ) {
            setRegisteredCharacters([])
            setIsLoaded(true)
            return
        }
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
        const characterIds = registeredCharactersMetadata.data.map(
            (character: Character) => character.id
        )
        getCharactersByIds(characterIds)
            .then((response) => {
                const characters: Character[] = Object.values(response.data?.data || {})
                setRegisteredCharacters(characters)
                setIsLoaded(true)

                const verifiedCharacters = characters.filter((character) =>
                    accessTokens.some(
                        (token) => token.character_id === character.id
                    )
                )
                setVerifiedCharacters(verifiedCharacters)

                // update cached data if it's older than CACHED_CHARACTER_EXPIRY_TIME
                const lastUpdated = new Date(
                    registeredCharactersMetadata.updatedAt
                )
                if (
                    new Date().getTime() - lastUpdated.getTime() >
                    CACHED_CHARACTER_EXPIRY_TIME
                ) {
                    setRegisteredCharactersInLocalStorage(characters)
                }
                setIsError(false)
            })
            .catch(() => {
                setIsError(true)
            })
    }, [])

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
        if (enabled) reload()
    }, [reload, enabled])

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
        lastReload
    }
}

export default useGetRegisteredCharacters
