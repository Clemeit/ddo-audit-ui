import React, { createContext, useState, useEffect, useContext } from "react"

interface MultiPanelContextProps {
    secondaryPanel: React.ReactNode | undefined
    setSecondaryPanel: React.Dispatch<
        React.SetStateAction<React.ReactNode | undefined>
    >
}

const MultiPanelContext = createContext<MultiPanelContextProps | undefined>(
    undefined
)

interface Props {
    children: React.ReactNode
}

export const MultiPanelProvider = ({ children }: Props) => {
    const [secondaryPanel, setSecondaryPanel] = useState<
        React.ReactNode | undefined
    >(undefined)

    useEffect(() => {
        // Initialize or fetch any necessary data here
    }, [])

    return (
        <MultiPanelContext.Provider
            value={{ secondaryPanel, setSecondaryPanel }}
        >
            {children}
        </MultiPanelContext.Provider>
    )
}

export const useMultiPanelContext = () => {
    const context = useContext(MultiPanelContext)
    if (!context) {
        throw new Error(
            "useMultiPanelContext must be used within a MultiPanelContext"
        )
    }
    return context
}
