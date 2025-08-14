import { useEffect, useMemo, useRef, useState } from "react"
import GenericPie from "../charts/GenericPie"
import {
    convertAveragePopulationDataToNivoFormat,
    convertByHourPopulationDataToNivoFormat,
    NivoPieSlice,
    NivoSeries,
} from "../../utils/nivoUtils"
import Stack from "../global/Stack"
import {
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

const HourlyPopulationDistribution = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [range, setRange] = useState<RangeEnum>(RangeEnum.QUARTER)
    const [serverFilter, setServerFilter] = useState<ServerFilterEnum>(
        ServerFilterEnum.ONLY_64_BIT
    )
    const [dataMap, setDataMap] = useState<
        Partial<Record<RangeEnum, PopulationByHourData | undefined>>
    >({})
    const lastRange = useRef<RangeEnum | undefined>(range)

    const RANGE_OPTIONS = Object.values(RangeEnum)
    const SERVER_FILTER_OPTIONS = Object.values(ServerFilterEnum)

    const descriptionFormatter = (value: number, total: number) => {
        return `${value.toFixed(1)} average characters (${((value / total) * 100).toFixed(1)}%)`
    }

    const rangeToFetchMap = useMemo(
        () => ({
            [RangeEnum.DAY]: (signal: AbortSignal) =>
                getPopulationByHourForDay(signal),
            [RangeEnum.WEEK]: (signal: AbortSignal) =>
                getPopulationByHourForWeek(signal),
            [RangeEnum.MONTH]: (signal: AbortSignal) =>
                getPopulationByHourForMonth(signal),
            [RangeEnum.QUARTER]: (signal: AbortSignal) =>
                getPopulationByHourForQuarter(signal),
            [RangeEnum.YEAR]: (signal: AbortSignal) =>
                getPopulationByHourForYear(signal),
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

    const nivoData: NivoSeries[] = useMemo(() => {
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
        console.log(convertByHourPopulationDataToNivoFormat(averageData))
        return convertByHourPopulationDataToNivoFormat(averageData)
    }, [range, serverFilter, dataMap])

    return (
        <>
            <p>Average population distribution per server.</p>
            <Stack direction="row" gap="10px" align="center">
                <label htmlFor="hourlyPopulationDistributionRange">
                    Range:
                </label>
                <select
                    id="hourlyPopulationDistributionRange"
                    value={range}
                    onChange={(e) => setRange(e.target.value as RangeEnum)}
                >
                    {RANGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                            {toSentenceCase(opt)}
                        </option>
                    ))}
                </select>
            </Stack>
            <Stack direction="row" gap="10px" align="center">
                <label htmlFor="hourlyPopulationDistributionServerFilter">
                    Server filter:
                </label>
                <select
                    id="hourlyPopulationDistributionServerFilter"
                    value={serverFilter}
                    onChange={(e) =>
                        setServerFilter(e.target.value as ServerFilterEnum)
                    }
                >
                    {SERVER_FILTER_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            </Stack>
            <GenericLine
                nivoData={nivoData}
                showLegend
                xScale={BY_HOUR_CHART_X_SCALE}
                axisBottom={BY_HOUR_LINE_CHART_AXIS_BOTTOM}
                tooltipTitleFormatter={(hour: any) =>
                    `Average Characters at ${hour}:00`
                }
                yFormatter={(value: number) => `${value.toFixed()}`}
            />
        </>
    )
}

export default HourlyPopulationDistribution
