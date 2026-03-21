import React, { createContext, useState, useEffect, useContext } from "react"
import { getTimezone, setTimezone } from "../utils/localStorage"

interface AppContextProps {
    isFullScreen: boolean
    setIsFullScreen: (fullScreen: boolean) => void
    timezoneOverride: string
    setTimezoneOverride: (timezone: string) => void
}

const AppContext = createContext<AppContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
}

export const AppProvider = ({ children }: Props) => {
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [timezoneOverride, setTimezoneOverride] = useState<string>(() => {
        const savedTimezone = getTimezone()
        return savedTimezone !== undefined ? savedTimezone : ""
    })

    useEffect(() => {
        setTimezone(timezoneOverride || "")
    }, [timezoneOverride])

    return (
        <AppContext.Provider
            value={{
                isFullScreen,
                setIsFullScreen,
                timezoneOverride,
                setTimezoneOverride,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error("useAppContext must be used within a AppContext")
    }
    return context
}
