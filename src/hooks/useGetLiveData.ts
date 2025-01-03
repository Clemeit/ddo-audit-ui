import { useState, useEffect, useCallback } from "react"
import { LoadingState, ApiState } from "../models/Api.ts"
import { getServerInfo } from "../services/gameService.ts"
import { ServerInfo } from "../models/Game.ts"

interface UseGetLiveDataParams {
    refreshInterval: number
}

const useGetLiveData = (
    { refreshInterval }: UseGetLiveDataParams = { refreshInterval: 5000 }
) => {
    const [pageLoadedAt] = useState<Date>(new Date())
    const [serverInfo, setServerInfo] = useState<
        ApiState<Record<string, ServerInfo>>
    >({
        data: null,
        loadingState: LoadingState.Initial,
        error: null,
    })

    const mustReload =
        new Date().getTime() - pageLoadedAt.getTime() > 1000 * 60 * 60 * 12

    const fetchServerInfo = useCallback(() => {
        if (mustReload) return

        getServerInfo()
            .then((response) => {
                const responseData = response.data
                const serversDict = responseData.data.servers
                setServerInfo({
                    data: serversDict,
                    loadingState: LoadingState.Loaded,
                    error: null,
                })
            })
            .catch((error: { message: string }) => {
                setServerInfo({
                    data: null,
                    loadingState: LoadingState.Error,
                    error: error.message,
                })
            })
    }, [mustReload])

    useEffect(() => {
        fetchServerInfo()
        const interval = setInterval(fetchServerInfo, refreshInterval)
        return () => clearInterval(interval)
    }, [fetchServerInfo, refreshInterval])

    return {
        mustReload,
        serverInfo,
    }
}

export default useGetLiveData
