import React, { useMemo, useState } from "react"
import { NivoPieSlice } from "../../utils/nivoUtils.ts"
import { PIE_CHART_MARGIN, PIE_CHART_THEME } from "./pieChartConfig.ts"
import { createHighlightColorFunction } from "./chartColorUtils.ts"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import Stack from "../global/Stack.tsx"
import { ResponsivePie } from "@nivo/pie"
import GenericLegend from "./GenericLegend.tsx"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import PieChartTooltip from "./PieChartTooltip.tsx"

interface GenericPieProps {
    nivoData: NivoPieSlice[]
    showLegend?: boolean
    margin?: any
    spotlightSeries?: string[]
    descriptionFormatter?: (value: number, total: number) => string
}

const GenericPie = ({
    nivoData = [],
    showLegend = true,
    margin = PIE_CHART_MARGIN,
    spotlightSeries = [],
    descriptionFormatter = (value: number) => value.toString(),
}: GenericPieProps) => {
    const [excludedSeries, setExcludedSeries] = useState<string[]>([])
    const [highlightedSeries, setHighlightedSeries] =
        useState<string[]>(spotlightSeries)

    const handleItemClick = (serverId: string) => {
        setExcludedSeries((prev) =>
            prev.includes(serverId)
                ? prev.filter((id) => id !== serverId)
                : [...prev, serverId]
        )
    }

    const handleItemHover = (serverId: string) => {
        if (!serverId) {
            setHighlightedSeries([])
            return
        }
        setHighlightedSeries([serverId])
    }

    const getServerColor = createHighlightColorFunction(highlightedSeries)

    const filteredData = useMemo(() => {
        return nivoData.filter(
            (series) =>
                !excludedSeries.includes(series.id) &&
                SERVER_NAMES_LOWER.includes(series.id.toLowerCase())
        )
    }, [nivoData, excludedSeries])

    const total = useMemo(() => {
        return filteredData.reduce((sum, slice) => sum + slice.value, 0)
    }, [filteredData])

    return (
        <Stack direction="column" gap="10px">
            <div className="pie-container">
                <ResponsivePie
                    data={filteredData}
                    margin={margin}
                    colors={(d) => getServerColor(d.id.toString())}
                    theme={PIE_CHART_THEME}
                    cornerRadius={5}
                    sortByValue={true}
                    borderWidth={1}
                    arcLabelsSkipAngle={15}
                    arcLabelsTextColor={"var(--text-inverted)"}
                    arcLabel={(e) =>
                        (((e.value ?? 0) / total) * 100).toFixed(1) + "%"
                    }
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsStraightLength={10}
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsTextColor="white"
                    arcLinkLabelsColor={{
                        from: "color",
                        modifiers: [["darker", 1]],
                    }}
                    arcLinkLabel={(e) => toSentenceCase(e.id.toString() ?? "")}
                    tooltip={({ datum }) => (
                        <PieChartTooltip
                            datum={datum}
                            total={total}
                            descriptionFormatter={descriptionFormatter}
                        />
                    )}
                    animate={true}
                    activeOuterRadiusOffset={8}
                />
            </div>
            {showLegend && (
                <GenericLegend
                    nivoData={nivoData}
                    onItemClick={handleItemClick}
                    onItemHover={handleItemHover}
                    excludedSeries={excludedSeries}
                />
            )}
        </Stack>
    )
}

export default GenericPie
