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
import { setValue, getValue } from "../utils/localStorage.ts"
import { LfmApiDataModel, LfmSortType } from "../models/Lfm.ts"
import { MAX_LEVEL, MIN_LEVEL } from "../constants/game.ts"
import useGetRegisteredCharacters from "../hooks/useGetRegisteredCharacters.ts"
import { Character } from "../models/Character.ts"

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
    resetFilterSettings: () => void
    resetDisplaySettings: () => void
    resetToolSettings: () => void
    mouseOverDelay: number
    setMouseOverDelay: (delay: number) => void
    showLfmActivity: boolean
    setShowLfmActivity: (show: boolean) => void
    isMultiColumn: boolean
    setIsMultiColumn: (value: boolean) => void
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

    const resetFilterSettings = () => {
        setMinLevel(MIN_LEVEL)
        setMaxLevel(MAX_LEVEL)
        setFilterByMyCharacters(false)
        setShowNotEligible(true)
        setTrackedCharacterIds([])
    }

    const resetDisplaySettings = useCallback(() => {
        setSortBy({ type: "level", ascending: true })
        setFontSize(DEFAULT_BASE_FONT_SIZE)
        setMouseOverDelay(DEFAULT_MOUSE_OVER_DELAY)
        setPanelWidth(DEFAULT_LFM_PANEL_WIDTH)
        setShowBoundingBoxes(false)
        setIsDynamicWidth(false)
        setIsFullScreen(false)
        setIsMultiColumn(false)
    }, [setIsFullScreen])

    const resetToolSettings = () => {
        setShowRaidTimerIndicator(true)
        setShowMemberCount(true)
        setShowQuestGuesses(true)
        setShowQuestTips(true)
        setShowCharacterGuildNames(false)
        setShowLfmPostedTime(true)
        setShowLfmActivity(true)
    }

    const loadSettingsFromLocalStorage = useCallback(() => {
        const settings = getValue<any>(settingsStorageKey)
        if (settings) {
            try {
                setMinLevel(settings.minLevel)
                setMaxLevel(settings.maxLevel)
                setFilterByMyCharacters(settings.filterByMyCharacters)
                setShowNotEligible(settings.showNotEligible)
                setFontSize(parseInt(settings.fontSize))
                setPanelWidth(parseInt(settings.panelWidth))
                setShowBoundingBoxes(settings.showBoundingBoxes)
                setSortBy(settings.sortBy)
                setIsDynamicWidth(settings.isDynamicWidth)
                setShowRaidTimerIndicator(settings.showRaidTimerIndicator)
                setShowMemberCount(settings.showMemberCount)
                setShowQuestGuesses(settings.showQuestGuesses)
                setShowQuestTips(settings.showQuestTips)
                setShowCharacterGuildNames(settings.showCharacterGuildNames)
                setTrackedCharacterIds(settings.trackedCharacterIds)
                setShowLfmPostedTime(settings.showLfmPostedTime)
                setMouseOverDelay(settings.mouseOverDelay)
                setShowLfmActivity(settings.showLfmActivity)
                setIsMultiColumn(settings.isMultiColumn)
            } catch (e) {
                // TODO: maybe show a modal here to allow the user to reset their settings
                console.error("Error loading settings from local storage", e)
                resetFilterSettings()
                resetDisplaySettings()
            }
        }
    }, [resetDisplaySettings])

    useEffect(() => {
        // load from local storage
        loadSettingsFromLocalStorage()
        setIsLoaded(true)

        // reload registered characters every minute
        const interval = setInterval(reloadRegisteredCharacters, 60000)
        return () => clearInterval(interval)
    }, [reloadRegisteredCharacters, loadSettingsFromLocalStorage])

    useEffect(() => {
        // save to local storage
        if (!isLoaded) return
        setValue<any>(settingsStorageKey, {
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
        })
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
    ])

    useEffect(() => {
        if (!isDynamicWidth) {
            setPanelWidth(DEFAULT_LFM_PANEL_WIDTH)
        }
    }, [isDynamicWidth])

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
                resetDisplaySettings,
                resetFilterSettings,
                resetToolSettings,
                mouseOverDelay,
                setMouseOverDelay,
                showLfmActivity,
                setShowLfmActivity,
                isMultiColumn,
                setIsMultiColumn,
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
