// Check cache. If cache is not stale (24 hours), return cached data.
// Otherwise, fetch data and populate cache.
import React, { createContext, useState, useEffect, useContext } from "react"
import { Area, AreaApiResponse } from "../models/Area.ts"
import {
    getAreas as getAreasFromLocalStorage,
    setAreas as setAreasInLocalStorage,
} from "../utils/localStorage.ts"
import { getRequest } from "../services/apiHelper.ts"
import { CACHED_AREAS_EXPIRY_TIME } from "../constants/client.ts"

interface AreaContextProps {
    areas: { [key: number]: Area }
}

const AreaContext = createContext<AreaContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
}

export const AreaProvider = ({ children }: Props) => {
    const [areas, setAreas] = useState<{ [key: number]: Area }>({})

    const populateAreas = async () => {
        // Get from cache
        const cachedAreas = getAreasFromLocalStorage()
        const lastUpdated = new Date(cachedAreas.updatedAt || 0)
        if (
            !cachedAreas ||
            !cachedAreas.data ||
            new Date().getTime() - lastUpdated.getTime() >
                CACHED_AREAS_EXPIRY_TIME
        ) {
            // Cache is stale
            try {
                const result = await getRequest<AreaApiResponse>("areas")
                setAreas(
                    result.data.reduce((acc: { [key: number]: Area }, area) => {
                        acc[area.id] = area
                        return acc
                    }, {})
                )
                setAreasInLocalStorage(result.data)
            } catch {
                setAreas({})
            }
        } else {
            // Cache OK
            setAreas(
                cachedAreas.data.reduce(
                    (acc: { [key: number]: Area }, area) => {
                        acc[area.id] = area
                        return acc
                    },
                    {}
                )
            )
        }
    }

    useEffect(() => {
        populateAreas()
    }, [])

    return (
        <AreaContext.Provider value={{ areas }}>
            {children}
        </AreaContext.Provider>
    )
}

export const useAreaContext = () => {
    const context = useContext(AreaContext)
    if (!context) {
        throw new Error("useAreaContext must be used within an AreaContext")
    }
    return context
}
