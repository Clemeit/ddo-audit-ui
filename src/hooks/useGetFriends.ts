import { useState, useEffect, useCallback } from "react"
import {
    getFriendsMetadata as getFriendsMetadataFromLocalStorage,
    setFriends as setFriendsInLocalStorage,
    removeFriend as removeFriendInLocalStorage,
} from "../utils/localStorage.ts"
import { getCharactersByIds } from "../services/characterService.ts"
import { Character } from "../models/Character.ts"
import { CACHED_CHARACTER_EXPIRY_TIME } from "../constants/client.ts"

interface Props {
    enabled?: boolean
}

const useGetFriends = ({ enabled = true }: Props = {}) => {
    const [friends, setFriends] = useState<Character[] | undefined>(undefined)
    const [friendsCached, setFriendsCached] = useState<Character[] | undefined>(
        undefined
    )
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)
    const [lastReload, setLastReload] = useState<Date>(new Date())

    const reload = useCallback(() => {
        setIsLoaded(false)
        setLastReload(new Date())
        const friendsMetadata = getFriendsMetadataFromLocalStorage()
        if (!friendsMetadata || friendsMetadata.data?.length === 0) {
            setFriends([])
            setIsLoaded(true)
            return
        }

        setFriendsCached(friendsMetadata.data)

        // for every ID, look up the character data and add it to the list
        const characterIds = friendsMetadata.data.map(
            (character: Character) => character.id
        )
        getCharactersByIds(characterIds)
            .then((response) => {
                const characters: Character[] = Object.values(
                    response.data?.data || {}
                )
                setFriends(characters)
                setIsLoaded(true)

                // update cached data if it's older than CACHED_CHARACTER_EXPIRY_TIME
                const lastUpdated = new Date(friendsMetadata.updatedAt)
                if (
                    new Date().getTime() - lastUpdated.getTime() >
                    CACHED_CHARACTER_EXPIRY_TIME
                ) {
                    setFriendsInLocalStorage(characters)
                }
                setIsError(false)
            })
            .catch(() => {
                setIsError(true)
            })
    }, [])

    function removeFriend(character: Character) {
        // remove the character
        removeFriendInLocalStorage(character)

        reload()
    }

    useEffect(() => {
        if (enabled) reload()
    }, [reload, enabled])

    return {
        friends: friends || friendsCached || [],
        isLoaded,
        isError,
        reload,
        removeFriend,
        lastReload,
    }
}

export default useGetFriends
