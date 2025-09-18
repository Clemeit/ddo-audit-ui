import { useEffect, useState } from "react"
import {
    PopulationDataPoint,
    UniquePopulationEndpointResponse,
} from "../../models/Game.ts"
import {
    getTotalPopulationForRange,
    getUniquePopulationForRange,
} from "../../services/populationService.ts"
import { NewsItem } from "../../models/Service.ts"
import { getNews } from "../../services/serviceService.ts"
import logMessage from "../../utils/logUtils.ts"
import { RangeEnum } from "../../models/Common.ts"

export const useLiveData = () => {
    const [populationTotalsData1Week, setPopulationTotalsData1Week] =
        useState<Record<string, PopulationDataPoint>>(undefined)
    const [populationTotalsData1Month, setPopulationTotalsData1Month] =
        useState<Record<string, PopulationDataPoint>>(undefined)
    const [uniqueDataThisQuarter, setUniqueDataThisQuarter] =
        useState<UniquePopulationEndpointResponse>(undefined)
    const [news, setNews] = useState<NewsItem[]>(undefined)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>(undefined)

    useEffect(() => {
        const controller = new AbortController()

        ;(async () => {
            try {
                setLoading(true)
                const [
                    populationTotals1Week,
                    populationTotals1Month,
                    news,
                    uniquePopulationQuarter,
                ] = await Promise.all([
                    getTotalPopulationForRange(
                        RangeEnum.WEEK,
                        controller.signal
                    ),
                    getTotalPopulationForRange(
                        RangeEnum.MONTH,
                        controller.signal
                    ),
                    getNews(controller.signal),
                    getUniquePopulationForRange(
                        RangeEnum.QUARTER,
                        controller.signal
                    ),
                ])

                if (!controller.signal.aborted) {
                    setPopulationTotalsData1Week(populationTotals1Week.data)
                    setPopulationTotalsData1Month(populationTotals1Month.data)
                    setNews(news.data)
                    setUniqueDataThisQuarter(uniquePopulationQuarter)
                }
            } catch (e) {
                if (!controller.signal.aborted) {
                    const errorMessage =
                        e instanceof Error ? e.message : String(e)
                    setError(errorMessage)
                    logMessage("Error fetching live data", "error", {
                        metadata: { error: errorMessage },
                    })
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        })()

        return () => controller.abort()
    }, [])

    return {
        populationTotalsData1Week,
        populationTotalsData1Month,
        news,
        uniqueDataThisQuarter,
        loading,
        error,
    }
}
