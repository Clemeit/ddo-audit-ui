import { useMemo, useState } from "react"
import { ResponsivePie } from "@nivo/pie"
import {
    convertAveragePopulationDataToNivoFormat,
    NivoPieSlice,
} from "../../utils/nivoUtils"
import {
    DataTypeFilterEnum,
    RangeEnum,
    ServerFilterEnum,
} from "../../models/Common"
import { getAveragePopulationForRange } from "../../services/populationService"
import {
    SERVERS_64_BITS_LOWER,
    SERVERS_32_BITS_LOWER,
} from "../../constants/servers"
import { useRangedDemographic } from "../../hooks/useRangedDemographic"
import ChartScaffold from "../charts/ChartScaffold"
import PieChartTooltip from "../charts/PieChartTooltip"
import { getServerColor } from "../../utils/chartUtils"
import { PIE_CHART_MARGIN, PIE_CHART_THEME } from "../charts/pieChartConfig"
import { toSentenceCase } from "../../utils/stringUtils"
import { useLegendFilterHighlight } from "../../hooks/useLegendFilterHighlight"

const ServerPopulationDistribution = () => {
    const { range, setRange, currentData, isLoading, isError } =
        useRangedDemographic((r, signal) =>
            getAveragePopulationForRange(r, signal)
        )
    const [serverFilter, setServerFilter] = useState<ServerFilterEnum>(
        ServerFilterEnum.ONLY_64_BIT
    )
    const [dataTypeFilter, setDataTypeFilter] = useState<DataTypeFilterEnum>(
        DataTypeFilterEnum.CHARACTERS
    )

    const filteredData = useMemo(() => {
        if (!currentData) return undefined
        if (serverFilter === ServerFilterEnum.ONLY_64_BIT) {
            return Object.fromEntries(
                Object.entries(currentData).filter(([serverName]) =>
                    SERVERS_64_BITS_LOWER.includes(serverName.toLowerCase())
                )
            )
        } else if (serverFilter === ServerFilterEnum.ONLY_32_BIT) {
            return Object.fromEntries(
                Object.entries(currentData).filter(([serverName]) =>
                    SERVERS_32_BITS_LOWER.includes(serverName.toLowerCase())
                )
            )
        }
        return currentData
    }, [currentData, serverFilter])

    const nivoData: NivoPieSlice[] = useMemo(
        () =>
            convertAveragePopulationDataToNivoFormat(
                filteredData as any,
                dataTypeFilter
            ),
        [filteredData, dataTypeFilter]
    )

    const { excluded, toggleExcluded, setHighlighted, colorFn } =
        useLegendFilterHighlight({
            dataIds: nivoData.map((slice) => String(slice.id ?? "")),
            getColor: getServerColor,
        })

    const filteredNivoData: NivoPieSlice[] = useMemo(
        () => nivoData.filter((slice) => !excluded.includes(String(slice.id))),
        [nivoData, excluded]
    )

    const total = useMemo(
        () => filteredNivoData.reduce((sum, s) => sum + s.value, 0),
        [filteredNivoData]
    )

    return (
        <ChartScaffold
            scaffoldName="ServerPopulationDistribution"
            isLoading={isLoading}
            isError={isError}
            range={range}
            setRange={setRange}
            serverFilter={serverFilter}
            setServerFilter={setServerFilter}
            dataTypeFilter={dataTypeFilter}
            setDataTypeFilter={setDataTypeFilter}
            showLegend
            legendData={nivoData}
            height={500}
            excludedSeries={excluded}
            onLegendItemClick={toggleExcluded}
            onLegendItemHover={setHighlighted}
        >
            <ResponsivePie
                data={filteredNivoData}
                margin={PIE_CHART_MARGIN}
                theme={PIE_CHART_THEME}
                colors={(d) => colorFn(String(d.id ?? ""))}
                sortByValue
                valueFormat={(value) => `${value}`}
                cornerRadius={5}
                borderWidth={1}
                arcLabelsSkipAngle={15}
                arcLabelsTextColor={"var(--text-inverted)"}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsStraightLength={10}
                arcLinkLabelsThickness={2}
                arcLinkLabelsTextColor="white"
                arcLinkLabelsColor={{
                    from: "color",
                    modifiers: [["darker", 1]],
                }}
                animate={true}
                activeOuterRadiusOffset={8}
                arcLabel={(e) =>
                    (((e.value ?? 0) / total) * 100).toFixed(1) + "%"
                }
                arcLinkLabel={(e) => toSentenceCase(e.id.toString() ?? "")}
                tooltip={({ datum }) => (
                    <PieChartTooltip
                        datum={datum as any}
                        total={total}
                        descriptionFormatter={(value, totalVal) => {
                            const pct =
                                totalVal > 0 ? (value / totalVal) * 100 : 0
                            return `${value.toFixed(1)} avg ${dataTypeFilter.toLowerCase()} (${pct.toFixed(1)}%)`
                        }}
                    />
                )}
            />
        </ChartScaffold>
    )
}

export default ServerPopulationDistribution
