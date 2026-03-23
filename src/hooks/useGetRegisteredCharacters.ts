import { useState, useEffect, useCallback, useRef } from "react"
import { useUserContext } from "../contexts/UserContext.tsx"
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
import logMessage from "../utils/logUtils.ts"

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
    const { persistentSettingsRevision } = useUserContext()

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

            const dedupedRegisteredCharactersById = new Map<number, Character>()
            for (const character of registeredCharactersMetadata.data) {
                if (
                    typeof character?.id === "number" &&
                    character.id > 0 &&
                    !dedupedRegisteredCharactersById.has(character.id)
                ) {
                    dedupedRegisteredCharactersById.set(character.id, character)
                }
            }
            const dedupedRegisteredCharacters = Array.from(
                dedupedRegisteredCharactersById.values()
            )

            setRegisteredCharactersCached(dedupedRegisteredCharacters)
            setAccessTokens(validAccessTokens)

            const verifiedCharactersCached = dedupedRegisteredCharacters.filter(
                (character: Character) =>
                    character?.id &&
                    validAccessTokens.some(
                        (token) => token?.character_id === character.id
                    )
            )
            setVerifiedCharactersCached(verifiedCharactersCached)

            // Extract and validate character IDs
            const characterIds = dedupedRegisteredCharacters
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

                const expectedCharacterIds = new Set(characterIds)
                const returnedCharacterIds = new Set(
                    characters.map((character) => character.id)
                )
                const missingCharacterIds = characterIds.filter(
                    (id) => !returnedCharacterIds.has(id)
                )
                const unexpectedCharacterIds = Array.from(
                    returnedCharacterIds
                ).filter((id) => !expectedCharacterIds.has(id))

                if (
                    missingCharacterIds.length > 0 ||
                    unexpectedCharacterIds.length > 0
                ) {
                    logMessage(
                        "getCharactersByIds returned mismatched character IDs",
                        "warn",
                        {
                            metadata: {
                                expectedCharacterIds: characterIds,
                                returnedCharacterIds:
                                    Array.from(returnedCharacterIds),
                                missingCharacterIds,
                                unexpectedCharacterIds,
                            },
                        }
                    )
                }

                // Treat API results as partial updates so network issues don't drop existing IDs.
                const mergedCharactersById = new Map<number, Character>()
                for (const character of dedupedRegisteredCharacters) {
                    if (typeof character?.id === "number") {
                        mergedCharactersById.set(character.id, character)
                    }
                }
                for (const character of characters) {
                    mergedCharactersById.set(character.id, character)
                }

                const mergedCharacters = characterIds
                    .map((id) => mergedCharactersById.get(id))
                    .filter((character): character is Character =>
                        Boolean(character)
                    )

                setRegisteredCharacters(mergedCharacters)
                setIsLoaded(true)

                const verifiedCharacters = mergedCharacters.filter(
                    (character) =>
                        validAccessTokens.some(
                            (token) => token?.character_id === character.id
                        )
                )
                setVerifiedCharacters(verifiedCharacters)

                // Safe localStorage operation
                try {
                    setRegisteredCharactersInLocalStorage(mergedCharacters)
                } catch (localStorageError) {
                    logMessage(
                        "Failed to save registered characters to localStorage",
                        "error",
                        {
                            metadata: { error: localStorageError },
                        }
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

                logMessage("Failed to fetch registered characters", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                })
                setIsError(true)
                setErrorMessage(
                    error?.message || "Failed to fetch character data"
                )
                setIsLoaded(true)
            }
        } catch (localStorageError) {
            logMessage(
                "Failed to access registered characters from localStorage",
                "error",
                {
                    metadata: { error: localStorageError },
                }
            )
            setIsError(true)
            setErrorMessage("Failed to access stored character data")
            setIsLoaded(true)
        }
    }, [])

    function unregisterCharacter(character: Character) {
        if (!character?.id) {
            logMessage(
                "Cannot unregister character: invalid character data",
                "warn",
                {
                    metadata: { character: character },
                }
            )
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
            logMessage("Failed to unregister character", "error", {
                metadata: { error: error },
            })
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
    }, [reload, enabled, persistentSettingsRevision])

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
