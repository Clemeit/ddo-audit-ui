import React, { createContext, useState, useEffect, useContext } from "react"

interface ThemeContextProps {
    theme: string
    toggleTheme: () => void
    isFullScreen: boolean
    setIsFullScreen: (fullScreen: boolean) => void
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
}

export const ThemeProvider = ({ children }: Props) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "dark-theme"
    })
    const [isFullScreen, setIsFullScreen] = useState(false)

    useEffect(() => {
        document.body.className = theme
        localStorage.setItem("theme", theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme((prevTheme) =>
            prevTheme === "light-theme" ? "dark-theme" : "light-theme"
        )
    }

    return (
        <ThemeContext.Provider
            value={{ theme, toggleTheme, isFullScreen, setIsFullScreen }}
        >
            {children}
        </ThemeContext.Provider>
    )
}

export const useThemeContext = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error("useThemeContext must be used within a ThemeContext")
    }
    return context
}
