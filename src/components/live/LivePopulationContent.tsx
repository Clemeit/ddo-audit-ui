import { useEffect, useMemo, useRef, useState } from "react"
import {
    PopulationPointInTime,
    ServerInfoApiDataModel,
} from "../../models/Game.ts"
import {
    DataTypeFilterEnum,
    RangeEnum,
    ServerFilterEnum,
} from "../../models/Population.ts"
import GenericLine from "../charts/GenericLine.tsx"
import {
    getPopulationData1Day,
    getPopulationData1Month,
    getPopulationData1Week,
} from "../../services/populationService.ts"
import { convertToNivoFormat, NivoDateSeries } from "../../utils/nivoUtils.ts"
import {
    SERVERS_32_BITS_LOWER,
    SERVERS_64_BITS_LOWER,
} from "../../constants/servers.ts"
import Stack from "../global/Stack.tsx"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import {
    LINE_CHART_AXIS_BOTTOM,
    LINE_CHART_MARGIN,
    LINE_CHART_X_SCALE,
    OVER_MONTH_CHART_X_SCALE,
    OVER_MONTH_LINE_CHART_AXIS_BOTTOM,
    OVER_MONTH_LINE_CHART_MARGIN,
    OVER_WEEK_CHART_X_SCALE,
    OVER_WEEK_LINE_CHART_AXIS_BOTTOM,
    OVER_WEEK_LINE_CHART_MARGIN,
} from "../charts/lineChartConfig.ts"
import {
    dateToLongString,
    dateToLongStringWithTime,
} from "../../utils/dateUtils.ts"
import { useAppContext } from "../../contexts/AppContext.tsx"

interface Props {
    serverInfoData: ServerInfoApiDataModel
}

const StatusSpan = ({ message }: { message: string }) => (
    <span
        style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "1.2em",
            color: "var(--text)",
            filter: "drop-shadow(0 0 1px rgba(0, 0, 0, 1))",
        }}
    >
        {message}
    </span>
)

const LivePopulationContent = ({ serverInfoData }: Props) => {
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const [range, setRange] = useState<RangeEnum>(RangeEnum.DAY)
    const [serverFilter, setServerFilter] = useState<ServerFilterEnum>(
        ServerFilterEnum.ONLY_64_BIT
    )
    const [dataTypeFilter, setDataTypeFilter] = useState<DataTypeFilterEnum>(
        DataTypeFilterEnum.CHARACTERS
    )
    const [dataMap, setDataMap] = useState<
        Partial<Record<RangeEnum, PopulationPointInTime[] | undefined>>
    >({})
    const lastRange = useRef<RangeEnum | undefined>(range)
    const { timezoneOverride } = useAppContext()

    const RANGE_OPTIONS = ["day", "week", "month"]
    const SERVER_FILTER_OPTIONS = Object.values(ServerFilterEnum) as string[]
    const DATA_TYPE_FILTER_OPTIONS = Object.values(
        DataTypeFilterEnum
    ) as string[]

    const rangeToFetchMap = useMemo(
        () => ({
            [RangeEnum.DAY]: (signal: AbortSignal) =>
                getPopulationData1Day(signal),
            [RangeEnum.WEEK]: (signal: AbortSignal) =>
                getPopulationData1Week(signal),
            [RangeEnum.MONTH]: (signal: AbortSignal) =>
                getPopulationData1Month(signal),
        }),
        []
    )

    const livePopulationTitle = useMemo(() => {
        if (!serverInfoData) return "Loading..."

        let totalPopulation = 0
        let totalLfmCount = 0

        for (const server of Object.values(serverInfoData)) {
            totalPopulation += server.character_count || 0
            totalLfmCount += server.lfm_count || 0
        }

        const snarkyComment =
            totalPopulation === 0
                ? "Maybe they're all anonymous."
                : "Are you one of them?"
        return (
            <>
                There are currently{" "}
                <span className="blue-text">
                    {totalPopulation.toLocaleString()}
                </span>{" "}
                characters online and{" "}
                <span className="orange-text">
                    {totalLfmCount.toLocaleString()}
                </span>{" "}
                LFMs posted. {snarkyComment}
            </>
        )
    }, [serverInfoData])

    useEffect(() => {
        if (!range) return
        const controller = new AbortController()
        const fetchPopulationData = async () => {
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
        if (dataMap?.[range] === undefined) fetchPopulationData()
        return () => controller.abort()
    }, [range])

    const nivoData: NivoDateSeries[] = useMemo(() => {
        if (!range) return []
        let populationData = dataMap?.[range]
        if (populationData) {
            lastRange.current = range
        } else {
            populationData = dataMap?.[lastRange.current]
        }
        if (serverFilter === ServerFilterEnum.ONLY_64_BIT) {
            populationData = populationData?.map((point) => {
                return {
                    timestamp: point.timestamp,
                    data: {
                        ...Object.fromEntries(
                            Object.entries(point.data).filter(([server]) =>
                                SERVERS_64_BITS_LOWER.includes(
                                    server.toLowerCase()
                                )
                            )
                        ),
                    },
                }
            })
        } else if (serverFilter === ServerFilterEnum.ONLY_32_BIT) {
            populationData = populationData?.map((point) => {
                return {
                    timestamp: point.timestamp,
                    data: {
                        ...Object.fromEntries(
                            Object.entries(point.data).filter(([server]) =>
                                SERVERS_32_BITS_LOWER.includes(
                                    server.toLowerCase()
                                )
                            )
                        ),
                    },
                }
            })
        }
        return convertToNivoFormat(
            populationData,
            timezoneOverride ||
                Intl.DateTimeFormat().resolvedOptions().timeZone,
            dataTypeFilter
        )
    }, [range, serverFilter, dataMap, timezoneOverride, dataTypeFilter])

    const xScale = useMemo(() => {
        if (lastRange.current === RangeEnum.DAY) return LINE_CHART_X_SCALE
        if (lastRange.current === RangeEnum.WEEK) return OVER_WEEK_CHART_X_SCALE
        if (lastRange.current === RangeEnum.MONTH)
            return OVER_MONTH_CHART_X_SCALE

        return LINE_CHART_X_SCALE
    }, [lastRange.current])

    const axisBottom = useMemo(() => {
        if (lastRange.current === RangeEnum.DAY) return LINE_CHART_AXIS_BOTTOM
        if (lastRange.current === RangeEnum.WEEK)
            return OVER_WEEK_LINE_CHART_AXIS_BOTTOM
        if (lastRange.current === RangeEnum.MONTH)
            return OVER_MONTH_LINE_CHART_AXIS_BOTTOM

        return LINE_CHART_AXIS_BOTTOM
    }, [lastRange.current])

    const margin = useMemo(() => {
        if (lastRange.current === RangeEnum.DAY) return LINE_CHART_MARGIN
        if (lastRange.current === RangeEnum.WEEK)
            return OVER_WEEK_LINE_CHART_MARGIN
        if (lastRange.current === RangeEnum.MONTH)
            return OVER_MONTH_LINE_CHART_MARGIN

        return LINE_CHART_MARGIN
    }, [lastRange.current])

    const chartHeight = useMemo(() => {
        if (lastRange.current === RangeEnum.DAY) return "400px"
        if (lastRange.current === RangeEnum.WEEK) return "460px"
        if (lastRange.current === RangeEnum.MONTH) return "440px"

        return "400px"
    }, [lastRange.current])

    return (
        <>
            <p>{livePopulationTitle}</p>
            <Stack
                direction="row"
                gap="10px"
                className="full-column-on-small-mobile"
            >
                {[
                    {
                        label: "Range",
                        id: "hourlyPopulationDistributionRange",
                        value: range,
                        onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                            setRange(e.target.value as RangeEnum),
                        options: RANGE_OPTIONS,
                        optionLabel: (opt: string) => toSentenceCase(opt),
                    },
                    {
                        label: "Server filter",
                        id: "hourlyPopulationDistributionServerFilter",
                        value: serverFilter,
                        onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                            setServerFilter(e.target.value as ServerFilterEnum),
                        options: SERVER_FILTER_OPTIONS,
                        optionLabel: (opt: string) => opt,
                    },
                    {
                        label: "Data type",
                        id: "hourlyPopulationDistributionDataTypeFilter",
                        value: dataTypeFilter,
                        onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                            setDataTypeFilter(
                                e.target.value as DataTypeFilterEnum
                            ),
                        options: DATA_TYPE_FILTER_OPTIONS,
                        optionLabel: (opt: string) => opt,
                    },
                ].map((config) => (
                    <Stack
                        className="full-width-on-small-mobile"
                        direction="column"
                        gap="2px"
                        key={config.id}
                        style={{ width: "150px" }}
                    >
                        <label
                            htmlFor={config.id}
                            style={{
                                color: "var(--text)",
                                fontWeight: "bolder",
                            }}
                        >
                            {config.label}
                        </label>
                        <select
                            id={config.id}
                            value={config.value}
                            onChange={config.onChange}
                            style={{ width: "100%" }}
                        >
                            {config.options.map((opt) => (
                                <option key={opt} value={opt}>
                                    {config.optionLabel(opt)}
                                </option>
                            ))}
                        </select>
                    </Stack>
                ))}
            </Stack>
            <div style={{ position: "relative" }}>
                <div style={{ opacity: isLoading ? 0.5 : 1 }}>
                    <GenericLine
                        nivoData={nivoData}
                        showLegend
                        yFormatter={(value: number) =>
                            lastRange.current === RangeEnum.DAY
                                ? value.toLocaleString()
                                : Number(value).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  })
                        }
                        tooltipTitleFormatter={(data) =>
                            lastRange.current === RangeEnum.MONTH
                                ? dateToLongString(new Date(data))
                                : dateToLongStringWithTime(new Date(data))
                        }
                        showTotalInTooltip
                        showTimezoneDisplay
                        xScale={xScale}
                        axisBottom={axisBottom}
                        margin={margin}
                        chartHeight={chartHeight}
                    />
                </div>
                {isLoading && <StatusSpan message="Loading..." />}
                {isError && (
                    <StatusSpan message="An error occurred. Please try again later." />
                )}
            </div>
        </>
    )
}

export default LivePopulationContent
