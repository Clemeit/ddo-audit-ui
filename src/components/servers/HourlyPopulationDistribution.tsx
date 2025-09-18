import { useEffect, useMemo, useRef, useState } from "react"
import GenericPie from "../charts/GenericPie"
import {
    convertAveragePopulationDataToNivoFormat,
    convertByHourPopulationDataToNivoFormat,
    NivoNumberSeries,
    NivoPieSlice,
} from "../../utils/nivoUtils"
import Stack from "../global/Stack"
import {
    PopulationByHourData,
    PopulationByHourEndpointSchema,
} from "../../models/Population.ts"
import {
    DataTypeFilterEnum,
    RangeEnum,
    ServerFilterEnum,
} from "../../models/Common.ts"
import { getPopulationByHourForRange } from "../../services/populationService.ts"
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
import FilterSelection from "../charts/FilterSelection.tsx"
import { useAppContext } from "../../contexts/AppContext"
import TimezoneSelect from "../global/TimezoneSelect"
import { numberToHourOfDay } from "../../utils/dateUtils"

const HourlyPopulationDistribution = () => {
    const { timezoneOverride } = useAppContext()
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [range, setRange] = useState<RangeEnum>(RangeEnum.QUARTER)
    const [serverFilter, setServerFilter] = useState<ServerFilterEnum>(
        ServerFilterEnum.ONLY_64_BIT
    )
    const [dataMap, setDataMap] = useState<
        Partial<Record<RangeEnum, PopulationByHourData | undefined>>
    >({})
    const [dataTypeFilter, setDataTypeFilter] = useState<DataTypeFilterEnum>(
        DataTypeFilterEnum.CHARACTERS
    )
    const lastRange = useRef<RangeEnum | undefined>(range)

    const RANGE_OPTIONS = Object.values(RangeEnum)

    const rangeToFetchMap = useMemo(
        () => ({
            [RangeEnum.DAY]: (signal: AbortSignal) =>
                getPopulationByHourForRange(RangeEnum.DAY, signal),
            [RangeEnum.WEEK]: (signal: AbortSignal) =>
                getPopulationByHourForRange(RangeEnum.WEEK, signal),
            [RangeEnum.MONTH]: (signal: AbortSignal) =>
                getPopulationByHourForRange(RangeEnum.MONTH, signal),
            [RangeEnum.QUARTER]: (signal: AbortSignal) =>
                getPopulationByHourForRange(RangeEnum.QUARTER, signal),
            [RangeEnum.YEAR]: (signal: AbortSignal) =>
                getPopulationByHourForRange(RangeEnum.YEAR, signal),
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

    // Build a single-day UTC->local hour mapping for the selected timezone (ignoring day since we only chart hours)
    const utcHourToLocalHour = useMemo(() => {
        const tz =
            timezoneOverride || Intl.DateTimeFormat().resolvedOptions().timeZone
        const fmt = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            hour: "2-digit",
            hourCycle: "h23",
        })
        // Reference date: 2025-01-05 (Sunday) at 00:00 UTC, then add hour offsets
        const base = Date.UTC(2025, 0, 5, 0, 0, 0, 0)
        const mapping: number[] = []
        for (let h = 0; h < 24; h++) {
            const date = new Date(base + h * 3600_000)
            const parts = fmt.formatToParts(date)
            const hourPart = parts.find((p) => p.type === "hour")?.value
            mapping[h] = hourPart ? parseInt(hourPart, 10) : h
        }
        return mapping
    }, [timezoneOverride])

    const nivoData: NivoNumberSeries[] = useMemo(() => {
        if (!range) return []
        let averageData = dataMap?.[range]
        if (averageData) {
            lastRange.current = range
        } else {
            averageData = dataMap?.[lastRange.current]
        }
        if (!averageData) return []

        // Filter servers first
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

        // Remap UTC hours to local hours; aggregate by taking max value for collisions (DST overlap)
        const localData: PopulationByHourData = {}
        Object.entries(averageData).forEach(([serverName, hours]) => {
            localData[serverName] = {}
            Object.entries(hours).forEach(([utcHourStr, hourData]) => {
                const utcHour = parseInt(utcHourStr, 10)
                const localHour = utcHourToLocalHour[utcHour]
                const existing = localData[serverName][localHour]
                const newChar = hourData.avg_character_count ?? 0
                const newLfm = hourData.avg_lfm_count ?? 0
                if (!existing) {
                    localData[serverName][localHour] = {
                        avg_character_count: hourData.avg_character_count,
                        avg_lfm_count: hourData.avg_lfm_count,
                    }
                } else {
                    // Keep the max to represent the higher observed value among overlapping hours
                    localData[serverName][localHour] = {
                        avg_character_count: Math.max(
                            existing.avg_character_count ?? 0,
                            newChar
                        ),
                        avg_lfm_count: Math.max(
                            existing.avg_lfm_count ?? 0,
                            newLfm
                        ),
                    }
                }
            })
        })

        return convertByHourPopulationDataToNivoFormat(
            localData,
            dataTypeFilter
        )
    }, [range, serverFilter, dataMap, dataTypeFilter, utcHourToLocalHour])

    const axisBottomWithTz = useMemo(() => {
        return {
            ...BY_HOUR_LINE_CHART_AXIS_BOTTOM,
            format: (value: number) => numberToHourOfDay(value),
        }
    }, [timezoneOverride])

    return (
        <>
            <FilterSelection
                range={range}
                setRange={setRange}
                serverFilter={serverFilter}
                setServerFilter={setServerFilter}
                rangeOptions={RANGE_OPTIONS}
                dataTypeFilter={dataTypeFilter}
                setDataTypeFilter={setDataTypeFilter}
            />
            <GenericLine
                nivoData={nivoData}
                showLegend
                xScale={BY_HOUR_CHART_X_SCALE}
                axisBottom={axisBottomWithTz}
                tooltipTitleFormatter={(hour: any) =>
                    `Average Characters at ${numberToHourOfDay(hour)}`
                }
                yFormatter={(value: number) => `${value.toFixed()}`}
            />
            <TimezoneSelect />
        </>
    )
}

export default HourlyPopulationDistribution
