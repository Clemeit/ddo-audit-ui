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
import { LocalStorageEntry } from "../models/LocalStorage.ts"

interface AreaContextProps {
    areas: { [key: number]: Area }
    reloadAreas: () => void
}

const AreaContext = createContext<AreaContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
}

export const AreaProvider = ({ children }: Props) => {
    const [cachedAreas, setCachedAreas] = useState<{ [key: number]: Area }>({})
    const [areas, setAreas] = useState<{ [key: number]: Area }>({})

    const populateAreas = async (fetchFromServer: boolean = false) => {
        let cachedAreas: LocalStorageEntry<Area[]>
        let lastUpdated: Date
        try {
            cachedAreas = getAreasFromLocalStorage()
            lastUpdated = new Date(cachedAreas.updatedAt || 0)
            const cachedAreasObj = cachedAreas.data.reduce(
                (acc, quest) => {
                    acc[quest.id] = quest
                    return acc
                },
                {} as { [key: number]: Area }
            )
            setCachedAreas(cachedAreasObj)
        } catch (error) {
            logMessage("Error parsing areas from local storage", "error", {
                metadata: {
                    error:
                        error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                },
            })
        }

        try {
            if (
                fetchFromServer ||
                !cachedAreas ||
                !cachedAreas.data ||
                !cachedAreas.updatedAt ||
                new Date().getTime() - lastUpdated.getTime() >
                    CACHED_AREAS_EXPIRY_TIME
            ) {
                const result = await getRequest<AreaApiResponse>("areas", {
                    params: { force: fetchFromServer },
                })
                const areaObj = result.data.reduce(
                    (acc, area) => {
                        acc[area.id] = area
                        return acc
                    },
                    {} as { [key: number]: Area }
                )
                setAreas(areaObj)
                setAreasInLocalStorage(result.data)
            }
        } catch (error) {
            logMessage("Error fetching areas from server", "error", {
                metadata: {
                    error:
                        error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                    cachedQuests: {
                        length: cachedAreas?.data?.length,
                        lastupdated: lastUpdated,
                    },
                },
            })
        }
    }

    useEffect(() => {
        populateAreas()
    }, [])

    const areasMemoized = React.useMemo(() => {
        if (Object.keys(areas).length > 0) return { areas: areas }
        return { areas: cachedAreas }
    }, [areas, cachedAreas])

    return (
        <AreaContext.Provider
            value={{
                areas: areasMemoized.areas,
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
