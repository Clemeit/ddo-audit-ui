import { useEffect, useMemo, useRef, useState } from "react"
import GenericPie from "../charts/GenericPie"
import {
    convertAveragePopulationDataToNivoFormat,
    convertByDayOfWeekPopulationDataToNivoFormat,
    convertByHourPopulationDataToNivoFormat,
    NivoBarSlice,
    NivoPieSlice,
} from "../../utils/nivoUtils"
import Stack from "../global/Stack"
import {
    DataTypeFilterEnum,
    PopulationByHourData,
    PopulationByHourEndpointSchema,
    RangeEnum,
    ServerFilterEnum,
} from "../../models/Population.ts"
import {
    getPopulationByHourForDay,
    getPopulationByHourForWeek,
    getPopulationByHourForMonth,
    getPopulationByHourForQuarter,
    getPopulationByHourForYear,
    getPopulationByDayOfWeekForRange,
} from "../../services/populationService.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import {
    SERVERS_64_BITS_LOWER,
    SERVERS_32_BITS_LOWER,
} from "../../constants/servers"
import GenericLine from "../charts/GenericLine.tsx"
import {
    BY_HOUR_CHART_X_SCALE,
    BY_HOUR_LINE_CHART_AXIS_BOTTOM,
} from "../charts/lineChartConfig.ts"
import GenericBar from "../charts/GenericBar.tsx"
import FilterSelection from "../charts/FilterSelection.tsx"

const DailyPopulationDistribution = () => {
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
        Partial<Record<RangeEnum, PopulationByHourData | undefined>>
    >({})
    const [displayType, setDisplayType] = useState<string>("Stacked")
    const lastRange = useRef<RangeEnum | undefined>(range)

    const RANGE_OPTIONS = [
        RangeEnum.WEEK,
        RangeEnum.MONTH,
        RangeEnum.QUARTER,
        RangeEnum.YEAR,
    ]

    const descriptionFormatter = (value: number, total: number) => {
        return `${value.toFixed(1)} average characters (${((value / total) * 100).toFixed(1)}%)`
    }

    const rangeToFetchMap = useMemo(
        () => ({
            [RangeEnum.DAY]: (signal: AbortSignal) =>
                getPopulationByDayOfWeekForRange(RangeEnum.DAY, signal),
            [RangeEnum.WEEK]: (signal: AbortSignal) =>
                getPopulationByDayOfWeekForRange(RangeEnum.WEEK, signal),
            [RangeEnum.MONTH]: (signal: AbortSignal) =>
                getPopulationByDayOfWeekForRange(RangeEnum.MONTH, signal),
            [RangeEnum.QUARTER]: (signal: AbortSignal) =>
                getPopulationByDayOfWeekForRange(RangeEnum.QUARTER, signal),
            [RangeEnum.YEAR]: (signal: AbortSignal) =>
                getPopulationByDayOfWeekForRange(RangeEnum.YEAR, signal),
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

    const nivoData: NivoBarSlice[] = useMemo(() => {
        if (!range) return []
        let data = dataMap?.[range]
        if (data) {
            lastRange.current = range
        } else {
            data = dataMap?.[lastRange.current]
        }
        if (serverFilter === ServerFilterEnum.ONLY_64_BIT) {
            data = Object.fromEntries(
                Object.entries(data || {}).filter(([serverName]) =>
                    SERVERS_64_BITS_LOWER.includes(serverName.toLowerCase())
                )
            )
        } else if (serverFilter === ServerFilterEnum.ONLY_32_BIT) {
            data = Object.fromEntries(
                Object.entries(data || {}).filter(([serverName]) =>
                    SERVERS_32_BITS_LOWER.includes(serverName.toLowerCase())
                )
            )
        }
        const out = convertByDayOfWeekPopulationDataToNivoFormat(
            data,
            dataTypeFilter
        )
        console.log("Nivo data:", out)
        return out
    }, [range, serverFilter, dataMap, dataTypeFilter])

    return (
        <>
            <FilterSelection
                range={range}
                setRange={setRange}
                serverFilter={serverFilter}
                setServerFilter={setServerFilter}
                rangeOptions={RANGE_OPTIONS}
                dataTypeFilter={dataTypeFilter}
                displayType={displayType}
                setDisplayType={setDisplayType}
                setDataTypeFilter={setDataTypeFilter}
            />
            <GenericBar
                nivoData={nivoData}
                showLegend
                groupMode={displayType === "Grouped" ? "grouped" : "stacked"}
                // xScale={BY_HOUR_CHART_X_SCALE}
                // axisBottom={BY_HOUR_LINE_CHART_AXIS_BOTTOM}
                // tooltipTitleFormatter={(hour: any) =>
                //     `Average Characters at ${hour}:00`
                // }
                // yFormatter={(value: number) => `${value.toFixed()}`}
            />
        </>
    )
}

export default DailyPopulationDistribution
