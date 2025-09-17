import React, { useEffect, useMemo, useState } from "react"
import { RangeEnum, ServerFilterEnum } from "../../models/Common.ts"
import { TotalLevelDemographicApiData } from "../../models/Demographics.ts"
import { getTotalLevelDemographic } from "../../services/demographicsService.ts"
import { NivoNumberSeries } from "../../utils/nivoUtils.ts"
import FilterSelection from "../charts/FilterSelection.tsx"
import { MAX_LEVEL, MIN_LEVEL } from "../../constants/game.ts"
import { ResponsiveLine } from "@nivo/line"
import GenericLine from "../charts/GenericLine.tsx"
import {
    SERVERS_32_BITS_LOWER,
    SERVERS_64_BITS_LOWER,
} from "../../constants/servers.ts"
import { getServerColor } from "../../utils/chartUtils.ts"

const LevelPopulationDistribution = () => {
    const [dataMap, setDataMap] = useState<
        Record<RangeEnum, TotalLevelDemographicApiData | undefined>
    >({
        [RangeEnum.DAY]: undefined,
        [RangeEnum.WEEK]: undefined,
        [RangeEnum.MONTH]: undefined,
        [RangeEnum.QUARTER]: undefined,
        [RangeEnum.YEAR]: undefined,
    })
    const [rangeFilter, setRangeFilter] = useState<RangeEnum>(RangeEnum.QUARTER)
    const [serverFilter, setServerFilter] = useState<ServerFilterEnum>(
        ServerFilterEnum.ONLY_64_BIT
    )
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)

    useEffect(() => {
        const controller = new AbortController()
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const retrievedData = await getTotalLevelDemographic(
                    rangeFilter,
                    controller.signal
                )
                if (!controller.signal.aborted) {
                    setDataMap((prev) => ({
                        ...prev,
                        [rangeFilter]: retrievedData?.data,
                    }))
                    setIsError(false)
                }
            } catch (error) {
                if (!controller.signal.aborted) setIsError(true)
            } finally {
                if (!controller.signal.aborted) setIsLoading(false)
            }
        }

        if (dataMap[rangeFilter] === undefined) {
            fetchData()
        }

        return () => controller.abort()
    }, [rangeFilter])

    const nivoData: NivoNumberSeries[] = useMemo(() => {
        if (!rangeFilter || !dataMap || !dataMap[rangeFilter]) return []

        const nivoData: NivoNumberSeries[] = []
        Object.entries(dataMap[rangeFilter]).forEach(
            ([serverName, serverData]) => {
                if (
                    serverFilter === ServerFilterEnum.ONLY_32_BIT &&
                    !SERVERS_32_BITS_LOWER.includes(serverName.toLowerCase())
                ) {
                    return
                }
                if (
                    serverFilter === ServerFilterEnum.ONLY_64_BIT &&
                    !SERVERS_64_BITS_LOWER.includes(serverName.toLowerCase())
                ) {
                    return
                }
                const series: NivoNumberSeries = {
                    id: serverName,
                    data: [],
                }
                Object.entries(serverData).forEach(([totalLevel, count]) => {
                    const totalLevelConverted: number = Number(totalLevel ?? 0)
                    if (
                        totalLevelConverted >= MIN_LEVEL &&
                        totalLevelConverted <= MAX_LEVEL
                    ) {
                        series.data.push({
                            x: Number(totalLevel ?? 0),
                            y: Number(count ?? 0),
                        })
                    }
                })
                nivoData.push(series)
            }
        )

        return nivoData
    }, [rangeFilter, dataMap, serverFilter])

    return (
        <div>
            <FilterSelection
                range={rangeFilter}
                setRange={setRangeFilter}
                serverFilter={serverFilter}
                setServerFilter={setServerFilter}
            />
            <div style={{ height: "400px" }}>
                <ResponsiveLine
                    data={nivoData}
                    colors={(d) => getServerColor(d.id)}
                    enableSlices={"x" as const}
                    useMesh={true}
                />
            </div>
        </div>
    )
}

export default LevelPopulationDistribution
