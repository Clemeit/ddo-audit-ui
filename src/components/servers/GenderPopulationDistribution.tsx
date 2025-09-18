import { useMemo, useState } from "react"
import { GenderDemographicApiData } from "../../models/Demographics"
import { RangeEnum, ServerFilterEnum } from "../../models/Common"
import { getGenderDemographic } from "../../services/demographicsService"
import ChartScaffold from "../charts/ChartScaffold"
import { ResponsivePie } from "@nivo/pie"
import { PIE_CHART_THEME } from "../charts/pieChartConfig"
import PieChartTooltip from "../charts/PieChartTooltip"
import { useRangedDemographic } from "../../hooks/useRangedDemographic"
import { buildGenderPie } from "../../utils/genderPieBuilder"
import { toTitleCase } from "../../utils/stringUtils"
import "../../styles/charts/Overlay.css"

const GenderPopulationDistribution = () => {
    const {
        range: rangeFilter,
        setRange: setRangeFilter,
        isLoading,
        isError,
        currentData,
    } = useRangedDemographic<GenderDemographicApiData>(
        (r, signal) => getGenderDemographic(r, signal),
        RangeEnum.QUARTER
    )
    const [serverFilter, setServerFilter] = useState<ServerFilterEnum>(
        ServerFilterEnum.ONLY_64_BIT
    )
    const nivoData = useMemo(
        () => buildGenderPie(currentData, serverFilter),
        [currentData, serverFilter]
    )

    return (
        <ChartScaffold
            isLoading={isLoading}
            isError={isError}
            range={rangeFilter}
            setRange={setRangeFilter}
            serverFilter={serverFilter}
            setServerFilter={setServerFilter}
            showLegend
            legendData={nivoData.data}
            height={500}
        >
            <ResponsivePie
                data={nivoData.data}
                colors={({ id }) => {
                    const normalized = id.toString().toLowerCase()
                    if (normalized === "male") return "rgba(76, 139, 255, 1)"
                    if (normalized === "female") return "rgba(255, 79, 255, 1)"
                    return "#888"
                }}
                theme={PIE_CHART_THEME}
                cornerRadius={5}
                sortByValue
                borderWidth={1}
                padAngle={0.7}
                innerRadius={0.5}
                arcLabelsSkipAngle={15}
                arcLabelsTextColor={"var(--text-inverted)"}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsStraightLength={10}
                arcLinkLabelsThickness={2}
                activeOuterRadiusOffset={8}
                arcLinkLabelsTextColor="white"
                arcLinkLabelsColor={{
                    from: "color",
                    modifiers: [["darker", 1]],
                }}
                margin={{ top: 30, right: 140, bottom: 30, left: 140 }}
                arcLinkLabel={(e) => toTitleCase(e.id.toString() ?? "")}
                arcLabel={(e) =>
                    nivoData.total === 0
                        ? "0%"
                        : (((e.value ?? 0) / nivoData.total) * 100).toFixed(1) +
                          "%"
                }
                tooltip={({ datum }) => (
                    <PieChartTooltip
                        datum={datum}
                        total={nivoData.total}
                        descriptionFormatter={(value: number) =>
                            `${value.toLocaleString()} characters (${nivoData.total === 0 ? "0.00" : ((value / nivoData.total) * 100).toFixed(2)}%)`
                        }
                    />
                )}
                isInteractive={!isLoading && !isError}
            />
        </ChartScaffold>
    )
}

export default GenderPopulationDistribution
