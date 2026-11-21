import { useCallback, useEffect, useRef, useState } from "react"
import { Character } from "../models/Character"
import { getCharactersByIds } from "../services/characterService.ts"
import logMessage from "../utils/logUtils"
import { useUserContext } from "../contexts/UserContext"

/**
 * Refresh the stored list with fresh character data without changing which characters
 * are on it. The stored list decides membership: a character the lookup didn't return
 * keeps its cached entry (marked offline, since it isn't in the online cache), and a
 * returned character that is no longer on the list is not added back.
 */
export function mergeLiveCharacters(
    storedCharacters: Character[],
    liveCharacters: Character[]
): Character[] {
    const liveById = new Map<number, Character>()
    for (const character of liveCharacters) {
        if (character && typeof character.id === "number") {
            liveById.set(character.id, character)
        }
    }
    return storedCharacters.map((stored) => {
        const live = liveById.get(stored.id)
        if (live) return live
        return stored.is_online ? { ...stored, is_online: false } : stored
    })
}

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
    const { persistentSettingsRevision } = useUserContext()
    // Reloads overlap (interval, add/remove, settings sync). Only the newest one may
    // touch this hook's state; an older response arriving late is dropped.
    const latestRequestRef = useRef<number>(0)

    const reload = useCallback(() => {
        const requestId = ++latestRequestRef.current
        const setIsLoadingTimeout = setTimeout(() => {
            if (requestId === latestRequestRef.current) setIsLoading(true)
        }, 500)
        setIsError(false)

        const cachedCharactersFromLocal = getCharactersFromLocalStorage()
        const _cachedCharacters = Array.isArray(cachedCharactersFromLocal)
            ? cachedCharactersFromLocal
            : []

        if (!Array.isArray(cachedCharactersFromLocal)) {
            logMessage(
                "Invalid cached characters format in localStorage",
                "warn",
                {
                    metadata: {
                        value: cachedCharactersFromLocal,
                    },
                }
            )
        }

        if (_cachedCharacters.length === 0) {
            clearTimeout(setIsLoadingTimeout)
            setCachedCharacters([])
            setLiveCharacters([])
            setIsLoading(false)
            setIsLoaded(true)
            return
        }
        setCachedCharacters(_cachedCharacters)
        const _cachedCharacterIds: number[] = _cachedCharacters.map(
            (character) => character.id
        )
        getCharactersByIds(_cachedCharacterIds)
            .then((response) => {
                if (requestId !== latestRequestRef.current) return
                try {
                    const _liveCharacters = Object.values(response.data || {})
                    // Merge into the list as it is now, not as it was when this request
                    // started: it may have been edited here, in another tab, or by a
                    // settings pull in the meantime.
                    const storedNow = getCharactersFromLocalStorage()
                    const merged = mergeLiveCharacters(
                        Array.isArray(storedNow) ? storedNow : [],
                        _liveCharacters
                    )
                    setCachedCharacters(merged)
                    setLiveCharacters(merged)
                    setHasFetchedFromServer(true)
                    setIsError(false)
                    setLastFetch(new Date())
                    setCharactersInLocalStorage?.(merged)
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
                if (requestId !== latestRequestRef.current) return
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
                if (requestId !== latestRequestRef.current) return
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
    }, [reload, persistentSettingsRevision])

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
