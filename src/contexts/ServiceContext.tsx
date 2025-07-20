import React, { createContext, useState, useEffect, useContext } from "react"
import { ConfigEndpointResponse } from "../models/Config"
import { PageMessageEndpointResponse } from "../models/Service"

interface ServiceContextProps {
    theme: string
    toggleTheme: () => void
    isFullScreen: boolean
    setIsFullScreen: (fullScreen: boolean) => void
}

const ServiceContext = createContext<ServiceContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
}

export const ServiceProvider = ({ children }: Props) => {
    const [config, setConfig] = useState<ConfigEndpointResponse | null>(null)
    const [pageMessages, setPageMessages] =
        useState<PageMessageEndpointResponse | null>(null)

    useEffect(() => {}, [])
}

export const useServiceContext = () => {
    const context = useContext(ServiceContext)
    if (!context) {
        throw new Error(
            "useServiceContext must be used within a ServiceContext"
        )
    }
    return context
}
