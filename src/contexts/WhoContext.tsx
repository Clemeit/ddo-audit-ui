import React, { createContext, useContext, useState, ReactNode } from "react"
import { CLASS_LIST_LOWER, MAX_LEVEL, MIN_LEVEL } from "../constants/game.ts"
import { CharacterSortBy, CharacterSortType } from "../models/Character.ts"
import { DEFAULT_WHO_PANEL_WIDTH } from "../constants/whoPanel.ts"

interface WhoContextProps {
    stringFilter: string
    setStringFilter: (state: string) => void
    classNameFilter: string[]
    setClassNameFilter: (state: string[]) => void
    minLevel: number
    setMinLevel: (state: number) => void
    maxLevel: number
    setMaxLevel: (state: number) => void
    isGroupView: boolean
    setIsGroupView: (state: boolean) => void
    shouldIncludeRegion: boolean
    setShouldIncludeRegion: (state: boolean) => void
    isExactMatch: boolean
    setIsExactMatch: (state: boolean) => void
    sortBy: CharacterSortBy
    setSortBy: (state: CharacterSortBy) => void
    panelWidth: number
    setPanelWidth: (state: number) => void
    panelHeight: number
    setPanelHeight: (state: number) => void
    isDynamicWidth: boolean
    setIsDynamicWidth: (state: boolean) => void
}

const WhoContext = createContext<WhoContextProps | undefined>(undefined)

export const WhoProvider = ({ children }: { children: ReactNode }) => {
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
        direction: "asc",
    })
    const [panelWidth, setPanelWidth] = useState<number>(
        DEFAULT_WHO_PANEL_WIDTH
    )
    const [panelHeight, setPanelHeight] = useState<number>(0)
    const [isDynamicWidth, setIsDynamicWidth] = useState<boolean>(false)

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
