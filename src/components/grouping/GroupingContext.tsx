import React, { createContext, useContext, useState, ReactNode } from "react"
import {
    DEFAULT_BASE_FONT_SIZE,
    DEFAULT_GROUPING_PANEL_WIDTH,
} from "../../constants/grouping.ts"

interface GroupingContextProps {
    fontSize: number
    setFontSize: (size: number) => void
    panelWidth: number
    setPanelWidth: (size: number) => void
    showBoundingBoxes: boolean
    setShowBoundingBoxes: (show: boolean) => void
}

const GroupingContext = createContext<GroupingContextProps | undefined>(
    undefined
)

export const GroupingProvider = ({ children }: { children: ReactNode }) => {
    const [fontSize, setFontSize] = useState<number>(DEFAULT_BASE_FONT_SIZE)
    const [panelWidth, setPanelWidth] = useState<number>(
        DEFAULT_GROUPING_PANEL_WIDTH
    )
    const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(false)

    return (
        <GroupingContext.Provider
            value={{
                fontSize,
                setFontSize,
                panelWidth,
                setPanelWidth,
                showBoundingBoxes,
                setShowBoundingBoxes,
            }}
        >
            {children}
        </GroupingContext.Provider>
    )
}

export const useGroupingContext = () => {
    const context = useContext(GroupingContext)
    if (!context) {
        throw new Error(
            "useGroupingContext must be used within a GroupingProvider"
        )
    }
    return context
}
