import React, { useEffect, useMemo, useState } from "react"
import { PopulationByHourAndDayOfWeekData } from "../../models/Population"
import {
    DataTypeFilterEnum,
    RangeEnum,
    ServerFilterEnum,
} from "../../models/Common.ts"
import { getPopulationByHourAndDayOfWeekForRange } from "../../services/populationService"
import FilterSelection from "../charts/FilterSelection"
import { ResponsiveHeatMap, TooltipProps } from "@nivo/heatmap"
import {
    SERVERS_32_BITS_LOWER,
    SERVERS_64_BITS_LOWER,
} from "../../constants/servers"
import { useAppContext } from "../../contexts/AppContext"
import TimezoneSelect from "../global/TimezoneSelect"
import { dayOfWeekToNumber, numberToHourOfDay } from "../../utils/dateUtils"
import { toSentenceCase } from "../../utils/stringUtils"
import "../charts/GenericTooltip.css"

const PeakTimesTooltip: React.FC<TooltipProps<any>> = ({ cell }) => {
    return (
        <div className="tooltip-container">
            <div className="tooltip-header">
                {toSentenceCase(cell.serieId)}{" "}
                {numberToHourOfDay(cell.data.x ?? 0)}
                <hr style={{ margin: "4px 0 10px 0" }} />
            </div>
            <div className="tooltip-content">
                <div className="tooltip-row">
                    <span>{cell.value === 1 ? "Peak Hours" : "Off-Peak"}</span>
                </div>
            </div>
        </div>
    )
}

const PeakTimesPopulationDistribution = () => {
    const { timezoneOverride } = useAppContext()
    const [dataMapping, setDataMapping] = useState<
        Record<RangeEnum, PopulationByHourAndDayOfWeekData | undefined>
    >({
        [RangeEnum.DAY]: undefined,
        [RangeEnum.WEEK]: undefined,
        [RangeEnum.MONTH]: undefined,
        [RangeEnum.QUARTER]: undefined,
        [RangeEnum.YEAR]: undefined,
    })
    const [range, setRange] = React.useState<RangeEnum>(RangeEnum.QUARTER)
    const [serverFilter, setServerFilter] = useState<ServerFilterEnum>(
        ServerFilterEnum.ONLY_64_BIT
    )
    const [dataTypeFilter, setDataTypeFilter] = useState<DataTypeFilterEnum>(
        DataTypeFilterEnum.CHARACTERS
    )
    const [data, setData] = React.useState<
        PopulationByHourAndDayOfWeekData | undefined
    >(undefined)
    const [populationThreshold, setPopulationThreshold] = useState<number>(0.9)
    const [dayFilter, setDayFilter] = useState<string>("All")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result =
                    await getPopulationByHourAndDayOfWeekForRange(range)
                setDataMapping((prev) => ({
                    ...prev,
                    [range]: result?.data,
                }))
                setData(result?.data)
            } catch (error) {
                console.error("Error fetching data:", error)
            }
        }

        // Fetch data based on selectedRange and update dataMapping
        if (dataMapping[range]) {
            setData(dataMapping[range])
        } else {
            fetchData()
        }
    }, [range, dataMapping])

    interface PeakData {
        [serverName: string]: {
            [day: string]: {
                peakHours: number[]
                peakCount: number
            }
        }
    }

    // Build a 7x24 mapping from UTC (day,hour) -> local (day,hour) for the selected timezone.
    // Uses a fixed reference week starting on a known Sunday in UTC; this captures the current
    // timezone offset/DST for visualization purposes.
    type DayHour = { day: number; hour: number }
    const utcToLocalMap: DayHour[][] = useMemo(() => {
        const tz =
            timezoneOverride || Intl.DateTimeFormat().resolvedOptions().timeZone
        const map: DayHour[][] = Array.from({ length: 7 }, () =>
            Array.from({ length: 24 }, () => ({ day: 0, hour: 0 }))
        )
        const dayIdx: Record<string, number> = {
            Sun: 0,
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thu: 4,
            Fri: 5,
            Sat: 6,
        }
        const fmt = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            hour: "2-digit",
            hourCycle: "h23",
            weekday: "short",
        })
        // Reference Sunday (UTC): 2025-01-05 is a Sunday.
        const base = Date.UTC(2025, 0, 5, 0, 0, 0, 0)
        for (let d = 0; d < 7; d++) {
            for (let h = 0; h < 24; h++) {
                const date = new Date(base + d * 24 * 3600_000 + h * 3600_000)
                const parts = fmt.formatToParts(date)
                const hourPart = parts.find((p) => p.type === "hour")?.value
                const weekdayPart = parts.find((p) => p.type === "weekday")
                    ?.value as keyof typeof dayIdx | undefined
                const localHour = hourPart ? parseInt(hourPart, 10) : 0
                const localDay = weekdayPart ? dayIdx[weekdayPart] : d
                map[d][h] = { day: localDay, hour: localHour }
            }
        }
        return map
    }, [timezoneOverride])

    const peakTimesPerServerByDay = useMemo<PeakData>(() => {
        if (!data) return {}

        // do for each day of each server
        const output: PeakData = {}
        // helper: given a 24-length boolean array (true = above threshold),
        // find the longest circular window allowing at most one "gap" (false).
        // Return only the true hours within that best window (we don't add the gap hour).
        const computeBestHours = (flags: boolean[]): number[] => {
            const n = 24
            // duplicate to handle wraparound
            const arr = flags.concat(flags)
            let l = 0
            let zeros = 0
            let bestL = 0
            let bestR = -1 // inclusive

            for (let r = 0; r < 2 * n; r++) {
                if (!arr[r]) zeros++
                // maintain at most one gap and window length <= 24
                while (zeros > 1 || r - l + 1 > n) {
                    if (!arr[l]) zeros--
                    l++
                }
                if (r - l > bestR - bestL) {
                    bestL = l
                    bestR = r
                }
            }

            if (bestR < bestL) return []
            const res: number[] = []
            for (let i = bestL; i <= bestR; i++) {
                const hour = i % n
                if (flags[hour]) res.push(hour)
            }
            return res
        }
        Object.entries(data).forEach(([serverName, serverData]) => {
            const doCalcs =
                serverFilter === ServerFilterEnum.ALL ||
                (serverFilter === ServerFilterEnum.ONLY_64_BIT &&
                    SERVERS_64_BITS_LOWER.includes(serverName)) ||
                (serverFilter === ServerFilterEnum.ONLY_32_BIT &&
                    SERVERS_32_BITS_LOWER.includes(serverName))

            if (!doCalcs) return

            // Build local-day/hour buckets from UTC data using the precomputed map
            const localBuckets: Record<string, number[]> = {}
            for (let d = 0; d < 7; d++)
                localBuckets[String(d)] = Array(24).fill(0)

            Object.entries(serverData).forEach(([dayOfWeek, dayData]) => {
                const dUTC = Number(dayOfWeek)
                Object.entries(dayData).forEach(([hourStr, datum]) => {
                    const hUTC = Number(hourStr)
                    const { day: dLocal, hour: hLocal } =
                        utcToLocalMap[dUTC][hUTC]
                    const v =
                        dataTypeFilter === DataTypeFilterEnum.CHARACTERS
                            ? datum.avg_character_count
                            : datum.avg_lfm_count
                    // If multiple UTC buckets map to the same local bucket (rare around DST), keep the max
                    localBuckets[String(dLocal)][hLocal] = Math.max(
                        localBuckets[String(dLocal)][hLocal] ?? 0,
                        v ?? 0
                    )
                })
            })

            if (!output[serverName]) output[serverName] = {}
            // For each local day, compute peak thresholds and best contiguous window
            Object.entries(localBuckets).forEach(([dLocal, series]) => {
                const peakCount = series.reduce((m, x) => (x > m ? x : m), 0)
                const flags = series.map(
                    (x) => x > populationThreshold * peakCount
                )
                const bestHours = computeBestHours(flags)
                output[serverName][dLocal] = { peakCount, peakHours: bestHours }
            })
        })
        return output
    }, [data, serverFilter, dataTypeFilter, utcToLocalMap, populationThreshold])

    // Aggregated peaks per server across all days: compute average series (24h) over 7 local days
    type PeakAggregate = Record<
        string,
        { peakHours: number[]; peakCount: number }
    >
    const peakTimesPerServer = useMemo<PeakAggregate>(() => {
        if (!data) return {}

        // helper duplicated here for clarity; finds longest circular window allowing at most one gap
        const computeBestHours = (flags: boolean[]): number[] => {
            const n = 24
            const arr = flags.concat(flags)
            let l = 0
            let zeros = 0
            let bestL = 0
            let bestR = -1
            for (let r = 0; r < 2 * n; r++) {
                if (!arr[r]) zeros++
                while (zeros > 1 || r - l + 1 > n) {
                    if (!arr[l]) zeros--
                    l++
                }
                if (r - l > bestR - bestL) {
                    bestL = l
                    bestR = r
                }
            }
            if (bestR < bestL) return []
            const res: number[] = []
            for (let i = bestL; i <= bestR; i++) {
                const hour = i % n
                if (flags[hour]) res.push(hour)
            }
            return res
        }

        const output: PeakAggregate = {}

        Object.entries(data).forEach(([serverName, serverData]) => {
            const doCalcs =
                serverFilter === ServerFilterEnum.ALL ||
                (serverFilter === ServerFilterEnum.ONLY_64_BIT &&
                    SERVERS_64_BITS_LOWER.includes(serverName)) ||
                (serverFilter === ServerFilterEnum.ONLY_32_BIT &&
                    SERVERS_32_BITS_LOWER.includes(serverName))

            if (!doCalcs) return

            // Build local buckets per day first (same as by-day computation)
            const localBuckets: Record<string, number[]> = {}
            for (let d = 0; d < 7; d++)
                localBuckets[String(d)] = Array(24).fill(0)

            Object.entries(serverData).forEach(([dayOfWeek, dayData]) => {
                const dUTC = Number(dayOfWeek)
                Object.entries(dayData).forEach(([hourStr, datum]) => {
                    const hUTC = Number(hourStr)
                    const { day: dLocal, hour: hLocal } =
                        utcToLocalMap[dUTC][hUTC]
                    const v =
                        dataTypeFilter === DataTypeFilterEnum.CHARACTERS
                            ? datum.avg_character_count
                            : datum.avg_lfm_count
                    localBuckets[String(dLocal)][hLocal] = Math.max(
                        localBuckets[String(dLocal)][hLocal] ?? 0,
                        v ?? 0
                    )
                })
            })

            // Average across all 7 local days per hour
            const avgSeries: number[] = Array(24).fill(0)
            for (let h = 0; h < 24; h++) {
                let sum = 0
                for (let d = 0; d < 7; d++)
                    sum += localBuckets[String(d)][h] ?? 0
                avgSeries[h] = sum / 7
            }

            const peakCount = avgSeries.reduce((m, x) => (x > m ? x : m), 0)
            const flags = avgSeries.map(
                (x) => x > populationThreshold * peakCount
            )
            const bestHours = computeBestHours(flags)
            output[serverName] = { peakCount, peakHours: bestHours }
        })

        return output
    }, [data, serverFilter, dataTypeFilter, utcToLocalMap, populationThreshold])

    const heatmapData = useMemo(() => {
        if (dayFilter === "All") {
            return Object.entries(peakTimesPerServer).map(
                ([serverName, data]) => ({
                    id: serverName,
                    data: Array.from({ length: 24 }, (_, h) => ({
                        x: h.toString().padStart(2, "0"), // hour label
                        y: data.peakHours.includes(h) ? 1 : 0, // 1=in peak, 0=not
                    })),
                })
            )
        } else {
            return Object.entries(peakTimesPerServerByDay).map(
                ([serverName, data]) => ({
                    id: serverName,
                    data: Array.from({ length: 24 }, (_, h) => ({
                        x: h.toString().padStart(2, "0"), // hour label
                        y: data?.[
                            dayOfWeekToNumber(dayFilter)
                        ].peakHours.includes(h)
                            ? 1
                            : 0, // 1=in peak, 0=not
                    })),
                })
            )
        }
    }, [peakTimesPerServer, peakTimesPerServerByDay, dayFilter])

    return (
        <div>
            <FilterSelection
                range={range}
                setRange={setRange}
                serverFilter={serverFilter}
                setServerFilter={setServerFilter}
                dataTypeFilter={dataTypeFilter}
                setDataTypeFilter={setDataTypeFilter}
                threshold={populationThreshold}
                setThreshold={setPopulationThreshold}
                dayFilter={dayFilter}
                setDayFilter={setDayFilter}
                rangeOptions={[
                    RangeEnum.WEEK,
                    RangeEnum.MONTH,
                    RangeEnum.QUARTER,
                    RangeEnum.YEAR,
                ]}
            />
            <div
                className="line-container"
                style={{ height: `${(heatmapData?.length || 4) * 50 + 100}px` }}
            >
                <ResponsiveHeatMap
                    data={heatmapData}
                    margin={{ top: 60, right: 60, bottom: 60, left: 100 }}
                    valueFormat={(v) => (v ? "Peak" : "")}
                    colors={{
                        type: "quantize",
                        colors: ["rgba(65, 65, 65, 1)", "#080"],
                    }}
                    emptyColor="#555555"
                    axisTop={{
                        tickRotation: -45,
                        format: (data) => numberToHourOfDay(data ?? 0),
                    }}
                    axisLeft={{
                        format: (data) => toSentenceCase(data ?? "Unknown"),
                    }}
                    enableLabels={false}
                    borderRadius={4}
                    borderWidth={1}
                    xInnerPadding={0.02}
                    yInnerPadding={0.15}
                    forceSquare
                    theme={{
                        labels: {
                            text: {
                                fill: "#fff",
                            },
                        },
                        axis: {
                            ticks: {
                                text: {
                                    fill: "var(--text)",
                                    fontSize: 14,
                                },
                            },
                        },
                    }}
                    tooltip={({ cell }) => <PeakTimesTooltip cell={cell} />}
                />
            </div>
            <TimezoneSelect />
        </div>
    )
}

export default PeakTimesPopulationDistribution
