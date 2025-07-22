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
    // TODO: when on a specific server, only load characters from that server
    const [registeredCharacters, setRegisteredCharacters] = useState<
        Character[]
    >([])
    const [registeredCharactersCached, setRegisteredCharactersCached] =
        useState<Character[]>([])
    const [accessTokens, setAccessTokens] = useState<AccessToken[]>([])
    const [verifiedCharacters, setVerifiedCharacters] = useState<Character[]>(
        []
    )
    const [verifiedCharactersCached, setVerifiedCharactersCached] = useState<
        Character[]
    >([])
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
            setRegisteredCharactersCached([])
            setRegisteredCharacters([])
            setVerifiedCharactersCached([])
            setVerifiedCharacters([])
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
                const characters = Object.values(response.data || {})
                setRegisteredCharacters(characters)
                setIsLoaded(true)

                const verifiedCharacters = characters.filter((character) =>
                    accessTokens.some(
                        (token) => token.character_id === character.id
                    )
                )
                setVerifiedCharacters(verifiedCharacters)
                setRegisteredCharactersInLocalStorage(characters)
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

    const publishedRegisteredCharacters = (): Character[] => {
        if (
            registeredCharacters.length === 0 &&
            registeredCharactersCached.length !== 0
        ) {
            return registeredCharactersCached
        }
        return registeredCharacters
    }

    const publishedVerifiedCharacters = (): Character[] => {
        if (
            verifiedCharacters.length === 0 &&
            verifiedCharactersCached.length !== 0
        ) {
            return verifiedCharactersCached
        }
        return verifiedCharacters
    }

    return {
        registeredCharacters: publishedRegisteredCharacters(),
        verifiedCharacters: publishedVerifiedCharacters(),
        accessTokens,
        isLoaded,
        isError,
        reload,
        unregisterCharacter,
        lastReload,
    }
}

export default useGetRegisteredCharacters
