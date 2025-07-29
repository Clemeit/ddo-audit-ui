import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
    useCallback,
} from "react"
import {
    DEFAULT_BASE_FONT_SIZE,
    DEFAULT_LFM_PANEL_WIDTH,
    DEFAULT_MOUSE_OVER_DELAY,
} from "../constants/lfmPanel.ts"
import { useThemeContext } from "./ThemeContext.tsx"
import {
    setData as setDataToLocalStorage,
    getData as getDataFromLocalStorage,
} from "../utils/localStorage.ts"
import { LfmApiDataModel, LfmSortType } from "../models/Lfm.ts"
import { MAX_LEVEL, MIN_LEVEL } from "../constants/game.ts"
import useGetRegisteredCharacters from "../hooks/useGetRegisteredCharacters.ts"
import { Character } from "../models/Character.ts"
import logMessage from "../utils/logUtils.ts"
import { useNotificationContext } from "./NotificationContext.tsx"
import useLimitedInterval from "../hooks/useLimitedInterval.ts"
import { MsFromHours, MsFromMinutes } from "../utils/timeUtils.ts"

interface LfmContextProps {
    lfmDataCache: LfmApiDataModel
    setLfmDataCache: (lfmData: LfmApiDataModel) => void
    minLevel: number
    setMinLevel: (level: number) => void
    maxLevel: number
    setMaxLevel: (level: number) => void
    filterByMyCharacters: boolean
    setFilterByMyCharacters: (filter: boolean) => void
    showNotEligible: boolean
    setShowNotEligible: (show: boolean) => void
    fontSize: number
    setFontSize: (size: number) => void
    panelWidth: number
    setPanelWidth: (size: number) => void
    panelHeight: number
    setPanelHeight: (size: number) => void
    showBoundingBoxes: boolean
    setShowBoundingBoxes: (show: boolean) => void
    sortBy: LfmSortType
    setSortBy: (sort: LfmSortType) => void
    isDynamicWidth: boolean
    setIsDynamicWidth: (isDynamic: boolean) => void
    showRaidTimerIndicator: boolean
    setShowRaidTimerIndicator: (show: boolean) => void
    showMemberCount: boolean
    setShowMemberCount: (show: boolean) => void
    showQuestGuesses: boolean
    setShowQuestGuesses: (show: boolean) => void
    showQuestTips: boolean
    setShowQuestTips: (show: boolean) => void
    showCharacterGuildNames: boolean
    setShowCharacterGuildNames: (show: boolean) => void
    registeredCharacters: Character[] | null
    reloadRegisteredCharacters: () => void
    trackedCharacterIds: number[]
    setTrackedCharacterIds: (ids: number[]) => void
    showLfmPostedTime: boolean
    setShowLfmPostedTime: (show: boolean) => void
    mouseOverDelay: number
    setMouseOverDelay: (delay: number) => void
    showLfmActivity: boolean
    setShowLfmActivity: (show: boolean) => void
    isMultiColumn: boolean
    setIsMultiColumn: (value: boolean) => void
    showEligibleCharacters: boolean
    setShowEligibleCharacters: (value: boolean) => void
    hideGroupsPostedByIgnoredCharacters: boolean
    setHideGroupsPostedByIgnoredCharacters: (value: boolean) => void
    hideGroupsContainingIgnoredCharacters: boolean
    setHideGroupsContainingIgnoredCharacters: (value: boolean) => void
    showIndicationForGroupsPostedByFriends: boolean
    setShowIndicationForGroupsPostedByFriends: (value: boolean) => void
    showIndicationForGroupsContainingFriends: boolean
    setShowIndicationForGroupsContainingFriends: (value: boolean) => void
    highlightRaids: boolean
    setHighlightRaids: (value: boolean) => void
    hideAllLevelGroups: boolean
    setHideAllLevelGroups: (value: boolean) => void
    showEligibilityDividers: boolean
    setShowEligibilityDividers: (value: boolean) => void
    onlyShowRaids: boolean
    setOnlyShowRaids: (value: boolean) => void
    resetFilterSettings: () => void
    resetDisplaySettings: () => void
    resetToolSettings: () => void
}

const LfmContext = createContext<LfmContextProps | undefined>(undefined)

export const LfmProvider = ({ children }: { children: ReactNode }) => {
    const settingsStorageKey = "lfm-settings"
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const { registeredCharacters, reload: reloadRegisteredCharacters } =
        useGetRegisteredCharacters()
    const [trackedCharacterIds, setTrackedCharacterIds] = useState<number[]>([])

    // lfm cache used when navigating from grouping to grouping specific
    const [lfmDataCache, setLfmDataCache] = useState<LfmApiDataModel>({})

    // debug:
    const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(false)

    const { setIsFullScreen } = useThemeContext()

    // TODO: store all of the options and filters here
    // filter:
    const [minLevel, setMinLevel] = useState<number>(MIN_LEVEL)
    const [maxLevel, setMaxLevel] = useState<number>(MAX_LEVEL)
    const [filterByMyCharacters, setFilterByMyCharacters] =
        useState<boolean>(false)
    const [showNotEligible, setShowNotEligible] = useState<boolean>(true)

    // display:
    const [fontSize, setFontSize] = useState<number>(DEFAULT_BASE_FONT_SIZE)
    const [panelWidth, setPanelWidth] = useState<number>(
        DEFAULT_LFM_PANEL_WIDTH
    )
    const [panelHeight, setPanelHeight] = useState<number>(-1)
    const [isDynamicWidth, setIsDynamicWidth] = useState<boolean>(false)
    const [sortBy, setSortBy] = useState<LfmSortType>({
        type: "level",
        ascending: true,
    })
    const [mouseOverDelay, setMouseOverDelay] = useState<number>(
        DEFAULT_MOUSE_OVER_DELAY
    )
    const [isMultiColumn, setIsMultiColumn] = useState<boolean>(true)
    const [highlightRaids, setHighlightRaids] = useState<boolean>(false)
    const [hideAllLevelGroups, setHideAllLevelGroups] = useState<boolean>(false)
    const [showEligibilityDividers, setShowEligibilityDividers] =
        useState<boolean>(true)
    const [onlyShowRaids, setOnlyShowRaids] = useState<boolean>(false)

    // tools:
    const [showRaidTimerIndicator, setShowRaidTimerIndicator] =
        useState<boolean>(true)
    const [showMemberCount, setShowMemberCount] = useState<boolean>(true)
    const [showQuestGuesses, setShowQuestGuesses] = useState<boolean>(true)
    const [showQuestTips, setShowQuestTips] = useState<boolean>(true)
    const [showCharacterGuildNames, setShowCharacterGuildNames] =
        useState<boolean>(true)
    const [showLfmPostedTime, setShowLfmPostedTime] = useState<boolean>(true)
    const [showLfmActivity, setShowLfmActivity] = useState<boolean>(true)
    const [showEligibleCharacters, setShowEligibleCharacters] =
        useState<boolean>(false)

    // social
    const [
        hideGroupsPostedByIgnoredCharacters,
        setHideGroupsPostedByIgnoredCharacters,
    ] = useState<boolean>(false)
    const [
        hideGroupsContainingIgnoredCharacters,
        setHideGroupsContainingIgnoredCharacters,
    ] = useState<boolean>(false)
    const [
        showIndicationForGroupsPostedByFriends,
        setShowIndicationForGroupsPostedByFriends,
    ] = useState<boolean>(true)
    const [
        showIndicationForGroupsContainingFriends,
        setShowIndicationForGroupsContainingFriends,
    ] = useState<boolean>(true)

    const { createNotification } = useNotificationContext()

    const resetFilterSettings = () => {
        setMinLevel(MIN_LEVEL)
        setMaxLevel(MAX_LEVEL)
        setFilterByMyCharacters(false)
        setShowNotEligible(true)
        setTrackedCharacterIds([])
        logMessage("Filter settings reset to defaults", "info")
    }

    const resetDisplaySettings = useCallback(() => {
        setSortBy({ type: "level", ascending: true })
        setFontSize(DEFAULT_BASE_FONT_SIZE)
        setMouseOverDelay(DEFAULT_MOUSE_OVER_DELAY)
        setPanelWidth(DEFAULT_LFM_PANEL_WIDTH)
        setShowBoundingBoxes(false)
        setIsDynamicWidth(false)
        setIsFullScreen(false)
        setIsMultiColumn(true)
        setHighlightRaids(false)
        setHideAllLevelGroups(false)
        setShowEligibilityDividers(true)
        setOnlyShowRaids(false)
        logMessage("Display settings reset to defaults", "info")
    }, [setIsFullScreen])

    const resetToolSettings = () => {
        setShowRaidTimerIndicator(true)
        setShowMemberCount(true)
        setShowQuestGuesses(true)
        setShowQuestTips(true)
        setShowCharacterGuildNames(true)
        setShowLfmPostedTime(true)
        setShowLfmActivity(true)
        setShowEligibleCharacters(false)
        setHideGroupsPostedByIgnoredCharacters(false)
        setHideGroupsContainingIgnoredCharacters(false)
        setShowIndicationForGroupsPostedByFriends(true)
        setShowIndicationForGroupsContainingFriends(true)
        logMessage("Tool settings reset to defaults", "info")
    }

    const applyDefaultSettings = useCallback(() => {
        // Apply all default values
        setMinLevel(MIN_LEVEL)
        setMaxLevel(MAX_LEVEL)
        setFilterByMyCharacters(false)
        setShowNotEligible(true)
        setFontSize(DEFAULT_BASE_FONT_SIZE)
        setPanelWidth(DEFAULT_LFM_PANEL_WIDTH)
        setSortBy({ type: "level", ascending: true })
        setShowRaidTimerIndicator(true)
        setShowMemberCount(true)
        setShowQuestGuesses(true)
        setShowQuestTips(true)
        setShowCharacterGuildNames(true)
        setTrackedCharacterIds([])
        setShowLfmPostedTime(true)
        setMouseOverDelay(DEFAULT_MOUSE_OVER_DELAY)
        setShowLfmActivity(true)
        setIsMultiColumn(true)
        setShowEligibleCharacters(false)
        setHideGroupsPostedByIgnoredCharacters(false)
        setHideGroupsContainingIgnoredCharacters(false)
        setShowIndicationForGroupsPostedByFriends(true)
        setShowIndicationForGroupsContainingFriends(true)
        setHighlightRaids(false)
        setHideAllLevelGroups(false)
        setShowEligibilityDividers(true)
        setOnlyShowRaids(false)
    }, [])

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
            settings.fontSize !== undefined &&
            (isNaN(parseInt(settings.fontSize)) ||
                parseInt(settings.fontSize) < 8 ||
                parseInt(settings.fontSize) > 72)
        ) {
            return false
        }
        if (
            settings.panelWidth !== undefined &&
            (isNaN(parseInt(settings.panelWidth)) ||
                parseInt(settings.panelWidth) < 100 ||
                parseInt(settings.panelWidth) > 2000)
        ) {
            return false
        }
        if (
            settings.mouseOverDelay !== undefined &&
            (typeof settings.mouseOverDelay !== "number" ||
                settings.mouseOverDelay < 0 ||
                settings.mouseOverDelay > 10000)
        ) {
            return false
        }

        // Validate arrays
        if (
            settings.trackedCharacterIds !== undefined &&
            !Array.isArray(settings.trackedCharacterIds)
        ) {
            return false
        }

        // Validate sortBy object structure
        if (
            settings.sortBy !== undefined &&
            (typeof settings.sortBy !== "object" ||
                !settings.sortBy.type ||
                typeof settings.sortBy.ascending !== "boolean")
        ) {
            return false
        }

        return true
    }

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

        // Settings are valid, apply them safely with additional fallbacks
        try {
            setMinLevel(settings.minLevel ?? MIN_LEVEL)
            setMaxLevel(settings.maxLevel ?? MAX_LEVEL)
            setFilterByMyCharacters(
                Boolean(settings.filterByMyCharacters ?? false)
            )
            setShowNotEligible(Boolean(settings.showNotEligible ?? true))

            const parsedFontSize = parseInt(
                settings.fontSize ?? String(DEFAULT_BASE_FONT_SIZE)
            )
            setFontSize(
                isNaN(parsedFontSize) ? DEFAULT_BASE_FONT_SIZE : parsedFontSize
            )

            const parsedPanelWidth = parseInt(
                settings.panelWidth ?? String(DEFAULT_LFM_PANEL_WIDTH)
            )
            setPanelWidth(
                isNaN(parsedPanelWidth)
                    ? DEFAULT_LFM_PANEL_WIDTH
                    : parsedPanelWidth
            )

            setSortBy(settings.sortBy ?? { type: "level", ascending: true })
            setShowRaidTimerIndicator(
                Boolean(settings.showRaidTimerIndicator ?? true)
            )
            setShowMemberCount(Boolean(settings.showMemberCount ?? true))
            setShowQuestGuesses(Boolean(settings.showQuestGuesses ?? true))
            setShowQuestTips(Boolean(settings.showQuestTips ?? true))
            setShowCharacterGuildNames(
                Boolean(settings.showCharacterGuildNames ?? true)
            )
            setTrackedCharacterIds(
                Array.isArray(settings.trackedCharacterIds)
                    ? settings.trackedCharacterIds
                    : []
            )
            setShowLfmPostedTime(Boolean(settings.showLfmPostedTime ?? true))
            setMouseOverDelay(
                settings.mouseOverDelay ?? DEFAULT_MOUSE_OVER_DELAY
            )
            setShowLfmActivity(Boolean(settings.showLfmActivity ?? true))
            setIsMultiColumn(Boolean(settings.isMultiColumn ?? true))
            setShowEligibleCharacters(
                Boolean(settings.showEligibleCharacters ?? false)
            )
            setHideGroupsPostedByIgnoredCharacters(
                Boolean(settings.hideGroupsPostedByIgnoredCharacters ?? false)
            )
            setHideGroupsContainingIgnoredCharacters(
                Boolean(settings.hideGroupsContainingIgnoredCharacters ?? false)
            )
            setShowIndicationForGroupsPostedByFriends(
                Boolean(settings.showIndicationForGroupsPostedByFriends ?? true)
            )
            setShowIndicationForGroupsContainingFriends(
                Boolean(
                    settings.showIndicationForGroupsContainingFriends ?? true
                )
            )
            setHighlightRaids(Boolean(settings.highlightRaids ?? false))
            setHideAllLevelGroups(Boolean(settings.hideAllLevelGroups ?? false))
            setShowEligibilityDividers(
                Boolean(settings.showEligibilityDividers ?? true)
            )
            setOnlyShowRaids(Boolean(settings.onlyShowRaids ?? false))
        } catch (e) {
            logMessage(
                "Error applying validated settings, falling back to defaults",
                "error",
                {
                    metadata: {
                        settings,
                        error: e instanceof Error ? e.message : String(e),
                    },
                }
            )

            // If there's still an error applying validated settings, use defaults
            applyDefaultSettings()

            createNotification({
                title: new Date().toLocaleTimeString(),
                message:
                    "An unexpected error occurred while applying your settings. They have been reset to defaults.",
                subMessage: "This error has been logged.",
                type: "error",
            })
        }
    }, [applyDefaultSettings, createNotification])

    useLimitedInterval({
        callback: reloadRegisteredCharacters,
        intervalMs: MsFromMinutes(1),
        ttlMs: MsFromHours(8),
    })

    useEffect(() => {
        loadSettingsFromLocalStorage()
        setIsLoaded(true)
    }, [loadSettingsFromLocalStorage])

    useEffect(() => {
        // Only save to localStorage after initial load to avoid overwriting with undefined values
        if (!isLoaded) return

        try {
            const settingsToSave = {
                minLevel,
                maxLevel,
                filterByMyCharacters,
                showNotEligible,
                fontSize,
                panelWidth,
                showBoundingBoxes,
                sortBy,
                isDynamicWidth,
                showRaidTimerIndicator,
                showMemberCount,
                showQuestGuesses,
                showQuestTips,
                showCharacterGuildNames,
                trackedCharacterIds,
                showLfmPostedTime,
                mouseOverDelay,
                showLfmActivity,
                isMultiColumn,
                showEligibleCharacters,
                hideGroupsPostedByIgnoredCharacters,
                hideGroupsContainingIgnoredCharacters,
                showIndicationForGroupsPostedByFriends,
                showIndicationForGroupsContainingFriends,
                highlightRaids,
                hideAllLevelGroups,
                showEligibilityDividers,
                onlyShowRaids,
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
        minLevel,
        maxLevel,
        filterByMyCharacters,
        showNotEligible,
        isLoaded,
        fontSize,
        panelWidth,
        showBoundingBoxes,
        sortBy,
        isDynamicWidth,
        showRaidTimerIndicator,
        showMemberCount,
        showQuestGuesses,
        showQuestTips,
        showCharacterGuildNames,
        trackedCharacterIds,
        showLfmPostedTime,
        mouseOverDelay,
        showLfmActivity,
        isMultiColumn,
        showEligibleCharacters,
        hideGroupsPostedByIgnoredCharacters,
        hideGroupsContainingIgnoredCharacters,
        showIndicationForGroupsPostedByFriends,
        showIndicationForGroupsContainingFriends,
        highlightRaids,
        hideAllLevelGroups,
        showEligibilityDividers,
        onlyShowRaids,
    ])

    return (
        <LfmContext.Provider
            value={{
                lfmDataCache,
                setLfmDataCache,
                minLevel,
                setMinLevel,
                maxLevel,
                setMaxLevel,
                filterByMyCharacters,
                setFilterByMyCharacters,
                showNotEligible,
                setShowNotEligible,
                fontSize,
                setFontSize,
                panelWidth,
                setPanelWidth,
                panelHeight,
                setPanelHeight,
                showBoundingBoxes,
                setShowBoundingBoxes,
                sortBy,
                setSortBy,
                isDynamicWidth,
                setIsDynamicWidth,
                showRaidTimerIndicator,
                setShowRaidTimerIndicator,
                showMemberCount,
                setShowMemberCount,
                showQuestGuesses,
                setShowQuestGuesses,
                showQuestTips,
                setShowQuestTips,
                showCharacterGuildNames,
                setShowCharacterGuildNames,
                registeredCharacters,
                reloadRegisteredCharacters,
                trackedCharacterIds,
                setTrackedCharacterIds,
                showLfmPostedTime,
                setShowLfmPostedTime,
                mouseOverDelay,
                setMouseOverDelay,
                showLfmActivity,
                setShowLfmActivity,
                isMultiColumn,
                setIsMultiColumn,
                showEligibleCharacters,
                setShowEligibleCharacters,
                hideGroupsPostedByIgnoredCharacters,
                setHideGroupsPostedByIgnoredCharacters,
                hideGroupsContainingIgnoredCharacters,
                setHideGroupsContainingIgnoredCharacters,
                showIndicationForGroupsPostedByFriends,
                setShowIndicationForGroupsPostedByFriends,
                showIndicationForGroupsContainingFriends,
                setShowIndicationForGroupsContainingFriends,
                highlightRaids,
                setHighlightRaids,
                hideAllLevelGroups,
                setHideAllLevelGroups,
                showEligibilityDividers,
                setShowEligibilityDividers,
                onlyShowRaids,
                setOnlyShowRaids,
                resetDisplaySettings,
                resetFilterSettings,
                resetToolSettings,
            }}
        >
            {children}
        </LfmContext.Provider>
    )
}

export const useLfmContext = () => {
    const context = useContext(LfmContext)
    if (!context) {
        throw new Error("useLfmContext must be used within a LfmProvider")
    }
    return context
}
