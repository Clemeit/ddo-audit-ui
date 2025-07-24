import { useState, useEffect, useCallback, useRef } from "react"
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
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [lastReload, setLastReload] = useState<Date>(new Date())
    const abortControllerRef = useRef<AbortController | null>(null)

    const reload = useCallback(async () => {
        // Cancel any existing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        setIsLoaded(false)
        setIsError(false)
        setErrorMessage("")
        setLastReload(new Date())

        try {
            const registeredCharactersMetadata =
                getRegisteredCharactersMetadataFromLocalStorage()

            // Validate metadata structure
            if (
                !registeredCharactersMetadata ||
                !registeredCharactersMetadata.data ||
                !Array.isArray(registeredCharactersMetadata.data) ||
                registeredCharactersMetadata.data.length === 0
            ) {
                setRegisteredCharactersCached([])
                setRegisteredCharacters([])
                setVerifiedCharactersCached([])
                setVerifiedCharacters([])
                setAccessTokens([])
                setIsLoaded(true)
                return
            }

            const accessTokens = getAccessTokensFromLocalStorage()

            // Validate access tokens
            const validAccessTokens = Array.isArray(accessTokens)
                ? accessTokens
                : []

            setRegisteredCharactersCached(registeredCharactersMetadata.data)
            setAccessTokens(validAccessTokens)

            const verifiedCharactersCached =
                registeredCharactersMetadata.data?.filter(
                    (character: Character) =>
                        character?.id &&
                        validAccessTokens.some(
                            (token) => token?.character_id === character.id
                        )
                ) || []
            setVerifiedCharactersCached(verifiedCharactersCached)

            // Extract and validate character IDs
            const characterIds = registeredCharactersMetadata.data
                ?.map((character: Character) => character?.id)
                ?.filter((id): id is number => typeof id === "number" && id > 0)

            if (!characterIds || characterIds.length === 0) {
                setIsLoaded(true)
                return
            }

            // Create new abort controller for this request
            abortControllerRef.current = new AbortController()

            try {
                const characterIdsResponse = await getCharactersByIds(
                    characterIds,
                    {
                        signal: abortControllerRef.current.signal,
                    }
                )

                if (
                    !characterIdsResponse?.data ||
                    typeof characterIdsResponse.data !== "object"
                ) {
                    throw new Error("Invalid API response structure")
                }

                const characters = Object.values(
                    characterIdsResponse.data || {}
                ).filter(
                    (character): character is Character =>
                        character != null &&
                        typeof character === "object" &&
                        typeof character.id === "number"
                )

                setRegisteredCharacters(characters)
                setIsLoaded(true)

                const verifiedCharacters = characters.filter((character) =>
                    validAccessTokens.some(
                        (token) => token?.character_id === character.id
                    )
                )
                setVerifiedCharacters(verifiedCharacters)

                // Safe localStorage operation
                try {
                    setRegisteredCharactersInLocalStorage(characters)
                } catch (localStorageError) {
                    console.warn(
                        "Failed to save characters to localStorage:",
                        localStorageError
                    )
                    // Don't fail the entire operation for localStorage issues
                }

                setIsError(false)
                setErrorMessage("")
            } catch (error) {
                // Don't set error state if the request was aborted
                if (error?.name === "AbortError") {
                    return
                }

                console.error("Failed to fetch characters:", error)
                setIsError(true)
                setErrorMessage(
                    error?.message || "Failed to fetch character data"
                )
                setIsLoaded(true)
            }
        } catch (localStorageError) {
            console.error("Failed to access localStorage:", localStorageError)
            setIsError(true)
            setErrorMessage("Failed to access stored character data")
            setIsLoaded(true)
        }
    }, [])

    function unregisterCharacter(character: Character) {
        if (!character?.id) {
            console.warn("Cannot unregister character: invalid character data")
            return
        }

        try {
            // revoke the access token for this character
            const accessTokens = getAccessTokensFromLocalStorage()
            const validAccessTokens = Array.isArray(accessTokens)
                ? accessTokens
                : []
            const token = validAccessTokens.find(
                (token) => token?.character_id === character.id
            )
            if (token) {
                removeAccessTokenFromLocalStorage(token)
            }

            // unregister the character
            removeRegisteredCharacterFromLocalStorage(character)

            reload()
        } catch (error) {
            console.error("Failed to unregister character:", error)
            setIsError(true)
            setErrorMessage("Failed to unregister character")
        }
    }

    useEffect(() => {
        if (enabled) reload()

        // Cleanup function to abort any pending requests
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
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
        errorMessage,
        reload,
        unregisterCharacter,
        lastReload,
    }
}

export default useGetRegisteredCharacters
