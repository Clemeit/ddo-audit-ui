import React from "react"
import { useTheme } from "./components/app/ThemeContext.tsx"

const LazyPage1 = () => {
    const { theme, toggleTheme } = useTheme()
    return (
        <div>
            <span>{theme}</span>
            <button onClick={toggleTheme}>Change theme</button>
        </div>
    )
}

export default LazyPage1
