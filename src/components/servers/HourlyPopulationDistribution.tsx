import React, { useMemo, useState } from "react"
import { NivoNumberSeries } from "../../utils/nivoUtils"
import {
    DataTypeFilterEnum,
    RangeEnum,
    ServerFilterEnum,
} from "../../models/Common"
import { getPopulationByHourForRange } from "../../services/populationService"
import {
    BY_HOUR_LINE_CHART_AXIS_BOTTOM,
    LINE_CHART_MARGIN,
    LINE_CHART_THEME,
    LINE_CHART_DEFAULTS,
} from "../charts/lineChartConfig"
import { useAppContext } from "../../contexts/AppContext"
import { numberToHourOfDay } from "../../utils/dateUtils"
import { useRangedDemographic } from "../../hooks/useRangedDemographic"
import ChartScaffold from "../charts/ChartScaffold"
import { ResponsiveLine } from "@nivo/line"
import LineChartTooltip from "../charts/LineChartTooltip"
import {
    buildHourlyPopulationSeries,
    buildUtcToLocalHourMap,
} from "../../utils/hourlyPopulationBuilder"
import { getServerColor } from "../../utils/chartUtils"

const HourlyPopulationDistribution: React.FC = () => {
    const { timezoneOverride } = useAppContext()
    const { range, setRange, currentData, isLoading, isError } =
        useRangedDemographic((r, signal) =>
            getPopulationByHourForRange(r, signal)
        )
    const [serverFilter, setServerFilter] = useState<ServerFilterEnum>(
        ServerFilterEnum.ONLY_64_BIT
    )
    const [dataTypeFilter, setDataTypeFilter] = useState<DataTypeFilterEnum>(
        DataTypeFilterEnum.CHARACTERS
    )
    const RANGE_OPTIONS = Object.values(RangeEnum)

    const utcHourToLocalHour = useMemo(() => {
        const tz =
            timezoneOverride || Intl.DateTimeFormat().resolvedOptions().timeZone
        return buildUtcToLocalHourMap(tz)
    }, [timezoneOverride])

    const nivoData: NivoNumberSeries[] = useMemo(
        () =>
            buildHourlyPopulationSeries(
                currentData as any,
                serverFilter,
                dataTypeFilter,
                utcHourToLocalHour
            ),
        [currentData, serverFilter, dataTypeFilter, utcHourToLocalHour]
    )

    const axisBottomWithTz = useMemo(
        () => ({
            ...BY_HOUR_LINE_CHART_AXIS_BOTTOM,
            format: (value: number) => numberToHourOfDay(value),
        }),
        [timezoneOverride]
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
            rangeOptions={RANGE_OPTIONS as any}
            showTimezone
            showLegend
            legendData={nivoData}
            height={400}
        >
            <ResponsiveLine
                data={nivoData}
                margin={{ ...LINE_CHART_MARGIN, right: 20 }}
                xScale={{ type: "point" }}
                axisBottom={axisBottomWithTz}
                colors={(d) => getServerColor(String(d.id))}
                theme={LINE_CHART_THEME}
                enableGridX={LINE_CHART_DEFAULTS.enableGridX}
                enablePoints={LINE_CHART_DEFAULTS.enablePoints}
                lineWidth={LINE_CHART_DEFAULTS.lineWidth}
                enableSlices={LINE_CHART_DEFAULTS.enableSlices}
                useMesh={LINE_CHART_DEFAULTS.useMesh}
                sliceTooltip={({ slice }) => (
                    <LineChartTooltip
                        slice={slice}
                        getServerColor={getServerColor}
                        tooltipTitleFormatter={(hour: any) =>
                            `Hour: ${numberToHourOfDay(hour)}`
                        }
                        yFormatter={(value: number) => `${value.toFixed()}`}
                        showTotal
                    />
                )}
            />
        </ChartScaffold>
    )
}

export default HourlyPopulationDistribution
