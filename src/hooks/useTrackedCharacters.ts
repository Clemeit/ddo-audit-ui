import { useState, useEffect } from "react"
import { setValue, getValue } from "../utils/localStorage.ts"

/**
 * A lightweight hook that provides only tracked character IDs functionality
 * without the expensive API calls from the full LfmContext
 */
const useTrackedCharacters = () => {
    const [trackedCharacterIds, setTrackedCharacterIds] = useState<number[]>([])
    const settingsStorageKey = "lfm-settings"

    // Load tracked character IDs from localStorage on mount
    useEffect(() => {
        try {
            const settings = getValue<any>(settingsStorageKey)
            if (settings?.trackedCharacterIds) {
                setTrackedCharacterIds(settings.trackedCharacterIds)
            }
        } catch (error) {
            console.error(
                "Error loading tracked character IDs from localStorage:",
                error
            )
        }
    }, [])

    // Save tracked character IDs to localStorage when they change
    useEffect(() => {
        try {
            const existingSettings = getValue<any>(settingsStorageKey) || {}
            setValue<any>(settingsStorageKey, {
                ...existingSettings,
                trackedCharacterIds,
            })
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
