import { useEffect, useState } from "react"
import { PopulationPointInTime } from "../../models/Game"
import {
    getPopulationData1Week,
    getPopulationData1Month,
} from "../../services/populationService.ts"
import logMessage from "../../utils/logUtils"

const useTrendsData = () => {
    const [populationData1Week, setPopulationData1Week] = useState<
        PopulationPointInTime[]
    >([])
    const [populationData1Month, setPopulationData1Month] = useState<
        PopulationPointInTime[]
    >([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch data logic here
    useEffect(() => {
        const controller = new AbortController()

        ;(async () => {
            try {
                setLoading(true)
                const [populationData1Week, populationData1Month] =
                    await Promise.all([
                        getPopulationData1Week(controller.signal),
                        getPopulationData1Month(controller.signal),
                    ])

                if (!controller.signal.aborted) {
                    setPopulationData1Week(populationData1Week.data)
                    setPopulationData1Month(populationData1Month.data)
                }
            } catch (e) {
                if (!controller.signal.aborted) {
                    const errorMessage =
                        e instanceof Error ? e.message : String(e)
                    setError(errorMessage)
                    logMessage("Error fetching trends data", "error", {
                        metadata: { error: errorMessage },
                    })
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        })()
    }, [])

    return {
        populationData1Week,
        populationData1Month,
        loading,
        error,
    }
}

export default useTrendsData
