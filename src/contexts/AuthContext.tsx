import React, { createContext, useState, useEffect, useContext } from "react"
import { getData, setData } from "../utils/localStorage"

interface AuthContextProps {
    theme: string
    toggleTheme: () => void
    isFullScreen: boolean
    setIsFullScreen: (fullScreen: boolean) => void
    timezoneOverride: string
    setTimezoneOverride: (timezone: string) => void
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
}

export const ThemeProvider = ({ children }: Props) => {
    const themeKey = "theme"

    const [theme, setTheme] = useState(() => {
        return getData<string>(themeKey) || "dark-theme"
    })
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [timezoneOverride, setTimezoneOverride] = useState<string>()

    useEffect(() => {
        document.body.className = theme
        setData<string>(themeKey, theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme((prevTheme) =>
            prevTheme === "light-theme" ? "dark-theme" : "light-theme"
        )
    }

    // timezone can be empty string to indicate no override
    const loadSettingsFromLocalStorage = () => {
        const savedTimezone = getData<string>("timezone")
        if (savedTimezone !== undefined) {
            setTimezoneOverride(savedTimezone)
        }
    }

    useEffect(() => {
        loadSettingsFromLocalStorage()
    }, [])

    useEffect(() => {
        setData<string>("timezone", timezoneOverride || "")
    }, [timezoneOverride])

    return (
        <AuthContext.Provider
            value={{
                theme,
                toggleTheme,
                isFullScreen,
                setIsFullScreen,
                timezoneOverride,
                setTimezoneOverride,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuthContext must be used within a AuthContext")
    }
    return context
}
