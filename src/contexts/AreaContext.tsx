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
import logMessage from "../utils/logUtils.ts"

interface AreaContextProps {
    areas: { [key: number]: Area }
    reloadAreas: () => void
}

const AreaContext = createContext<AreaContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
}

export const AreaProvider = ({ children }: Props) => {
    const [areas, setAreas] = useState<{ [key: number]: Area }>({})

    const populateAreas = async (fetchFromServer: boolean = false) => {
        // Get from cache
        const cachedAreas = getAreasFromLocalStorage()
        const lastUpdated = new Date(cachedAreas.updatedAt || 0)
        if (
            fetchFromServer ||
            !cachedAreas ||
            !cachedAreas.data ||
            !cachedAreas.updatedAt ||
            new Date().getTime() - lastUpdated.getTime() >
                CACHED_AREAS_EXPIRY_TIME
        ) {
            // Cache is stale
            try {
                const result = await getRequest<AreaApiResponse>("areas")
                const areaObj = result.data.reduce(
                    (acc, area) => {
                        acc[area.id] = area
                        return acc
                    },
                    {} as { [key: number]: Area }
                )
                setAreas(areaObj)
                setAreasInLocalStorage(result.data)
            } catch (error) {
                setAreas({})
                logMessage("Error fetching areas", "error", {
                    metadata: {
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                        stack: error instanceof Error ? error.stack : undefined,
                    },
                })
            }
        } else {
            // Cache OK
            const areaObj = cachedAreas.data.reduce(
                (acc, area) => {
                    acc[area.id] = area
                    return acc
                },
                {} as { [key: number]: Area }
            )
            setAreas(areaObj)
        }
    }

    useEffect(() => {
        populateAreas()
    }, [])

    const areasMemoized = React.useMemo(() => ({ areas }), [areas])

    return (
        <AreaContext.Provider
            value={{
                areas: areasMemoized,
                reloadAreas: () => populateAreas(true),
            }}
        >
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
