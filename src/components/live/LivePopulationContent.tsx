import { useEffect, useMemo, useRef, useState } from "react"
import {
    PopulationPointInTime,
    ServerInfoApiDataModel,
} from "../../models/Game.ts"
import { RangeEnum, ServerFilterEnum } from "../../models/Population.ts"
import GenericLine from "../charts/GenericLine.tsx"
import {
    getPopulationData1Day,
    getPopulationData1Month,
    getPopulationData1Week,
} from "../../services/populationService.ts"
import { convertToNivoFormat, NivoSeries } from "../../utils/nivoUtils.ts"
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
import ColoredText from "../global/ColoredText.tsx"
import FauxLink from "../global/FauxLink.tsx"
import Modal from "../modal/Modal.tsx"
import { ContentCluster } from "../global/ContentCluster.tsx"
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
    const [dataMap, setDataMap] = useState<
        Partial<Record<RangeEnum, PopulationPointInTime[] | undefined>>
    >({})
    const lastRange = useRef<RangeEnum | undefined>(range)
    const { timezoneOverride, setTimezoneOverride } = useAppContext()

    const RANGE_OPTIONS = ["day", "week", "month"] as RangeEnum[]
    const SERVER_FILTER_OPTIONS = Object.values(ServerFilterEnum)

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

    const nivoData: NivoSeries[] = useMemo(() => {
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
        return convertToNivoFormat(populationData)
    }, [range, serverFilter, dataMap])

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
