import { useEffect, useMemo, useState } from "react"
import {
    convertByDayOfWeekPopulationDataToNivoFormat,
    NivoBarSlice,
} from "../../utils/nivoUtils"
import {
    PopulationByDayOfWeekData,
    PopulationByHourAndDayOfWeekData,
} from "../../models/Population.ts"
import {
    DataTypeFilterEnum,
    RangeEnum,
    ServerFilterEnum,
} from "../../models/Common.ts"
import { getPopulationByHourAndDayOfWeekForRange } from "../../services/populationService.ts"
import {
    SERVERS_64_BITS_LOWER,
    SERVERS_32_BITS_LOWER,
} from "../../constants/servers"
import GenericBar from "../charts/GenericBar.tsx"
import FilterSelection from "../charts/FilterSelection.tsx"
import { useAppContext } from "../../contexts/AppContext"
import TimezoneSelect from "../global/TimezoneSelect"
import "../charts/GenericTooltip.css"
import { BarTooltipProps, ResponsiveBar } from "@nivo/bar"
import { LINE_CHART_MARGIN } from "../charts/lineChartConfig.ts"
import { getServerColor } from "../../utils/chartUtils.ts"
import { toSentenceCase, toTitleCase } from "../../utils/stringUtils.ts"
import Stack from "../global/Stack.tsx"

interface DailyTooltipProps extends BarTooltipProps<any> {
    keys: string[]
}

const DailyPopulationTooltip: React.FC<DailyTooltipProps> = ({
    label,
    data,
    keys,
}) => {
    const datum = data as Record<string, any>
    const rows = keys
        .map((k) => ({
            key: k,
            value: typeof datum[k] === "number" ? datum[k] : undefined,
        }))
        .filter((r) => r.value !== undefined) as {
        key: string
        value: number
    }[]
    const total = rows.reduce((acc, r) => acc + r.value, 0)
    return (
        <div className="tooltip-container">
            <div className="tooltip-header">
                {toTitleCase(label as string)}
                <hr style={{ margin: "4px 0 10px 0" }} />
            </div>
            <div
                className="tooltip-content"
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
            >
                {rows
                    .sort((rA, rB) => rB.value - rA.value)
                    .map((r) => (
                        <Stack key={r.key} justify="space-between" gap="10px">
                            <Stack direction="row" gap="5px">
                                <span
                                    className="tooltip-series-color"
                                    style={{
                                        backgroundColor: getServerColor(r.key),
                                    }}
                                    aria-hidden="true"
                                />
                                <span>{toSentenceCase(r.key)}</span>
                            </Stack>
                            <span style={{ fontWeight: 600 }}>
                                {r.value.toFixed(2)}
                            </span>
                        </Stack>
                    ))}
                <hr style={{ margin: "4px 0 4px 0" }} />
                <Stack justify="space-between" align="center" gap="10px">
                    <span>Total</span>
                    <span>{total.toFixed(2)}</span>
                </Stack>
            </div>
        </div>
    )
}

const DailyPopulationDistribution = () => {
    const { timezoneOverride } = useAppContext()
    // Cache raw hour+day-of-week data (UTC) per range; we'll derive local day-of-week aggregates
    const [hourDayDataMap, setHourDayDataMap] = useState<
        Record<RangeEnum, PopulationByHourAndDayOfWeekData | undefined>
    >({
        [RangeEnum.DAY]: undefined,
        [RangeEnum.WEEK]: undefined,
        [RangeEnum.MONTH]: undefined,
        [RangeEnum.QUARTER]: undefined,
        [RangeEnum.YEAR]: undefined,
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [range, setRange] = useState<RangeEnum>(RangeEnum.QUARTER)
    const [serverFilter, setServerFilter] = useState<ServerFilterEnum>(
        ServerFilterEnum.ONLY_64_BIT
    )
    const [dataTypeFilter, setDataTypeFilter] = useState<DataTypeFilterEnum>(
        DataTypeFilterEnum.CHARACTERS
    )
    const [displayType, setDisplayType] = useState<string>("Stacked")

    useEffect(() => {
        if (!range) return
        const controller = new AbortController()
        const fetchHourDayData = async () => {
            setIsLoading(true)
            try {
                const result = await getPopulationByHourAndDayOfWeekForRange(
                    range,
                    controller.signal
                )
                if (!controller.signal.aborted) {
                    setHourDayDataMap((prev) => ({
                        ...prev,
                        [range]: result?.data,
                    }))
                    setIsError(false)
                }
            } catch {
                if (!controller.signal.aborted) setIsError(true)
            } finally {
                if (!controller.signal.aborted) setIsLoading(false)
            }
        }
        if (hourDayDataMap[range] === undefined) fetchHourDayData()
        return () => controller.abort()
    }, [range])

    // Build a 7x24 mapping from UTC (day,hour) -> local (day,hour)
    type DayHour = { day: number; hour: number }
    const utcToLocalMap: DayHour[][] = useMemo(() => {
        const tz =
            timezoneOverride || Intl.DateTimeFormat().resolvedOptions().timeZone
        const fmt = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            hour: "2-digit",
            hourCycle: "h23",
            weekday: "short",
        })
        const dayIdx: Record<string, number> = {
            Sun: 0,
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thu: 4,
            Fri: 5,
            Sat: 6,
        }
        const base = Date.UTC(2025, 0, 5, 0, 0, 0, 0) // Sunday UTC
        const map: DayHour[][] = Array.from({ length: 7 }, () =>
            Array.from({ length: 24 }, () => ({ day: 0, hour: 0 }))
        )
        for (let d = 0; d < 7; d++) {
            for (let h = 0; h < 24; h++) {
                const date = new Date(base + d * 24 * 3600_000 + h * 3600_000)
                const parts = fmt.formatToParts(date)
                const hourPart = parts.find((p) => p.type === "hour")?.value
                const weekdayPart = parts.find(
                    (p) => p.type === "weekday"
                )?.value
                map[d][h] = {
                    day: weekdayPart ? dayIdx[weekdayPart] : d,
                    hour: hourPart ? parseInt(hourPart, 10) : h,
                }
            }
        }
        return map
    }, [timezoneOverride])

    // Aggregate hour+day UTC data into local day-of-week averages
    const dayOfWeekData: PopulationByDayOfWeekData | undefined = useMemo(() => {
        const hourDay = hourDayDataMap[range]
        if (!hourDay) return undefined
        const output: PopulationByDayOfWeekData = {}
        Object.entries(hourDay).forEach(([serverName, dayEntries]) => {
            const sums = Array(7)
                .fill(0)
                .map(() => ({ char: 0, lfm: 0, n: 0 }))
            Object.entries(dayEntries).forEach(([dayStr, hours]) => {
                const dUTC = parseInt(dayStr, 10)
                if (isNaN(dUTC) || dUTC < 0 || dUTC > 6) return
                Object.entries(hours).forEach(([hourStr, datum]) => {
                    const hUTC = parseInt(hourStr, 10)
                    if (isNaN(hUTC) || hUTC < 0 || hUTC > 23) return
                    const { day: dLocal } = utcToLocalMap[dUTC][hUTC]
                    const charVal = datum.avg_character_count ?? 0
                    const lfmVal = datum.avg_lfm_count ?? 0
                    sums[dLocal].char += charVal
                    sums[dLocal].lfm += lfmVal
                    sums[dLocal].n += 1
                })
            })
            output[serverName] = {}
            sums.forEach((agg, idx) => {
                if (agg.n === 0) return
                output[serverName][idx] = {
                    avg_character_count: agg.char / agg.n,
                    avg_lfm_count: agg.lfm / agg.n,
                }
            })
        })
        return output
    }, [hourDayDataMap, range, utcToLocalMap])

    const nivoData: NivoBarSlice[] = useMemo(() => {
        if (!range) return []
        let data = dayOfWeekData
        if (!data) return []
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
        return convertByDayOfWeekPopulationDataToNivoFormat(
            data,
            dataTypeFilter
        )
    }, [range, serverFilter, dayOfWeekData, dataTypeFilter])

    return (
        <>
            <FilterSelection
                range={range}
                setRange={setRange}
                serverFilter={serverFilter}
                setServerFilter={setServerFilter}
                rangeOptions={[
                    RangeEnum.WEEK,
                    RangeEnum.MONTH,
                    RangeEnum.QUARTER,
                    RangeEnum.YEAR,
                ]}
                dataTypeFilter={dataTypeFilter}
                displayType={displayType}
                setDisplayType={setDisplayType}
                setDataTypeFilter={setDataTypeFilter}
            />
            <div className="line-container" style={{ height: "400px" }}>
                {/** Precompute keys so we can reuse for tooltip */}
                {(() => {
                    const barKeys = [
                        ...(nivoData.length > 0
                            ? Object.keys(nivoData[0]).filter(
                                  (key) => key !== "index"
                              )
                            : []),
                    ]
                    return (
                        <ResponsiveBar
                            data={nivoData}
                            indexBy="index"
                            keys={barKeys}
                            theme={{
                                labels: {
                                    text: {
                                        fill: "#fff",
                                    },
                                },
                                axis: {
                                    legend: {
                                        text: {
                                            fill: "var(--text)",
                                            fontSize: 14,
                                        },
                                    },
                                    ticks: {
                                        text: {
                                            fill: "var(--text)",
                                            fontSize: 14,
                                        },
                                    },
                                },
                            }}
                            enableTotals
                            labelSkipWidth={12}
                            labelSkipHeight={12}
                            groupMode={
                                displayType.toLowerCase() as
                                    | "stacked"
                                    | "grouped"
                            }
                            margin={{ ...LINE_CHART_MARGIN, left: 50 }}
                            colors={(d) => getServerColor(d.id.toString())}
                            axisBottom={{
                                tickSize: 5,
                                tickPadding: 5,
                                legendOffset: 50,
                                legend: "Day of Week",
                            }}
                            valueFormat={(value: number) => value.toFixed(2)}
                            tooltip={(barProps) => (
                                <DailyPopulationTooltip
                                    {...(barProps as any)}
                                    keys={barKeys}
                                />
                            )}
                        />
                    )
                })()}
            </div>
            <TimezoneSelect />
        </>
    )
}

export default DailyPopulationDistribution
