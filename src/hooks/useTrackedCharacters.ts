import { useState, useEffect } from "react"
import {
    getTrackedCharacterIds,
    setTrackedCharacterIds as setTrackedCharacterIdsLocalStorage,
} from "../utils/localStorage.ts"

/**
 * A lightweight hook that provides only tracked character IDs functionality
 * without the expensive API calls from the full LfmContext
 */
const useTrackedCharacters = () => {
    const [trackedCharacterIds, setTrackedCharacterIds] = useState<number[]>(
        () => {
            try {
                const ids = getTrackedCharacterIds()
                return Array.isArray(ids) ? ids : []
            } catch (error) {
                console.error(
                    "Error loading tracked character IDs from localStorage:",
                    error
                )
                return []
            }
        }
    )

    // Save tracked character IDs to localStorage when they change
    useEffect(() => {
        try {
            setTrackedCharacterIdsLocalStorage(trackedCharacterIds)
        } catch (error) {
            console.error(
                "Error saving tracked character IDs to localStorage:",
                error
            )
        }
    }, [trackedCharacterIds])

    return {
        trackedCharacterIds,
        setTrackedCharacterIds,
    }
}

export default useTrackedCharacters
