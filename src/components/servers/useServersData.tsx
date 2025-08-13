import { useEffect, useMemo, useState } from "react"
import { getServerInfo } from "../../services/gameService.ts"
import { ServerInfoApiDataModel } from "../../models/Game.ts"
import {
    AveragePopulationData,
    AveragePopulationEndpointSchema,
    RangeEnum,
    UniquePopulationData,
} from "../../models/Population.ts"
import {
    getAveragePopulationWeek,
    getAveragePopulationQuarter,
    getUniquePopulation1Quarter,
} from "../../services/populationService.ts"

interface Props {
    serverPopulationDistributionRange?: RangeEnum
    hourlyPopulationDistributionRange?: RangeEnum
    dailyPopulationDistributionRange?: RangeEnum
    levelPopulationDistributionRange?: RangeEnum
    racePopulationDistributionRange?: RangeEnum
    primaryClassPopulationDistributionRange?: RangeEnum
}

const useServersData = ({
    serverPopulationDistributionRange,
    hourlyPopulationDistributionRange,
    dailyPopulationDistributionRange,
    levelPopulationDistributionRange,
    racePopulationDistributionRange,
    primaryClassPopulationDistributionRange,
}: Props) => {
    const [isLoading, setIsLoading] = useState<boolean | undefined>(undefined)
    const [isError, setIsError] = useState<boolean | undefined>(undefined)
    const [serverInfo, setServerInfo] = useState<
        ServerInfoApiDataModel | undefined
    >(undefined)
    const [uniqueData, setUniqueData] = useState<
        UniquePopulationData | undefined
    >(undefined)
    const [quarterlyAverageData, setQuarterlyAverageData] = useState<
        AveragePopulationData | undefined
    >(undefined)
    const [weeklyAverageData, setWeeklyAverageData] = useState<
        AveragePopulationData | undefined
    >(undefined)
    // const [hourlyData, setHourlyData] = useState<
    //     HourlyPopulationData | undefined
    // >(undefined)
    const [initialFetchMade, setInitialFetchMade] = useState<boolean>(false)
    useEffect(() => {
        const controller = new AbortController()

        const fetchData = async () => {
            setIsLoading(true)
            const [serverInfoData, uniqueData] = await Promise.all([
                getServerInfo(controller.signal),
                getUniquePopulation1Quarter(controller.signal),
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

    useEffect(() => {
        const controller = new AbortController()
        const fetchAverageData = async () => {
            let result: AveragePopulationEndpointSchema | undefined
            if (
                serverPopulationDistributionRange === RangeEnum.QUARTER &&
                !quarterlyAverageData
            ) {
                result = await getAveragePopulationQuarter(controller.signal)
                if (!controller.signal.aborted) {
                    setQuarterlyAverageData(result?.data)
                }
            } else if (
                serverPopulationDistributionRange === RangeEnum.WEEK &&
                !weeklyAverageData
            ) {
                result = await getAveragePopulationWeek(controller.signal)
                if (!controller.signal.aborted) {
                    setWeeklyAverageData(result?.data)
                }
            }
        }
        try {
            fetchAverageData()
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
    }, [serverPopulationDistributionRange])

    // useEffect(() => {
    //     const controller = new AbortController()
    //     const fetchHourlyData = async () => {
    //         if (!hourlyPopulationDistributionRange) {
    //             setHourlyData(undefined)
    //             return
    //         }
    //         let result: HourlyPopulationEndpointSchema | undefined
    //         if (hourlyPopulationDistributionRange === RangeEnum.QUARTER) {
    //             result = await getHourlyPopulationQuarter(controller.signal)
    //         } else if (hourlyPopulationDistributionRange === RangeEnum.WEEK) {
    //             result = await getHourlyPopulationWeek(controller.signal)
    //         }
    //         if (!controller.signal.aborted) {
    //             setHourlyData(result?.data)
    //         }
    //     }
    //     try {
    //         fetchHourlyData()
    //     } catch (e) {
    //         setIsError(true)
    //     } finally {
    //         if (!controller.signal.aborted) {
    //             setIsLoading(false)
    //         }
    //     }
    //     return () => {
    //         controller.abort()
    //     }
    // }, [hourlyPopulationDistributionRange])

    return {
        isLoading,
        isError,
        initialFetchMade,
        serverInfo,
        uniqueData,
        averageData: useMemo(() => {
            if (serverPopulationDistributionRange === RangeEnum.QUARTER) {
                return quarterlyAverageData
            }
            if (serverPopulationDistributionRange === RangeEnum.WEEK) {
                return weeklyAverageData
            }
            return undefined
        }, [
            serverPopulationDistributionRange,
            quarterlyAverageData,
            weeklyAverageData,
        ]),
        // hourlyData,
    }
}

export default useServersData
