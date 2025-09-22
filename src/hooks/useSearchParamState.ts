import { useSearchParams } from "react-router-dom"
import { useCallback } from "react"

export enum SearchParamType {
    SECONDARY_PANEL_TYPE = "secondary-panel-type",
    SECONDARY_PANEL_SERVER = "secondary-panel-server",
    INITIAL_SEARCH_QUERY = "initial-search-query",
    GUILD_NAME = "guild-name",
    SERVER_NAME = "server-name",
}

interface SearchParam {
    searchParamType: SearchParamType
    value: string | null
}

interface Return {
    getSearchParam: (searchParamType: SearchParamType) => string | null
    setSearchParam: (
        searchParamType: SearchParamType,
        value: string | null
    ) => void
    setSearchParams: (params: SearchParam[]) => void
}

const useSearchParamState = (): Return => {
    const [sp, setSp] = useSearchParams()

    const getSearchParam = useCallback(
        (searchParamType: SearchParamType) => {
            return sp.get(searchParamType)
        },
        [sp]
    )

    const setSearchParam = useCallback(
        (searchParamType: SearchParamType, value: string | null) => {
            setSp((prev) => {
                const newParams = new URLSearchParams(prev)
                if (value === null || value === undefined || value === "") {
                    newParams.delete(searchParamType)
                } else {
                    newParams.set(searchParamType, value)
                }
                return newParams
            })
        },
        [setSp]
    )

    const setSearchParams = useCallback(
        (params: SearchParam[]) => {
            setSp((prev) => {
                const newParams = new URLSearchParams(prev)
                params.forEach(({ searchParamType, value }) => {
                    if (value === null || value === undefined || value === "") {
                        newParams.delete(searchParamType)
                    } else {
                        newParams.set(searchParamType, value)
                    }
                })
                return newParams
            })
        },
        [setSp]
    )

    return {
        getSearchParam,
        setSearchParam,
        setSearchParams,
    }
}

export default useSearchParamState
