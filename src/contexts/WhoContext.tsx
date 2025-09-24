import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
    useCallback,
} from "react"
import { CLASS_LIST_LOWER, MAX_LEVEL, MIN_LEVEL } from "../constants/game.ts"
import { CharacterSortBy, CharacterSortType } from "../models/Character.ts"
import {
    getData as getDataFromLocalStorage,
    setData as setDataToLocalStorage,
} from "../utils/localStorage.ts"
import {
    DEFAULT_CHARACTER_COUNT,
    DEFAULT_REFRESH_RATE,
    DEFAULT_WHO_PANEL_WIDTH,
    MAXIMUM_CHARACTER_COUNT,
    MINIMUM_CHARACTER_COUNT,
} from "../constants/whoPanel.ts"
import logMessage from "../utils/logUtils.ts"
import { useNotificationContext } from "./NotificationContext.tsx"

interface WhoContextProps {
    stringFilter: string
    setStringFilter: React.Dispatch<React.SetStateAction<string>>
    classNameFilter: string[]
    setClassNameFilter: React.Dispatch<React.SetStateAction<string[]>>
    minLevel: number
    setMinLevel: React.Dispatch<React.SetStateAction<number>>
    maxLevel: number
    setMaxLevel: React.Dispatch<React.SetStateAction<number>>
    isGroupView: boolean
    setIsGroupView: React.Dispatch<React.SetStateAction<boolean>>
    shouldIncludeRegion: boolean
    setShouldIncludeRegion: React.Dispatch<React.SetStateAction<boolean>>
    isExactMatch: boolean
    setIsExactMatch: React.Dispatch<React.SetStateAction<boolean>>
    sortBy: CharacterSortBy
    setSortBy: React.Dispatch<React.SetStateAction<CharacterSortBy>>
    panelWidth: number
    setPanelWidth: React.Dispatch<React.SetStateAction<number>>
    panelHeight: number
    setPanelHeight: React.Dispatch<React.SetStateAction<number>>
    isDynamicWidth: boolean
    setIsDynamicWidth: React.Dispatch<React.SetStateAction<boolean>>
    shouldSaveSettings: boolean
    setShouldSaveSettings: React.Dispatch<React.SetStateAction<boolean>>
    shouldSaveClassFilter: boolean
    setShouldSaveClassFilter: React.Dispatch<React.SetStateAction<boolean>>
    shouldSaveStringFilter: boolean
    setShouldSaveStringFilter: React.Dispatch<React.SetStateAction<boolean>>
    shouldSaveLevelFilter: boolean
    setShouldSaveLevelFilter: React.Dispatch<React.SetStateAction<boolean>>
    shouldSaveSortBy: boolean
    setShouldSaveSortBy: React.Dispatch<React.SetStateAction<boolean>>
    shouldSaveGroupView: boolean
    setShouldSaveGroupView: React.Dispatch<React.SetStateAction<boolean>>
    shouldSaveExactMatch: boolean
    setShouldSaveExactMatch: React.Dispatch<React.SetStateAction<boolean>>
    showInQuestIndicator: boolean
    setShowInQuestIndicator: React.Dispatch<React.SetStateAction<boolean>>
    refreshInterval: number
    setRefreshInterval: React.Dispatch<React.SetStateAction<number>>
    hideIgnoredCharacters: boolean
    setHideIgnoredCharacters: React.Dispatch<React.SetStateAction<boolean>>
    pinRegisteredCharacters: boolean
    setPinRegisteredCharacters: React.Dispatch<React.SetStateAction<boolean>>
    alwaysShowRegisteredCharacters: boolean
    setAlwaysShowRegisteredCharacters: React.Dispatch<
        React.SetStateAction<boolean>
    >
    pinFriends: boolean
    setPinFriends: React.Dispatch<React.SetStateAction<boolean>>
    alwaysShowFriends: boolean
    setAlwaysShowFriends: React.Dispatch<React.SetStateAction<boolean>>
    maximumRenderedCharacterCount: number
    setMaximumRenderedCharacterCount: React.Dispatch<
        React.SetStateAction<number>
    >
    exportSettings: () => any
    importSettings: (settings: any) => boolean
}

const WhoContext = createContext<WhoContextProps | undefined>(undefined)

export const WhoProvider = ({ children }: { children: ReactNode }) => {
    const settingsStorageKey = "who-settings"
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [stringFilter, setStringFilter] = useState<string>("")
    const [classNameFilter, setClassNameFilter] =
        useState<string[]>(CLASS_LIST_LOWER)
    const [minLevel, setMinLevel] = useState<number>(MIN_LEVEL)
    const [maxLevel, setMaxLevel] = useState<number>(MAX_LEVEL)
    const [isGroupView, setIsGroupView] = useState<boolean>(false)
    const [shouldIncludeRegion, setShouldIncludeRegion] =
        useState<boolean>(false)
    const [isExactMatch, setIsExactMatch] = useState<boolean>(false)
    const [sortBy, setSortBy] = useState<CharacterSortBy>({
        type: CharacterSortType.Level,
        ascending: true,
    })
    const [panelWidth, setPanelWidth] = useState<number>(
        DEFAULT_WHO_PANEL_WIDTH
    )
    const [panelHeight, setPanelHeight] = useState<number>(0)
    const [isDynamicWidth, setIsDynamicWidth] = useState<boolean>(false)
    const [showInQuestIndicator, setShowInQuestIndicator] =
        useState<boolean>(true)
    const [refreshInterval, setRefreshInterval] =
        useState<number>(DEFAULT_REFRESH_RATE)

    const [shouldSaveSettings, setShouldSaveSettings] = useState<boolean>(false)
    const [shouldSaveClassFilter, setShouldSaveClassFilter] =
        useState<boolean>(false)
    const [shouldSaveStringFilter, setShouldSaveStringFilter] =
        useState<boolean>(false)
    const [shouldSaveLevelFilter, setShouldSaveLevelFilter] =
        useState<boolean>(false)
    const [shouldSaveSortBy, setShouldSaveSortBy] = useState<boolean>(false)
    const [shouldSaveGroupView, setShouldSaveGroupView] =
        useState<boolean>(false)
    const [shouldSaveExactMatch, setShouldSaveExactMatch] =
        useState<boolean>(false)
    const [hideIgnoredCharacters, setHideIgnoredCharacters] =
        useState<boolean>(true)
    const [pinRegisteredCharacters, setPinRegisteredCharacters] =
        useState<boolean>(true)
    const [alwaysShowRegisteredCharacters, setAlwaysShowRegisteredCharacters] =
        useState<boolean>(false)
    const [pinFriends, setPinFriends] = useState<boolean>(true)
    const [alwaysShowFriends, setAlwaysShowFriends] = useState<boolean>(false)
    const [maximumRenderedCharacterCount, setMaximumRenderedCharacterCount] =
        useState<number>(DEFAULT_CHARACTER_COUNT)

    const { createNotification } = useNotificationContext()

    const validateAndParseSettings = (settings: any): boolean => {
        // Basic type validation
        if (!settings || typeof settings !== "object") {
            return false
        }

        // Validate critical numeric values
        if (
            settings.minLevel !== undefined &&
            (typeof settings.minLevel !== "number" ||
                settings.minLevel < MIN_LEVEL ||
                settings.minLevel > MAX_LEVEL)
        ) {
            return false
        }
        if (
            settings.maxLevel !== undefined &&
            (typeof settings.maxLevel !== "number" ||
                settings.maxLevel < MIN_LEVEL ||
                settings.maxLevel > MAX_LEVEL)
        ) {
            return false
        }
        if (
            settings.maximumRenderedCharacterCount !== undefined &&
            (typeof settings.maximumRenderedCharacterCount !== "number" ||
                settings.maximumRenderedCharacterCount <
                    MINIMUM_CHARACTER_COUNT ||
                settings.maximumRenderedCharacterCount >
                    MAXIMUM_CHARACTER_COUNT)
        ) {
            return false
        }

        return true
    }

    const applyDefaultSettings = useCallback(() => {
        setStringFilter("")
        setClassNameFilter(CLASS_LIST_LOWER)
        setMinLevel(MIN_LEVEL)
        setMaxLevel(MAX_LEVEL)
        setIsGroupView(false)
        setShouldIncludeRegion(false)
        setIsExactMatch(false)
        setSortBy({
            type: CharacterSortType.Level,
            ascending: true,
        })
        setPanelHeight(DEFAULT_WHO_PANEL_WIDTH)
        setPanelHeight(0)
        setIsDynamicWidth(false)
        setShowInQuestIndicator(true)
        setRefreshInterval(DEFAULT_REFRESH_RATE)
        setShouldSaveSettings(false)
        setShouldSaveClassFilter(false)
        setShouldSaveStringFilter(false)
        setShouldSaveLevelFilter(false)
        setShouldSaveSortBy(false)
        setShouldSaveGroupView(false)
        setShouldSaveExactMatch(false)
        setHideIgnoredCharacters(true)
        setPinRegisteredCharacters(true)
        setAlwaysShowRegisteredCharacters(false)
        setPinFriends(true)
        setAlwaysShowFriends(false)
        setMaximumRenderedCharacterCount(DEFAULT_CHARACTER_COUNT)
    }, [])

    // Apply a previously validated settings object. Returns true on success.
    // Relies on applyDefaultSettings for fallback.
    let applyValidatedSettings: (settings: any) => boolean
    applyValidatedSettings = useCallback(
        (settings: any): boolean => {
            try {
                if (settings.shouldSaveSettings) {
                    if (settings.shouldSaveStringFilter)
                        setStringFilter(String(settings.stringFilter))
                    if (settings.shouldSaveClassFilter)
                        setClassNameFilter(
                            Array.isArray(settings.classNameFilter)
                                ? settings.classNameFilter
                                : CLASS_LIST_LOWER
                        )
                    if (settings.shouldSaveLevelFilter)
                        setMinLevel(
                            parseInt(settings.minLevel ?? String(MIN_LEVEL))
                        )
                    if (settings.shouldSaveLevelFilter)
                        setMaxLevel(
                            parseInt(settings.maxLevel ?? String(MAX_LEVEL))
                        )
                    if (settings.shouldSaveGroupView)
                        setIsGroupView(Boolean(settings.isGroupView ?? false))
                    setShouldIncludeRegion(
                        Boolean(settings.shouldIncludeRegion ?? false)
                    )
                    if (settings.shouldSaveExactMatch)
                        setIsExactMatch(Boolean(settings.isExactMatch ?? false))
                    if (settings.shouldSaveSortBy) setSortBy(settings.sortBy)
                    setPanelWidth(
                        parseInt(
                            settings.panelWidth ??
                                String(DEFAULT_WHO_PANEL_WIDTH)
                        )
                    )
                    setIsDynamicWidth(Boolean(settings.isDynamicWidth ?? false))
                }
                setShouldSaveSettings(
                    Boolean(settings.shouldSaveSettings ?? false)
                )
                setShouldSaveClassFilter(
                    Boolean(settings.shouldSaveClassFilter ?? false)
                )
                setShouldSaveStringFilter(
                    Boolean(settings.shouldSaveStringFilter ?? false)
                )
                setShouldSaveLevelFilter(
                    Boolean(settings.shouldSaveLevelFilter ?? false)
                )
                setShouldSaveSortBy(Boolean(settings.shouldSaveSortBy ?? false))
                setShouldSaveGroupView(
                    Boolean(settings.shouldSaveGroupView ?? false)
                )
                setShouldSaveExactMatch(
                    Boolean(settings.shouldSaveExactMatch ?? false)
                )
                setShowInQuestIndicator(
                    Boolean(settings.showInQuestIndicator ?? true)
                )
                setRefreshInterval(
                    parseInt(
                        settings.refreshInterval ?? String(DEFAULT_REFRESH_RATE)
                    )
                )
                setHideIgnoredCharacters(
                    Boolean(settings.hideIgnoredCharacters ?? true)
                )
                setPinFriends(Boolean(settings.pinFriends ?? true))
                setPinRegisteredCharacters(
                    Boolean(settings.pinRegisteredCharacters ?? true)
                )
                setAlwaysShowRegisteredCharacters(
                    Boolean(settings.alwaysShowRegisteredCharacters ?? false)
                )
                setAlwaysShowFriends(
                    Boolean(settings.alwaysShowFriends ?? false)
                )
                setMaximumRenderedCharacterCount(
                    parseInt(
                        settings.maximumRenderedCharacterCount ??
                            String(DEFAULT_CHARACTER_COUNT)
                    )
                )
                return true
            } catch (e) {
                logMessage(
                    "Error applying validated Who settings, reverting to defaults",
                    "error",
                    {
                        metadata: {
                            settings,
                            error: e instanceof Error ? e.message : String(e),
                        },
                    }
                )
                applyDefaultSettings()
                createNotification({
                    title: new Date().toLocaleTimeString(),
                    message:
                        "An unexpected error occurred while applying Who settings. Defaults restored.",
                    subMessage: "This error has been logged.",
                    type: "error",
                })
                return false
            }
        },
        [applyDefaultSettings, createNotification]
    )

    const loadSettingsFromLocalStorage = useCallback(() => {
        let settings: any = null
        let shouldResetToDefaults = false
        let errorMessage = ""

        try {
            settings = getDataFromLocalStorage<any>(settingsStorageKey)

            // If settings exist but are invalid, we need to reset
            if (settings && !validateAndParseSettings(settings)) {
                shouldResetToDefaults = true
                errorMessage =
                    "Settings validation failed - corrupted or invalid data detected"
            }
        } catch (e) {
            shouldResetToDefaults = true
            errorMessage = `Error loading settings from localStorage: ${e instanceof Error ? e.message : String(e)}`
        }

        if (shouldResetToDefaults || !settings) {
            if (shouldResetToDefaults) {
                logMessage(
                    "Settings corrupted or invalid, resetting to defaults",
                    "error",
                    {
                        metadata: {
                            error: errorMessage,
                            corruptedSettings: settings,
                        },
                    }
                )
                createNotification({
                    title: new Date().toLocaleTimeString(),
                    message:
                        "Your settings were corrupted or invalid and have been reset to defaults. Sorry about that!",
                    subMessage: "This error has been logged.",
                    type: "error",
                })
            }

            // Apply defaults and save them to localStorage to overwrite bad data
            applyDefaultSettings()
            return
        }

        applyValidatedSettings(settings)
    }, [applyValidatedSettings])

    useEffect(() => {
        loadSettingsFromLocalStorage()
        setIsLoaded(true)
    }, [loadSettingsFromLocalStorage])

    useEffect(() => {
        if (!isLoaded) return

        try {
            const settingsToSave = {
                stringFilter,
                classNameFilter,
                minLevel,
                maxLevel,
                isGroupView,
                shouldIncludeRegion,
                isExactMatch,
                sortBy,
                panelWidth,
                isDynamicWidth,
                shouldSaveSettings,
                shouldSaveClassFilter,
                shouldSaveStringFilter,
                shouldSaveLevelFilter,
                shouldSaveSortBy,
                shouldSaveGroupView,
                shouldSaveExactMatch,
                showInQuestIndicator,
                refreshInterval,
                hideIgnoredCharacters,
                pinRegisteredCharacters,
                pinFriends,
                alwaysShowRegisteredCharacters,
                alwaysShowFriends,
                maximumRenderedCharacterCount,
            }

            // Validate the settings before saving
            if (validateAndParseSettings(settingsToSave)) {
                setDataToLocalStorage<any>(settingsStorageKey, settingsToSave)
            } else {
                logMessage(
                    "Attempted to save invalid settings to localStorage - skipping save",
                    "warn",
                    { metadata: { settingsToSave } }
                )
            }
        } catch (e) {
            logMessage("Error saving settings to localStorage", "error", {
                metadata: {
                    error: e instanceof Error ? e.message : String(e),
                },
            })
        }
    }, [
        stringFilter,
        classNameFilter,
        minLevel,
        maxLevel,
        isGroupView,
        shouldIncludeRegion,
        isExactMatch,
        sortBy,
        panelWidth,
        isDynamicWidth,
        shouldSaveSettings,
        shouldSaveClassFilter,
        shouldSaveStringFilter,
        shouldSaveLevelFilter,
        shouldSaveSortBy,
        shouldSaveGroupView,
        shouldSaveExactMatch,
        showInQuestIndicator,
        refreshInterval,
        hideIgnoredCharacters,
        pinRegisteredCharacters,
        pinFriends,
        alwaysShowRegisteredCharacters,
        alwaysShowFriends,
        maximumRenderedCharacterCount,
    ])

    const exportSettings = () => {
        // Return current settings as an object
        return {
            stringFilter,
            classNameFilter,
            minLevel,
            maxLevel,
            isGroupView,
            shouldIncludeRegion,
            isExactMatch,
            sortBy,
            panelWidth,
            isDynamicWidth,
            shouldSaveSettings,
            shouldSaveClassFilter,
            shouldSaveStringFilter,
            shouldSaveLevelFilter,
            shouldSaveSortBy,
            shouldSaveGroupView,
            shouldSaveExactMatch,
            showInQuestIndicator,
            refreshInterval,
            hideIgnoredCharacters,
            pinRegisteredCharacters,
            pinFriends,
            alwaysShowRegisteredCharacters,
            alwaysShowFriends,
            maximumRenderedCharacterCount,
        }
    }

    const importSettings = useCallback(
        (settings: any): boolean => {
            if (!validateAndParseSettings(settings)) {
                logMessage(
                    "Imported Who settings invalid - aborting import",
                    "error",
                    { metadata: { settings } }
                )
                createNotification({
                    title: new Date().toLocaleTimeString(),
                    message:
                        "The Who settings you tried to import are invalid or corrupted.",
                    subMessage: "Import aborted.",
                    type: "error",
                })
                return false
            }
            const success = applyValidatedSettings(settings)
            return success
        },
        [applyValidatedSettings, createNotification]
    )

    return (
        <WhoContext.Provider
            value={{
                stringFilter,
                setStringFilter,
                classNameFilter,
                setClassNameFilter,
                minLevel,
                setMinLevel,
                maxLevel,
                setMaxLevel,
                isGroupView,
                setIsGroupView,
                shouldIncludeRegion,
                setShouldIncludeRegion,
                isExactMatch,
                setIsExactMatch,
                sortBy,
                setSortBy,
                panelWidth,
                setPanelWidth,
                isDynamicWidth,
                setIsDynamicWidth,
                panelHeight,
                setPanelHeight,
                shouldSaveSettings,
                setShouldSaveSettings,
                shouldSaveClassFilter,
                setShouldSaveClassFilter,
                shouldSaveStringFilter,
                setShouldSaveStringFilter,
                shouldSaveLevelFilter,
                setShouldSaveLevelFilter,
                shouldSaveSortBy,
                setShouldSaveSortBy,
                shouldSaveGroupView,
                setShouldSaveGroupView,
                shouldSaveExactMatch,
                setShouldSaveExactMatch,
                showInQuestIndicator,
                setShowInQuestIndicator,
                refreshInterval,
                setRefreshInterval,
                hideIgnoredCharacters,
                setHideIgnoredCharacters,
                pinRegisteredCharacters,
                setPinRegisteredCharacters,
                alwaysShowRegisteredCharacters,
                setAlwaysShowRegisteredCharacters,
                pinFriends,
                setPinFriends,
                alwaysShowFriends,
                setAlwaysShowFriends,
                maximumRenderedCharacterCount,
                setMaximumRenderedCharacterCount,
                exportSettings,
                importSettings,
            }}
        >
            {children}
        </WhoContext.Provider>
    )
}

export const useWhoContext = () => {
    const context = useContext(WhoContext)
    if (!context) {
        throw new Error("useWhoContext must be used within a WhoProvider")
    }
    return context
}
