import {
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
import { useAppContext } from "./AppContext.tsx"
import {
    setData as setDataToLocalStorage,
    getData as getDataFromLocalStorage,
} from "../utils/localStorage.ts"
import { LfmApiDataModel, LfmSortSetting, LfmSortType } from "../models/Lfm.ts"
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
    sortBy: LfmSortSetting
    setSortBy: (sort: LfmSortSetting) => void
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
    showQuestMetrics: boolean
    setShowQuestMetrics: (show: boolean) => void
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
    hideContentIDontOwn: boolean
    setHideContentIDontOwn: (value: boolean) => void
    indicateContentIDontOwn: boolean
    setIndicateContentIDontOwn: (value: boolean) => void
    ownedContent: string[]
    setOwnedContent: (value: string[]) => void
    hideFullGroups: boolean
    setHideFullGroups: (value: boolean) => void
    resetFilterSettings: () => void
    resetDisplaySettings: () => void
    resetToolSettings: () => void
    exportSettings: () => any
    importSettings: (settings: any) => boolean
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

    const { setIsFullScreen } = useAppContext()

    // TODO: store all of the options and filters here
    // filter:
    const [minLevel, setMinLevel] = useState<number>(MIN_LEVEL)
    const [maxLevel, setMaxLevel] = useState<number>(MAX_LEVEL)
    const [filterByMyCharacters, setFilterByMyCharacters] =
        useState<boolean>(false)
    const [showNotEligible, setShowNotEligible] = useState<boolean>(true)
    const [hideContentIDontOwn, setHideContentIDontOwn] =
        useState<boolean>(false)
    const [indicateContentIDontOwn, setIndicateContentIDontOwn] =
        useState<boolean>(false)
    const [ownedContent, setOwnedContent] = useState<string[]>([])

    // display:
    const [fontSize, setFontSize] = useState<number>(DEFAULT_BASE_FONT_SIZE)
    const [panelWidth, setPanelWidth] = useState<number>(
        DEFAULT_LFM_PANEL_WIDTH
    )
    const [panelHeight, setPanelHeight] = useState<number>(-1)
    const [isDynamicWidth, setIsDynamicWidth] = useState<boolean>(false)
    const [sortBy, setSortBy] = useState<LfmSortSetting>({
        type: LfmSortType.LEVEL,
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
    const [hideFullGroups, setHideFullGroups] = useState<boolean>(false)

    // tools:
    const [showRaidTimerIndicator, setShowRaidTimerIndicator] =
        useState<boolean>(true)
    const [showMemberCount, setShowMemberCount] = useState<boolean>(true)
    const [showQuestGuesses, setShowQuestGuesses] = useState<boolean>(true)
    const [showQuestTips, setShowQuestTips] = useState<boolean>(true)
    const [showCharacterGuildNames, setShowCharacterGuildNames] =
        useState<boolean>(true)
    const [showLfmPostedTime, setShowLfmPostedTime] = useState<boolean>(true)
    const [showQuestMetrics, setShowQuestMetrics] = useState<boolean>(true)
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
        setSortBy({ type: LfmSortType.LEVEL, ascending: true })
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
        setShowQuestMetrics(true)
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
        setSortBy({ type: LfmSortType.LEVEL, ascending: true })
        setShowRaidTimerIndicator(true)
        setShowMemberCount(true)
        setShowQuestGuesses(true)
        setShowQuestTips(true)
        setShowCharacterGuildNames(true)
        setTrackedCharacterIds([])
        setShowLfmPostedTime(true)
        setShowQuestMetrics(true)
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

    // Sanitize settings object field-by-field, coercing invalid values to safe defaults
    // Returns a sanitized settings object plus a flag indicating if any correction occurred
    const sanitizeSettings = useCallback(
        (settings: any): { sanitized: any; corrected: boolean } => {
            const s = settings && typeof settings === "object" ? settings : {}
            let corrected = false

            const coerceNumber = (
                value: any,
                { min, max, def }: { min?: number; max?: number; def: number }
            ): number => {
                const n =
                    typeof value === "number" ? value : parseInt(String(value))
                if (isNaN(n)) return def
                if (min !== undefined && n < min) return min
                if (max !== undefined && n > max) return max
                return n
            }

            const sanitizeBoolean = (value: any, def: boolean): boolean => {
                if (typeof value === "boolean") return value
                if (value === undefined || value === null) return def
                return Boolean(value)
            }

            const defaults = {
                minLevel: MIN_LEVEL,
                maxLevel: MAX_LEVEL,
                filterByMyCharacters: false,
                showNotEligible: true,
                hideContentIDontOwn: false,
                indicateContentIDontOwn: false,
                ownedContent: [] as string[],
                fontSize: DEFAULT_BASE_FONT_SIZE,
                panelWidth: DEFAULT_LFM_PANEL_WIDTH,
                showBoundingBoxes: false,
                sortBy: {
                    type: LfmSortType.LEVEL,
                    ascending: true,
                } as LfmSortSetting,
                isDynamicWidth: false,
                showRaidTimerIndicator: true,
                showMemberCount: true,
                showQuestGuesses: true,
                showQuestTips: true,
                showCharacterGuildNames: true,
                trackedCharacterIds: [] as number[],
                showLfmPostedTime: true,
                showQuestMetrics: true,
                mouseOverDelay: DEFAULT_MOUSE_OVER_DELAY,
                showLfmActivity: true,
                isMultiColumn: true,
                showEligibleCharacters: false,
                hideGroupsPostedByIgnoredCharacters: false,
                hideGroupsContainingIgnoredCharacters: false,
                showIndicationForGroupsPostedByFriends: true,
                showIndicationForGroupsContainingFriends: true,
                highlightRaids: false,
                hideAllLevelGroups: false,
                showEligibilityDividers: true,
                onlyShowRaids: false,
                hideFullGroups: false,
            }

            const sanitized: any = {}

            // Numeric ranges
            sanitized.minLevel = coerceNumber(s.minLevel, {
                min: MIN_LEVEL,
                max: MAX_LEVEL,
                def: defaults.minLevel,
            })
            sanitized.maxLevel = coerceNumber(s.maxLevel, {
                min: MIN_LEVEL,
                max: MAX_LEVEL,
                def: defaults.maxLevel,
            })
            sanitized.fontSize = coerceNumber(s.fontSize, {
                min: 8,
                max: 72,
                def: defaults.fontSize,
            })
            sanitized.panelWidth = coerceNumber(s.panelWidth, {
                min: 100,
                max: 2000,
                def: defaults.panelWidth,
            })
            sanitized.mouseOverDelay = coerceNumber(s.mouseOverDelay, {
                min: 0,
                max: 10000,
                def: defaults.mouseOverDelay,
            })

            // Booleans
            sanitized.filterByMyCharacters = sanitizeBoolean(
                s.filterByMyCharacters,
                defaults.filterByMyCharacters
            )
            sanitized.showNotEligible = sanitizeBoolean(
                s.showNotEligible,
                defaults.showNotEligible
            )
            sanitized.hideContentIDontOwn = sanitizeBoolean(
                s.hideContentIDontOwn,
                defaults.hideContentIDontOwn
            )
            sanitized.indicateContentIDontOwn = sanitizeBoolean(
                s.indicateContentIDontOwn,
                defaults.indicateContentIDontOwn
            )
            sanitized.showBoundingBoxes = sanitizeBoolean(
                s.showBoundingBoxes,
                defaults.showBoundingBoxes
            )
            sanitized.isDynamicWidth = sanitizeBoolean(
                s.isDynamicWidth,
                defaults.isDynamicWidth
            )
            sanitized.showRaidTimerIndicator = sanitizeBoolean(
                s.showRaidTimerIndicator,
                defaults.showRaidTimerIndicator
            )
            sanitized.showMemberCount = sanitizeBoolean(
                s.showMemberCount,
                defaults.showMemberCount
            )
            sanitized.showQuestGuesses = sanitizeBoolean(
                s.showQuestGuesses,
                defaults.showQuestGuesses
            )
            sanitized.showQuestTips = sanitizeBoolean(
                s.showQuestTips,
                defaults.showQuestTips
            )
            sanitized.showCharacterGuildNames = sanitizeBoolean(
                s.showCharacterGuildNames,
                defaults.showCharacterGuildNames
            )
            sanitized.showLfmPostedTime = sanitizeBoolean(
                s.showLfmPostedTime,
                defaults.showLfmPostedTime
            )
            sanitized.showQuestMetrics = sanitizeBoolean(
                s.showQuestMetrics,
                defaults.showQuestMetrics
            )
            sanitized.showLfmActivity = sanitizeBoolean(
                s.showLfmActivity,
                defaults.showLfmActivity
            )
            sanitized.isMultiColumn = sanitizeBoolean(
                s.isMultiColumn,
                defaults.isMultiColumn
            )
            sanitized.showEligibleCharacters = sanitizeBoolean(
                s.showEligibleCharacters,
                defaults.showEligibleCharacters
            )
            sanitized.hideGroupsPostedByIgnoredCharacters = sanitizeBoolean(
                s.hideGroupsPostedByIgnoredCharacters,
                defaults.hideGroupsPostedByIgnoredCharacters
            )
            sanitized.hideGroupsContainingIgnoredCharacters = sanitizeBoolean(
                s.hideGroupsContainingIgnoredCharacters,
                defaults.hideGroupsContainingIgnoredCharacters
            )
            sanitized.showIndicationForGroupsPostedByFriends = sanitizeBoolean(
                s.showIndicationForGroupsPostedByFriends,
                defaults.showIndicationForGroupsPostedByFriends
            )
            sanitized.showIndicationForGroupsContainingFriends =
                sanitizeBoolean(
                    s.showIndicationForGroupsContainingFriends,
                    defaults.showIndicationForGroupsContainingFriends
                )
            sanitized.highlightRaids = sanitizeBoolean(
                s.highlightRaids,
                defaults.highlightRaids
            )
            sanitized.hideAllLevelGroups = sanitizeBoolean(
                s.hideAllLevelGroups,
                defaults.hideAllLevelGroups
            )
            sanitized.showEligibilityDividers = sanitizeBoolean(
                s.showEligibilityDividers,
                defaults.showEligibilityDividers
            )
            sanitized.onlyShowRaids = sanitizeBoolean(
                s.onlyShowRaids,
                defaults.onlyShowRaids
            )
            sanitized.hideFullGroups = sanitizeBoolean(
                s.hideFullGroups,
                defaults.hideFullGroups
            )

            // Arrays
            sanitized.ownedContent = Array.isArray(s.ownedContent)
                ? s.ownedContent
                : defaults.ownedContent
            sanitized.trackedCharacterIds = Array.isArray(s.trackedCharacterIds)
                ? s.trackedCharacterIds.filter(
                      (n: any) => typeof n === "number"
                  )
                : defaults.trackedCharacterIds

            // sortBy object
            const sort = s.sortBy
            if (
                sort &&
                typeof sort === "object" &&
                sort.type !== undefined &&
                typeof sort.ascending === "boolean"
            ) {
                sanitized.sortBy = sort
            } else {
                sanitized.sortBy = defaults.sortBy
            }

            // Determine if any correction occurred by comparing used fields
            const keys = Object.keys(defaults)
            for (const k of keys) {
                if ((s as any)[k] === undefined) {
                    if (sanitized[k] !== (defaults as any)[k]) {
                        corrected = true
                        break
                    }
                } else if (k === "trackedCharacterIds") {
                    const a = Array.isArray((s as any)[k]) ? (s as any)[k] : []
                    if (a.length !== sanitized[k].length) {
                        corrected = true
                        break
                    }
                } else if (
                    JSON.stringify((s as any)[k]) !==
                    JSON.stringify(sanitized[k])
                ) {
                    corrected = true
                    break
                }
            }

            return { sanitized, corrected }
        },
        []
    )

    // Applies already validated settings object to state with safety and fallback.
    const applyValidatedSettings = useCallback(
        (settings: any): boolean => {
            try {
                setMinLevel(settings.minLevel ?? MIN_LEVEL)
                setMaxLevel(settings.maxLevel ?? MAX_LEVEL)
                setFilterByMyCharacters(
                    Boolean(settings.filterByMyCharacters ?? false)
                )
                setShowNotEligible(Boolean(settings.showNotEligible ?? true))
                setHideContentIDontOwn(
                    Boolean(settings.hideContentIDontOwn ?? false)
                )
                setIndicateContentIDontOwn(
                    Boolean(settings.indicateContentIDontOwn ?? false)
                )
                setOwnedContent(
                    Array.isArray(settings.ownedContent)
                        ? settings.ownedContent
                        : []
                )

                const parsedFontSize = parseInt(
                    settings.fontSize ?? String(DEFAULT_BASE_FONT_SIZE)
                )
                setFontSize(
                    isNaN(parsedFontSize)
                        ? DEFAULT_BASE_FONT_SIZE
                        : parsedFontSize
                )

                const parsedPanelWidth = parseInt(
                    settings.panelWidth ?? String(DEFAULT_LFM_PANEL_WIDTH)
                )
                setPanelWidth(
                    isNaN(parsedPanelWidth)
                        ? DEFAULT_LFM_PANEL_WIDTH
                        : parsedPanelWidth
                )

                setSortBy(
                    settings.sortBy ?? {
                        type: LfmSortType.LEVEL,
                        ascending: true,
                    }
                )
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
                setShowLfmPostedTime(
                    Boolean(settings.showLfmPostedTime ?? true)
                )
                setShowQuestMetrics(Boolean(settings.showQuestMetrics ?? true))
                setMouseOverDelay(
                    settings.mouseOverDelay ?? DEFAULT_MOUSE_OVER_DELAY
                )
                setShowLfmActivity(Boolean(settings.showLfmActivity ?? true))
                setIsMultiColumn(Boolean(settings.isMultiColumn ?? true))
                setShowEligibleCharacters(
                    Boolean(settings.showEligibleCharacters ?? false)
                )
                setHideGroupsPostedByIgnoredCharacters(
                    Boolean(
                        settings.hideGroupsPostedByIgnoredCharacters ?? false
                    )
                )
                setHideGroupsContainingIgnoredCharacters(
                    Boolean(
                        settings.hideGroupsContainingIgnoredCharacters ?? false
                    )
                )
                setShowIndicationForGroupsPostedByFriends(
                    Boolean(
                        settings.showIndicationForGroupsPostedByFriends ?? true
                    )
                )
                setShowIndicationForGroupsContainingFriends(
                    Boolean(
                        settings.showIndicationForGroupsContainingFriends ??
                            true
                    )
                )
                setHighlightRaids(Boolean(settings.highlightRaids ?? false))
                setHideAllLevelGroups(
                    Boolean(settings.hideAllLevelGroups ?? false)
                )
                setShowEligibilityDividers(
                    Boolean(settings.showEligibilityDividers ?? true)
                )
                setOnlyShowRaids(Boolean(settings.onlyShowRaids ?? false))
                setHideFullGroups(Boolean(settings.hideFullGroups ?? false))
                return true
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
                applyDefaultSettings()
                createNotification({
                    title: new Date().toLocaleTimeString(),
                    message:
                        "An unexpected error occurred while applying your settings. They have been reset to defaults.",
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
        try {
            settings = getDataFromLocalStorage<any>(settingsStorageKey)
        } catch (e) {
            logMessage(
                "Error loading settings from localStorage, using defaults",
                "error",
                {
                    metadata: {
                        error: e instanceof Error ? e.message : String(e),
                    },
                }
            )
            applyDefaultSettings()
            return
        }

        if (!settings) {
            applyDefaultSettings()
            return
        }

        const { sanitized, corrected } = sanitizeSettings(settings)
        if (corrected) {
            logMessage(
                "LFM settings contained invalid fields; sanitized to safe defaults",
                "warn",
                {
                    metadata: { original: settings, sanitized },
                }
            )
            try {
                setDataToLocalStorage<any>(settingsStorageKey, sanitized)
            } catch {}
        }
        applyValidatedSettings(sanitized)
    }, [applyValidatedSettings, applyDefaultSettings, sanitizeSettings])

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
                hideContentIDontOwn,
                indicateContentIDontOwn,
                ownedContent,
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
                showQuestMetrics,
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
                hideFullGroups,
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
        hideContentIDontOwn,
        indicateContentIDontOwn,
        ownedContent,
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
        showQuestMetrics,
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
        hideFullGroups,
    ])

    const exportSettings = () => {
        return {
            minLevel,
            maxLevel,
            filterByMyCharacters,
            showNotEligible,
            hideContentIDontOwn,
            indicateContentIDontOwn,
            ownedContent,
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
            showQuestMetrics,
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
            hideFullGroups,
        }
    }

    const importSettings = useCallback(
        (settings: any): boolean => {
            const { sanitized, corrected } = sanitizeSettings(settings)
            if (corrected) {
                createNotification({
                    title: new Date().toLocaleTimeString(),
                    message:
                        "Some imported LFM settings were invalid and have been corrected to safe defaults.",
                    subMessage: "Import completed with adjustments.",
                    type: "info",
                })
            }
            const success = applyValidatedSettings(sanitized)
            return success
        },
        [applyValidatedSettings, createNotification, sanitizeSettings]
    )

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
                showQuestMetrics,
                setShowQuestMetrics,
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
                hideContentIDontOwn,
                setHideContentIDontOwn,
                indicateContentIDontOwn,
                setIndicateContentIDontOwn,
                ownedContent,
                setOwnedContent,
                hideFullGroups,
                setHideFullGroups,
                resetDisplaySettings,
                resetFilterSettings,
                resetToolSettings,
                exportSettings,
                importSettings,
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
