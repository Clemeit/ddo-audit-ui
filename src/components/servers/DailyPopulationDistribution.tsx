import { useMemo, useState } from "react"
import {
    convertByDayOfWeekPopulationDataToNivoFormat,
    NivoBarSlice,
} from "../../utils/nivoUtils"
import {
    PopulationByDayOfWeekData,
    PopulationByHourAndDayOfWeekData,
} from "../../models/Population"
import {
    DataTypeFilterEnum,
    RangeEnum,
    ServerFilterEnum,
} from "../../models/Common"
import { getPopulationByHourAndDayOfWeekForRange } from "../../services/populationService"
import { useAppContext } from "../../contexts/AppContext"
import "../charts/GenericTooltip.css"
import { BarTooltipProps, ResponsiveBar } from "@nivo/bar"
import { LINE_CHART_MARGIN } from "../charts/lineChartConfig"
import { getServerColor } from "../../utils/chartUtils"
import { toSentenceCase, toTitleCase } from "../../utils/stringUtils"
import Stack from "../global/Stack"
import { useRangedDemographic } from "../../hooks/useRangedDemographic"
import {
    aggregateHourDayToLocalDay,
    buildUtcToLocalMap,
    dayOfWeekDataToNivo,
    filterServers,
} from "../../utils/populationAggregation"
import ChartScaffold from "../charts/ChartScaffold"
import "../../styles/charts/Overlay.css"

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
    const {
        range,
        setRange,
        currentData: hourDayCurrent,
        isError,
        isLoading,
    } = useRangedDemographic<PopulationByHourAndDayOfWeekData>(
        (r, signal) => getPopulationByHourAndDayOfWeekForRange(r, signal),
        RangeEnum.QUARTER
    )
    const [serverFilter, setServerFilter] = useState<ServerFilterEnum>(
        ServerFilterEnum.ONLY_64_BIT
    )
    const [dataTypeFilter, setDataTypeFilter] = useState<DataTypeFilterEnum>(
        DataTypeFilterEnum.CHARACTERS
    )
    const [displayType, setDisplayType] = useState<string>("Stacked")

    const timezone =
        timezoneOverride || Intl.DateTimeFormat().resolvedOptions().timeZone
    const utcToLocalMap = useMemo(
        () => buildUtcToLocalMap(timezone),
        [timezone]
    )
    const dayOfWeekData: PopulationByDayOfWeekData | undefined = useMemo(
        () => aggregateHourDayToLocalDay(hourDayCurrent, utcToLocalMap),
        [hourDayCurrent, utcToLocalMap]
    )

    const filteredDayData = useMemo(
        () => filterServers(dayOfWeekData, serverFilter),
        [dayOfWeekData, serverFilter]
    )
    const nivoData: NivoBarSlice[] = useMemo(
        () =>
            dayOfWeekDataToNivo(
                filteredDayData,
                dataTypeFilter,
                convertByDayOfWeekPopulationDataToNivoFormat
            ),
        [filteredDayData, dataTypeFilter]
    )

    const barKeys = useMemo(
        () =>
            nivoData.length > 0
                ? Object.keys(nivoData[0]).filter((k) => k !== "index")
                : [],
        [nivoData]
    )

    return (
        <ChartScaffold
            isLoading={isLoading}
            isError={isError}
            range={range}
            setRange={setRange}
            serverFilter={serverFilter}
            setServerFilter={setServerFilter}
            dataTypeFilter={dataTypeFilter}
            setDataTypeFilter={setDataTypeFilter}
            displayType={displayType}
            setDisplayType={setDisplayType}
            rangeOptions={[
                RangeEnum.WEEK,
                RangeEnum.MONTH,
                RangeEnum.QUARTER,
                RangeEnum.YEAR,
            ]}
            showTimezone
            showLegend
            legendData={barKeys.map((k) => ({ id: k, data: [] }))}
            height={500}
        >
            <ResponsiveBar
                data={nivoData}
                indexBy="index"
                keys={barKeys}
                theme={{
                    labels: { text: { fill: "#fff", fontSize: "0.7rem" } },
                    axis: {
                        legend: { text: { fill: "var(--text)", fontSize: 14 } },
                        ticks: { text: { fill: "var(--text)", fontSize: 14 } },
                    },
                }}
                enableTotals
                labelSkipWidth={12}
                labelSkipHeight={12}
                groupMode={displayType.toLowerCase() as "stacked" | "grouped"}
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
                isInteractive={!isLoading && !isError}
            />
        </ChartScaffold>
    )
}

export default DailyPopulationDistribution
