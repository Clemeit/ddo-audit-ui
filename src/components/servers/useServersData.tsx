import { useEffect, useState } from "react"
import { getServerInfo } from "../../services/gameService.ts"
import { ServerInfoApiDataModel } from "../../models/Game.ts"
import { UniquePopulationData } from "../../models/Population.ts"
import { RangeEnum } from "../../models/Common.ts"
import { getUniquePopulationForRange } from "../../services/populationService.ts"

const useServersData = () => {
    const [isLoading, setIsLoading] = useState<boolean | undefined>(undefined)
    const [isError, setIsError] = useState<boolean | undefined>(undefined)
    const [serverInfo, setServerInfo] = useState<
        ServerInfoApiDataModel | undefined
    >(undefined)
    const [uniqueData, setUniqueData] = useState<
        UniquePopulationData | undefined
    >(undefined)

    const [initialFetchMade, setInitialFetchMade] = useState<boolean>(false)
    useEffect(() => {
        const controller = new AbortController()

        const fetchData = async () => {
            setIsLoading(true)
            const [serverInfoData, uniqueData] = await Promise.all([
                getServerInfo(controller.signal),
                getUniquePopulationForRange(
                    RangeEnum.QUARTER,
                    controller.signal
                ),
            ])
            if (!controller.signal.aborted) {
                setServerInfo(serverInfoData)
                setUniqueData(uniqueData?.data)
                setIsLoading(false)
                setIsError(false)
                setInitialFetchMade(true)
            }
        }
        try {
            fetchData()
        } catch (e) {
            setIsError(true)
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false)
            }
        }
        return () => {
            controller.abort()
        }
    }, [])

    return {
        isLoading,
        isError,
        initialFetchMade,
        serverInfo,
        uniqueData,
    }
}

export default useServersData
