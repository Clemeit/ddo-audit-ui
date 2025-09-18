import React, { useMemo, useState } from "react"
import { RangeEnum, ServerFilterEnum } from "../../models/Common"
import { getTotalLevelDemographic } from "../../services/demographicsService"
import ChartScaffold from "../charts/ChartScaffold"
import { ResponsiveLine } from "@nivo/line"
import { getServerColor } from "../../utils/chartUtils"
import {
    LINE_CHART_DEFAULTS,
    LINE_CHART_MARGIN,
    LINE_CHART_THEME,
} from "../charts/lineChartConfig"
import LineChartTooltip from "../charts/LineChartTooltip"
import { useRangedDemographic } from "../../hooks/useRangedDemographic"
import { buildLevelDistributionSeries } from "../../utils/levelDistributionBuilder"
import { NivoNumberSeries } from "../../utils/nivoUtils"
import { useLegendFilterHighlight } from "../../hooks/useLegendFilterHighlight"

const LevelPopulationDistribution = () => {
    const {
        range: rangeFilter,
        setRange: setRangeFilter,
        currentData,
        isLoading,
        isError,
    } = useRangedDemographic((r, signal) => getTotalLevelDemographic(r, signal))
    const [serverFilter, setServerFilter] = useState<ServerFilterEnum>(
        ServerFilterEnum.ONLY_64_BIT
    )
    const [displayType, setDisplayType] = useState<string>("Separated")
    const [normalized, setNormalized] = useState<boolean>(false)
    const nivoData: NivoNumberSeries[] = useMemo(
        () =>
            buildLevelDistributionSeries(
                currentData as any,
                serverFilter,
                normalized
            ),
        [currentData, serverFilter, normalized]
    )

    const { excluded, toggleExcluded, setHighlighted, colorFn } =
        useLegendFilterHighlight({
            dataIds: nivoData.map((series) => series.id),
            getColor: getServerColor,
        })

    const filteredNivoData = useMemo(
        () => nivoData.filter((series) => !excluded.includes(series.id)),
        [nivoData, excluded]
    )

    return (
        <ChartScaffold
            scaffoldName="LevelPopulationDistribution"
            isLoading={isLoading}
            isError={isError}
            range={rangeFilter}
            setRange={setRangeFilter}
            serverFilter={serverFilter}
            setServerFilter={setServerFilter}
            displayType={displayType}
            setDisplayType={setDisplayType}
            displayTypeOptions={["Separated", "Stacked"]}
            normalized={normalized}
            setNormalized={setNormalized}
            showLegend
            legendData={nivoData}
            height={400}
            excludedSeries={excluded}
            onLegendItemClick={toggleExcluded}
            onLegendItemHover={setHighlighted}
        >
            <ResponsiveLine
                data={filteredNivoData}
                colors={(d) => colorFn(String(d.id ?? ""))}
                curve="monotoneX"
                yScale={{
                    stacked: displayType === "Stacked",
                    type: "linear",
                    min: "auto",
                    max: "auto",
                }}
                margin={{ ...LINE_CHART_MARGIN, left: 60 }}
                theme={LINE_CHART_THEME}
                enableGridX={LINE_CHART_DEFAULTS.enableGridX}
                enablePoints={LINE_CHART_DEFAULTS.enablePoints}
                lineWidth={LINE_CHART_DEFAULTS.lineWidth}
                enableSlices={LINE_CHART_DEFAULTS.enableSlices}
                useMesh={LINE_CHART_DEFAULTS.useMesh}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    legendOffset: 50,
                    legend: "Total Level",
                }}
                sliceTooltip={({ slice }) => (
                    <LineChartTooltip
                        slice={slice}
                        getServerColor={getServerColor}
                        tooltipTitleFormatter={(level: any) =>
                            `Total level: ${level}`
                        }
                        yFormatter={(value: number) => value.toLocaleString()}
                        showTotal
                    />
                )}
            />
        </ChartScaffold>
    )
}

export default LevelPopulationDistribution
