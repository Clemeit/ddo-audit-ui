import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react"
import { CLASS_LIST_LOWER, MAX_LEVEL, MIN_LEVEL } from "../constants/game.ts"
import { CharacterSortBy, CharacterSortType } from "../models/Character.ts"
import { setValue, getValue } from "../utils/localStorage.ts"
import {
    DEFAULT_REFRESH_RATE,
    DEFAULT_WHO_PANEL_WIDTH,
} from "../constants/whoPanel.ts"

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
    applyFriendsListSettings: boolean
    setApplyFriendsListSettings: React.Dispatch<React.SetStateAction<boolean>>
    applyIgnoreListSettings: boolean
    setApplyIgnoreListSettings: React.Dispatch<React.SetStateAction<boolean>>
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
    const [applyFriendsListSettings, setApplyFriendsListSettings] =
        useState<boolean>(true)
    const [applyIgnoreListSettings, setApplyIgnoreListSettings] =
        useState<boolean>(true)
    const [pinRegisteredCharacters, setPinRegisteredCharacters] =
        useState<boolean>(false)
    const [pinFriends, setPinFriends] = useState<boolean>(false)
    const [alwaysShowRegisteredCharacters, setAlwaysShowRegisteredCharacters] =
        useState<boolean>(false)
    const [alwaysShowFriends, setAlwaysShowFriends] = useState<boolean>(false)

    const loadSettingsFromLocalStorage = () => {
        const settings = getValue<any>(settingsStorageKey)
        if (settings) {
            try {
                if (settings.shouldSaveSettings) {
                    if (settings.shouldSaveStringFilter)
                        setStringFilter(settings.stringFilter)
                    if (settings.shouldSaveClassFilter)
                        setClassNameFilter(settings.classNameFilter)
                    if (settings.shouldSaveLevelFilter)
                        setMinLevel(parseInt(settings.minLevel))
                    if (settings.shouldSaveLevelFilter)
                        setMaxLevel(parseInt(settings.maxLevel))
                    if (settings.shouldSaveGroupView)
                        setIsGroupView(settings.isGroupView)
                    setShouldIncludeRegion(settings.shouldIncludeRegion)
                    if (settings.shouldSaveExactMatch)
                        setIsExactMatch(settings.isExactMatch)
                    if (settings.shouldSaveSortBy) setSortBy(settings.sortBy)
                    setPanelWidth(settings.panelWidth)
                    setIsDynamicWidth(settings.isDynamicWidth)
                }
                setShouldSaveSettings(settings.shouldSaveSettings)
                setShouldSaveClassFilter(settings.shouldSaveClassFilter)
                setShouldSaveStringFilter(settings.shouldSaveStringFilter)
                setShouldSaveLevelFilter(settings.shouldSaveLevelFilter)
                setShouldSaveSortBy(settings.shouldSaveSortBy)
                setShouldSaveGroupView(settings.shouldSaveGroupView)
                setShouldSaveExactMatch(settings.shouldSaveExactMatch)
                setShowInQuestIndicator(settings.showInQuestIndicator)
                setRefreshInterval(settings.refreshInterval)
                setApplyFriendsListSettings(settings.applyFriendsListSettings)
                setApplyIgnoreListSettings(settings.applyIgnoreListSettings)
                setPinFriends(settings.pinFriends)
                setPinRegisteredCharacters(settings.pinRegisteredCharacters)
                setAlwaysShowRegisteredCharacters(
                    settings.alwaysShowRegisteredCharacters
                )
                setAlwaysShowFriends(settings.alwaysShowFriends)
            } catch (e) {
                console.error(e)
            }
        }
    }

    useEffect(() => {
        loadSettingsFromLocalStorage()
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (!isLoaded) return
        setValue(settingsStorageKey, {
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
            applyFriendsListSettings,
            applyIgnoreListSettings,
            pinRegisteredCharacters,
            pinFriends,
            alwaysShowRegisteredCharacters,
            alwaysShowFriends,
        })
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
        applyFriendsListSettings,
        applyIgnoreListSettings,
        pinRegisteredCharacters,
        pinFriends,
        alwaysShowRegisteredCharacters,
        alwaysShowFriends,
    ])

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
                applyFriendsListSettings,
                setApplyFriendsListSettings,
                applyIgnoreListSettings,
                setApplyIgnoreListSettings,
                pinRegisteredCharacters,
                setPinRegisteredCharacters,
                alwaysShowRegisteredCharacters,
                setAlwaysShowRegisteredCharacters,
                pinFriends,
                setPinFriends,
                alwaysShowFriends,
                setAlwaysShowFriends,
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
