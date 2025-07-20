import { useEffect, useState } from "react"
import {
    PopulationDataPoint,
    PopulationPointInTime,
    UniquePopulationEndpointResponse,
} from "../../models/Game.ts"
import {
    getPopulationData1Day,
    getTotalPopulation1Month,
    getTotalPopulation1Week,
    getUniquePopulation1Quarter,
} from "../../services/populationService.ts"
import { NewsItem } from "../../models/Service.ts"
import { getNews } from "../../services/serviceService.ts"
import logMessage from "../../utils/logUtils.ts"

export const useLiveData = () => {
    const [populationData24Hours, setPopulationData24Hours] =
        useState<PopulationPointInTime[]>(undefined)
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
                    population24Hour,
                    populationTotals1Week,
                    populationTotals1Month,
                    news,
                    uniquePopulationQuarter,
                ] = await Promise.all([
                    getPopulationData1Day(controller.signal),
                    getTotalPopulation1Week(controller.signal),
                    getTotalPopulation1Month(controller.signal),
                    getNews(controller.signal),
                    getUniquePopulation1Quarter(controller.signal),
                ])

                if (!controller.signal.aborted) {
                    setPopulationData24Hours(population24Hour.data)
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
        populationData24Hours,
        populationTotalsData1Week,
        populationTotalsData1Month,
        news,
        uniqueDataThisQuarter,
        loading,
        error,
    }
}
