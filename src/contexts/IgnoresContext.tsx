// Check cache. If cache is not stale (24 hours), return cached data.
// Otherwise, fetch data and populate cache.
import React, { createContext, useState, useEffect, useContext } from "react"
import {
    setValue,
    getValue as getValueFromLocalStorage,
} from "../utils/localStorage.ts"

interface IgnoresContextProps {
    enableIgnores: boolean
    setEnableIgnores: (enable: boolean) => void
    hideLfmsPostedByIgnores: boolean
    setHideLfmsPostedByIgnores: (hide: boolean) => void
    hideLfmsContainingIgnores: boolean
    setHideLfmsContainingIgnores: (hide: boolean) => void
    hideIgnoresFromWho: boolean
    setHideIgnoresFromWho: (hide: boolean) => void
    showIndicatorForLfmsPostedByIgnores: boolean
    setShowIndicatorForLfmsPostedByIgnores: (show: boolean) => void
    showIndicatorForLfmsContainingIgnores: boolean
    setShowIndicatorForLfmsContainingIgnores: (show: boolean) => void
}

const IgnoresContext = createContext<IgnoresContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
}

export const IgnoresProvider = ({ children }: Props) => {
    const settingsStorageKey = "ignores-settings"
    const [enableIgnores, setEnableIgnores] = useState<boolean>(true)
    const [hideLfmsPostedByIgnores, setHideLfmsPostedByIgnores] =
        useState<boolean>(false)
    const [hideLfmsContainingIgnores, setHideLfmsContainingIgnores] =
        useState<boolean>(false)
    const [hideIgnoresFromWho, setHideIgnoresFromWho] = useState<boolean>(false)
    const [
        showIndicatorForLfmsPostedByIgnores,
        setShowIndicatorForLfmsPostedByIgnores,
    ] = useState<boolean>(false)
    const [
        showIndicatorForLfmsContainingIgnores,
        setShowIndicatorForLfmsContainingIgnores,
    ] = useState<boolean>(false)

    useEffect(() => {
        let settings: any = null
        try {
            settings = getValueFromLocalStorage(settingsStorageKey)
        } catch (e) {
            console.error(
                `Error reading settings from localStorage with key "${settingsStorageKey}":`,
                e
            )
        }
        if (settings) {
            setEnableIgnores(settings.enableIgnores ?? true)
            setHideLfmsPostedByIgnores(settings.hideLfmsPostedByIgnores ?? true)
            setHideLfmsContainingIgnores(
                settings.hideLfmsContainingIgnores ?? true
            )
            setHideIgnoresFromWho(settings.hideIgnoresFromWho ?? true)
            setShowIndicatorForLfmsPostedByIgnores(
                settings.showIndicatorForLfmsPostedByIgnores ?? true
            )
            setShowIndicatorForLfmsContainingIgnores(
                settings.showIndicatorForLfmsContainingIgnores ?? true
            )
        }
    }, [])

    useEffect(() => {
        setValue<any>(settingsStorageKey, {
            enableIgnores,
            hideLfmsPostedByIgnores,
            hideLfmsContainingIgnores,
            hideIgnoresFromWho,
            showIndicatorForLfmsPostedByIgnores,
            showIndicatorForLfmsContainingIgnores,
        })
    }, [
        enableIgnores,
        hideLfmsPostedByIgnores,
        hideLfmsContainingIgnores,
        hideIgnoresFromWho,
        showIndicatorForLfmsPostedByIgnores,
        showIndicatorForLfmsContainingIgnores,
    ])

    return (
        <IgnoresContext.Provider
            value={{
                enableIgnores,
                setEnableIgnores,
                hideLfmsPostedByIgnores,
                setHideLfmsPostedByIgnores,
                hideLfmsContainingIgnores,
                setHideLfmsContainingIgnores,
                hideIgnoresFromWho,
                setHideIgnoresFromWho,
                showIndicatorForLfmsPostedByIgnores,
                setShowIndicatorForLfmsPostedByIgnores,
                showIndicatorForLfmsContainingIgnores,
                setShowIndicatorForLfmsContainingIgnores,
            }}
        >
            {children}
        </IgnoresContext.Provider>
    )
}

export const useIgnoresContext = () => {
    const context = useContext(IgnoresContext)
    if (!context) {
        throw new Error(
            "useIgnoresContext must be used within an IgnoresContext"
        )
    }
    return context
}
