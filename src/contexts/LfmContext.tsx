import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react"
import {
    DEFAULT_BASE_FONT_SIZE,
    DEFAULT_LFM_PANEL_WIDTH,
} from "../constants/lfmPanel.ts"
import { useThemeContext } from "./ThemeContext.tsx"
import { setValue, getValue } from "../utils/localStorage.ts"
import { LfmSortType } from "../models/Lfm.ts"
import { MAX_LEVEL, MIN_LEVEL } from "../constants/game.ts"

interface LfmContextProps {
    minLevel: number
    setMinLevel: (level: number) => void
    maxLevel: number
    setMaxLevel: (level: number) => void
    filterByMyLevel: boolean
    setFilterByMyLevel: (filter: boolean) => void
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
    resetAll: () => void
}

const LfmContext = createContext<LfmContextProps | undefined>(undefined)

export const LfmProvider = ({ children }: { children: ReactNode }) => {
    const settingsStorageKey = "lfm-settings"
    const [isLoaded, setIsLoaded] = useState<boolean>(false)

    // debug:
    const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(false)

    const { setIsFullScreen } = useThemeContext()

    // TODO: store all of the optionsl and filters here
    // filter:
    const [minLevel, setMinLevel] = useState<number>(MIN_LEVEL)
    const [maxLevel, setMaxLevel] = useState<number>(MAX_LEVEL)
    const [filterByMyLevel, setFilterByMyLevel] = useState<boolean>(false)
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
        direction: "asc",
    })

    // tools:
    const [showRaidTimerIndicator, setShowRaidTimerIndicator] =
        useState<boolean>(true)
    const [showMemberCount, setShowMemberCount] = useState<boolean>(true)
    const [showQuestGuesses, setShowQuestGuesses] = useState<boolean>(true)
    const [showQuestTips, setShowQuestTips] = useState<boolean>(true)
    const [showCharacterGuildNames, setShowCharacterGuildNames] =
        useState<boolean>(true)

    const loadSettingsFromLocalStorage = () => {
        const settings = getValue(settingsStorageKey)
        if (settings) {
            setMinLevel(settings.minLevel)
            setMaxLevel(settings.maxLevel)
            setFilterByMyLevel(settings.filterByMyLevel)
            setShowNotEligible(settings.showNotEligible)
            setFontSize(settings.fontSize)
            setPanelWidth(settings.panelWidth)
            setShowBoundingBoxes(settings.showBoundingBoxes)
            setSortBy(settings.sortBy)
            setIsDynamicWidth(settings.isDynamicWidth)
            setShowRaidTimerIndicator(settings.showRaidTimerIndicator)
            setShowMemberCount(settings.showMemberCount)
            setShowQuestGuesses(settings.showQuestGuesses)
            setShowQuestTips(settings.showQuestTips)
            setShowCharacterGuildNames(settings.showCharacterGuildNames)
        }
    }

    useEffect(() => {
        loadSettingsFromLocalStorage()
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (!isLoaded) return
        setValue(settingsStorageKey, {
            minLevel,
            maxLevel,
            filterByMyLevel,
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
        })
    }, [
        minLevel,
        maxLevel,
        filterByMyLevel,
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
    ])

    const resetAll = () => {
        setFontSize(DEFAULT_BASE_FONT_SIZE)
        setPanelWidth(DEFAULT_LFM_PANEL_WIDTH)
        setShowBoundingBoxes(false)
        setSortBy({ type: "level", direction: "asc" })
        setIsDynamicWidth(false)
        setIsFullScreen(false)
    }

    useEffect(() => {
        if (!isDynamicWidth) {
            setPanelWidth(DEFAULT_LFM_PANEL_WIDTH)
        }
    }, [isDynamicWidth])

    return (
        <LfmContext.Provider
            value={{
                minLevel,
                setMinLevel,
                maxLevel,
                setMaxLevel,
                filterByMyLevel,
                setFilterByMyLevel,
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
                resetAll,
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
