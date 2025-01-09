import React, { createContext, useContext, useState, ReactNode } from "react"
import {
    DEFAULT_BASE_FONT_SIZE,
    DEFAULT_LFM_PANEL_WIDTH,
} from "../constants/lfmPanel.ts"

// TODO: move this out
interface SortType {
    type: string
    direction: string
}

interface LfmContextProps {
    fontSize: number
    setFontSize: (size: number) => void
    panelWidth: number
    setPanelWidth: (size: number) => void
    showBoundingBoxes: boolean
    setShowBoundingBoxes: (show: boolean) => void
    sortBy: SortType
    setSortBy: (sort: SortType) => void
}

const LfmContext = createContext<LfmContextProps | undefined>(undefined)

export const LfmProvider = ({ children }: { children: ReactNode }) => {
    const [fontSize, setFontSize] = useState<number>(DEFAULT_BASE_FONT_SIZE)
    const [panelWidth, setPanelWidth] = useState<number>(
        DEFAULT_LFM_PANEL_WIDTH
    )
    const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(false)

    // TODO: store all of the filters and sorting options here
    const [sortBy, setSortBy] = useState<SortType>({
        type: "level",
        direction: "asc",
    })

    return (
        <LfmContext.Provider
            value={{
                fontSize,
                setFontSize,
                panelWidth,
                setPanelWidth,
                showBoundingBoxes,
                setShowBoundingBoxes,
                sortBy,
                setSortBy,
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
