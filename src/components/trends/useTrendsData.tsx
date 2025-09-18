import { useEffect, useState } from "react"
import { PopulationPointInTime } from "../../models/Game"
import { getPopulationTimeseriesForRange } from "../../services/populationService.ts"
import logMessage from "../../utils/logUtils"
import { RangeEnum } from "../../models/Common.ts"

const useTrendsData = () => {
    const [populationData1Week, setPopulationData1Week] = useState<
        PopulationPointInTime[]
    >([])
    const [populationData1Month, setPopulationData1Month] = useState<
        PopulationPointInTime[]
    >([])
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState<string | null>(null)

    // Fetch data logic here
    useEffect(() => {
        const controller = new AbortController()

        ;(async () => {
            try {
                setIsLoading(true)
                const [populationData1Week, populationData1Month] =
                    await Promise.all([
                        getPopulationTimeseriesForRange(
                            RangeEnum.MONTH,
                            controller.signal
                        ),
                        getPopulationTimeseriesForRange(
                            RangeEnum.YEAR,
                            controller.signal
                        ),
                    ])

                if (!controller.signal.aborted) {
                    setPopulationData1Week(populationData1Week.data)
                    setPopulationData1Month(populationData1Month.data)
                }
            } catch (e) {
                if (!controller.signal.aborted) {
                    const errorMessage =
                        e instanceof Error ? e.message : String(e)
                    setIsError(errorMessage)
                    logMessage("Error fetching trends data", "error", {
                        metadata: { error: errorMessage },
                    })
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false)
                }
            }
        })()
    }, [])

    return {
        populationData1Week,
        populationData1Month,
        loading: isLoading,
        error: isError,
    }
}

export default useTrendsData
