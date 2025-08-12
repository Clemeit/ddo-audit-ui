import { useEffect, useState } from "react"
import { getServerInfo } from "../../services/gameService.ts"
import { ServerInfoApiDataModel } from "../../models/Game.ts"

const useServersData = () => {
    const [isLoading, setIsLoading] = useState<boolean | undefined>(undefined)
    const [isError, setIsError] = useState<boolean | undefined>(undefined)
    const [serverInfo, setServerInfo] = useState<
        ServerInfoApiDataModel | undefined
    >(undefined)
    const [uniqueData, setUniqueData] = useState<any>(undefined) // TODO
    useEffect(() => {
        // Fetch data on mount.
        // 1. Server status
        // 2. Unique data
        // 3. Server population distribution

        const controller = new AbortController()

        ;(async () => {
            try {
                setIsLoading(true)
                const [serverInfoData] = await Promise.all([
                    getServerInfo(controller.signal),
                ])
                if (!controller.signal.aborted) {
                    setServerInfo(serverInfoData)
                    setIsLoading(false)
                    setIsError(false)
                }
            } catch (e) {
                setIsError(true)
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false)
                }
            }
        })()
    }, [])

    return {
        isLoading,
        isError,
        serverInfo,
        uniqueData,
    }
}

export default useServersData
