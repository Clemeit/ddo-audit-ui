import { useCallback, useEffect, useState } from "react"
import { Character } from "../models/Character"
import { getCharactersByIds } from "../services/characterService.ts"
import logMessage from "../utils/logUtils"

interface Props {
    getCharactersFromLocalStorage: () => Character[]
    setCharactersInLocalStorage?: (characters: Character[]) => void
    addCharacterToLocalStorage?: (character: Character) => void
    removeCharacterFromLocalStorage?: (character: Character) => void
}

interface ReturnProps {
    characters: Character[]
    isLoading: boolean
    isLoaded: boolean
    isError: boolean
    hasFetchedFromServer: boolean
    lastFetch: Date
    reload: () => void
    addCharacter: (character: Character) => void
    removeCharacter: (character: Character) => void
}

const useGetCharacterList = ({
    getCharactersFromLocalStorage,
    setCharactersInLocalStorage,
    addCharacterToLocalStorage,
    removeCharacterFromLocalStorage,
}: Props): ReturnProps => {
    const [cachedCharacters, setCachedCharacters] = useState<Character[]>([])
    const [liveCharacters, setLiveCharacters] = useState<Character[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)
    const [hasFetchedFromServer, setHasFetchedFromServer] =
        useState<boolean>(false)
    const [lastFetch, setLastFetch] = useState<Date>(new Date(0))

    const reload = useCallback(() => {
        const setIsLoadingTimeout = setTimeout(() => setIsLoading(true), 500)
        setIsError(false)

        const _cachedCharacters = getCharactersFromLocalStorage()
        if (!_cachedCharacters || _cachedCharacters.length === 0) {
            clearTimeout(setIsLoadingTimeout)
            setCachedCharacters([])
            setLiveCharacters([])
            setIsLoaded(true)
            return
        }
        setCachedCharacters(_cachedCharacters)
        const _cachedCharacterIds: number[] = _cachedCharacters.map(
            (character) => character.id
        )
        getCharactersByIds(_cachedCharacterIds)
            .then((response) => {
                try {
                    const _liveCharacters = Object.values(response.data || {})
                    setLiveCharacters(_liveCharacters)
                    setHasFetchedFromServer(true)
                    setIsError(false)
                    setLastFetch(new Date())
                    setCharactersInLocalStorage(_liveCharacters)
                } catch (e) {
                    logMessage(
                        "Error fetching characters in useGetCharacterList .then",
                        "error",
                        {
                            metadata: response,
                        }
                    )
                    setIsError(true)
                }
            })
            .catch((error) => {
                logMessage(
                    "Error fetching characters in useGetCharacterList .catch",
                    "error",
                    {
                        metadata: error,
                    }
                )
                setIsError(true)
            })
            .finally(() => {
                clearTimeout(setIsLoadingTimeout)
                setIsLoading(false)
                setIsLoaded(true)
            })
    }, [getCharactersFromLocalStorage, setCharactersInLocalStorage])

    const removeCharacter = (character: Character) => {
        removeCharacterFromLocalStorage(character)
        reload()
    }

    const addCharacter = (character: Character) => {
        addCharacterToLocalStorage(character)
        reload()
    }

    useEffect(() => {
        reload()
    }, [reload])

    return {
        characters:
            liveCharacters.length > 0 ? liveCharacters : cachedCharacters,
        isLoading,
        isLoaded,
        isError,
        hasFetchedFromServer,
        lastFetch,
        reload,
        addCharacter,
        removeCharacter,
    }
}

export default useGetCharacterList
