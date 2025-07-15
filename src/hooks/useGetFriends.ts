import useGetCharacterList from "./useGetCharacterList"
import {
    getFriends,
    setFriends,
    addFriend,
    removeFriend,
} from "../utils/localStorage"
import { Character } from "../models/Character"

interface ReturnProps {
    friends: Character[]
    isFriendsLoading: boolean
    isFriendsLoaded: boolean
    isFriendsError: boolean
    hasFetchedFriendsFromServer: boolean
    lastFriendsFetch: Date
    reloadFriends: () => void
    addFriend: (character: Character) => void
    removeFriend: (character: Character) => void
}

/**
 * Simple wrapper around useGetCharacterList to manage friends.
 * This hook provides a consistent interface for managing friends
 * @returns ReturnProps
 * @see useGetCharacterList for more details on the returned properties and methods
 */
const useGetFriends = (): ReturnProps => {
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
        getCharactersFromLocalStorage: getFriends,
        setCharactersInLocalStorage: setFriends,
        addCharacterToLocalStorage: addFriend,
        removeCharacterFromLocalStorage: removeFriend,
    })
    return {
        friends: characters,
        isFriendsLoading: isLoading,
        isFriendsLoaded: isLoaded,
        isFriendsError: isError,
        hasFetchedFriendsFromServer: hasFetchedFromServer,
        lastFriendsFetch: lastFetch,
        reloadFriends: reload,
        addFriend: addCharacter,
        removeFriend: removeCharacter,
    }
}

export default useGetFriends
