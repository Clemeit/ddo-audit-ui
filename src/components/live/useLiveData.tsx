import { useEffect, useState } from "react"
import {
    PopulationDataPoint,
    PopulationPointInTime,
} from "../../models/Game.ts"
import {
    getPopulationData1Day,
    getTotalPopulation1Month,
    getTotalPopulation1Week,
} from "../../services/gameService.ts"
import { NewsItem } from "../../models/Service.ts"
import { getNews } from "../../services/newsService.ts"

export const useLiveData = () => {
    const [populationData24Hours, setPopulationData24Hours] = useState<
        PopulationPointInTime[]
    >([])
    const [populationTotalsData1Week, setPopulationTotalsData1Week] = useState<
        Record<string, PopulationDataPoint>
    >({})
    const [populationTotalsData1Month, setPopulationTotalsData1Month] =
        useState<Record<string, PopulationDataPoint>>({})
    const [news, setNews] = useState<NewsItem[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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
                ] = await Promise.all([
                    getPopulationData1Day(controller.signal),
                    getTotalPopulation1Week(controller.signal),
                    getTotalPopulation1Month(controller.signal),
                    getNews(controller.signal),
                ])

                if (!controller.signal.aborted) {
                    setPopulationData24Hours(population24Hour.data)
                    setPopulationTotalsData1Week(populationTotals1Week.data)
                    setPopulationTotalsData1Month(populationTotals1Month.data)
                    setNews(news.data)
                }
            } catch (e) {
                if (!controller.signal.aborted) {
                    const errorMessage =
                        e instanceof Error ? e.message : String(e)
                    setError(errorMessage)
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
        loading,
        error,
    }
}
