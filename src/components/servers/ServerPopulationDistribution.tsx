import { useEffect, useMemo, useRef, useState } from "react"
import GenericPie from "../charts/GenericPie"
import {
    convertAveragePopulationDataToNivoFormat,
    NivoPieSlice,
} from "../../utils/nivoUtils"
import Stack from "../global/Stack"
import {
    AveragePopulationData,
    AveragePopulationEndpointSchema,
} from "../../models/Population.ts"
import {
    DataTypeFilterEnum,
    RangeEnum,
    ServerFilterEnum,
} from "../../models/Common.ts"
import {
    getAveragePopulationWeek,
    getAveragePopulationQuarter,
    getAveragePopulationDay,
    getAveragePopulationMonth,
    getAveragePopulationYear,
} from "../../services/populationService.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import {
    SERVERS_64_BITS_LOWER,
    SERVERS_32_BITS_LOWER,
} from "../../constants/servers"
import FilterSelection from "../charts/FilterSelection.tsx"

const ServerPopulationDistribution = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [range, setRange] = useState<RangeEnum>(RangeEnum.QUARTER)
    const [serverFilter, setServerFilter] = useState<ServerFilterEnum>(
        ServerFilterEnum.ONLY_64_BIT
    )
    const [dataTypeFilter, setDataTypeFilter] = useState<DataTypeFilterEnum>(
        DataTypeFilterEnum.CHARACTERS
    )
    const [dataMap, setDataMap] = useState<
        Partial<Record<RangeEnum, AveragePopulationData | undefined>>
    >({})
    const lastRange = useRef<RangeEnum | undefined>(range)

    const descriptionFormatter = (value: number, total: number) => {
        return `${value.toFixed(1)} average ${dataTypeFilter} (${((value / total) * 100).toFixed(1)}%)`
    }

    const rangeToFetchMap = useMemo(
        () => ({
            [RangeEnum.DAY]: (signal: AbortSignal) =>
                getAveragePopulationDay(signal),
            [RangeEnum.WEEK]: (signal: AbortSignal) =>
                getAveragePopulationWeek(signal),
            [RangeEnum.MONTH]: (signal: AbortSignal) =>
                getAveragePopulationMonth(signal),
            [RangeEnum.QUARTER]: (signal: AbortSignal) =>
                getAveragePopulationQuarter(signal),
            [RangeEnum.YEAR]: (signal: AbortSignal) =>
                getAveragePopulationYear(signal),
        }),
        []
    )

    useEffect(() => {
        if (!range) return
        const controller = new AbortController()
        const fetchAverageData = async () => {
            setIsLoading(true)
            try {
                const result = await rangeToFetchMap[range](controller.signal)
                if (!controller.signal.aborted) {
                    setDataMap((prev) => ({
                        ...prev,
                        [range]: result?.data,
                    }))
                    setIsError(false)
                }
            } catch {
                setIsError(true)
            } finally {
                if (!controller.signal.aborted) setIsLoading(false)
            }
        }
        if (dataMap?.[range] === undefined) fetchAverageData()
        return () => controller.abort()
    }, [range])

    const nivoData: NivoPieSlice[] = useMemo(() => {
        if (!range) return []
        let averageData = dataMap?.[range]
        if (averageData) {
            lastRange.current = range
        } else {
            averageData = dataMap?.[lastRange.current]
        }
        if (serverFilter === ServerFilterEnum.ONLY_64_BIT) {
            averageData = Object.fromEntries(
                Object.entries(averageData || {}).filter(([serverName]) =>
                    SERVERS_64_BITS_LOWER.includes(serverName.toLowerCase())
                )
            )
        } else if (serverFilter === ServerFilterEnum.ONLY_32_BIT) {
            averageData = Object.fromEntries(
                Object.entries(averageData || {}).filter(([serverName]) =>
                    SERVERS_32_BITS_LOWER.includes(serverName.toLowerCase())
                )
            )
        }
        return convertAveragePopulationDataToNivoFormat(
            averageData,
            dataTypeFilter
        )
    }, [range, serverFilter, dataMap, dataTypeFilter])

    return (
        <>
            <FilterSelection
                range={range}
                setRange={setRange}
                serverFilter={serverFilter}
                setServerFilter={setServerFilter}
                dataTypeFilter={dataTypeFilter}
                setDataTypeFilter={setDataTypeFilter}
            />
            <GenericPie
                nivoData={nivoData}
                showLegend
                descriptionFormatter={descriptionFormatter}
            />
        </>
    )
}

export default ServerPopulationDistribution
