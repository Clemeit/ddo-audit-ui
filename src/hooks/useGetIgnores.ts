import useGetCharacterList from "./useGetCharacterList"
import {
    getIgnores,
    setIgnores,
    addIgnore,
    removeIgnore,
} from "../utils/localStorage"
import { Character } from "../models/Character"

interface ReturnProps {
    ignores: Character[]
    isIgnoresLoading: boolean
    isIgnoresLoaded: boolean
    isIgnoresError: boolean
    hasFetchedIgnoresFromServer: boolean
    lastIgnoresFetch: Date
    reloadIgnores: () => void
    addIgnore: (character: Character) => void
    removeIgnore: (character: Character) => void
}

/**
 * Simple wrapper around useGetCharacterList to manage ignores.
 * This hook provides a consistent interface for managing ignores
 * @returns ReturnProps
 * @see useGetCharacterList for more details on the returned properties and methods
 */
const useGetIgnores = (): ReturnProps => {
    const {
        characters,
        isLoading,
        isLoaded,
        isError,
        hasFetchedFromServer,
        lastFetch,
        reload,
        addCharacter,
        removeCharacter,
    } = useGetCharacterList({
        getCharactersFromLocalStorage: getIgnores,
        setCharactersInLocalStorage: setIgnores,
        addCharacterToLocalStorage: addIgnore,
        removeCharacterFromLocalStorage: removeIgnore,
    })
    return {
        ignores: characters,
        isIgnoresLoading: isLoading,
        isIgnoresLoaded: isLoaded,
        isIgnoresError: isError,
        hasFetchedIgnoresFromServer: hasFetchedFromServer,
        lastIgnoresFetch: lastFetch,
        reloadIgnores: reload,
        addIgnore: addCharacter,
        removeIgnore: removeCharacter,
    }
}

export default useGetIgnores
