import { useEffect, useMemo, useState } from "react"
import { ClassCountDemographicApiData } from "../../models/Demographics.ts"
import { RangeEnum, ServerFilterEnum } from "../../models/Common.ts"
import { getClassCountDemographic } from "../../services/demographicsService.ts"
import { NivoPieSlice } from "../../utils/nivoUtils.ts"
import {
    SERVERS_32_BITS_LOWER,
    SERVERS_64_BITS_LOWER,
} from "../../constants/servers.ts"
import FilterSelection from "../charts/FilterSelection.tsx"
import { ResponsivePie } from "@nivo/pie"
import { PIE_CHART_THEME } from "../charts/pieChartConfig.ts"
import { pluralize, toTitleCase } from "../../utils/stringUtils.ts"
import PieChartTooltip from "../charts/PieChartTooltip.tsx"

const ClassCountPopulationDistribution = () => {
    const [dataMap, setDataMap] = useState<
        Record<RangeEnum, ClassCountDemographicApiData | undefined>
    >({
        [RangeEnum.DAY]: undefined,
        [RangeEnum.WEEK]: undefined,
        [RangeEnum.MONTH]: undefined,
        [RangeEnum.QUARTER]: undefined,
        [RangeEnum.YEAR]: undefined,
    })
    const [rangeFilter, setRangeFilter] = useState<RangeEnum>(RangeEnum.QUARTER)
    const [serverFilter, setServerFilter] = useState<ServerFilterEnum>(
        ServerFilterEnum.ONLY_64_BIT
    )
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)

    useEffect(() => {
        const controller = new AbortController()
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const retrievedData = await getClassCountDemographic(
                    rangeFilter,
                    controller.signal
                )
                if (!controller.signal.aborted) {
                    setDataMap((prev) => ({
                        ...prev,
                        [rangeFilter]: retrievedData?.data,
                    }))
                    setIsError(false)
                }
            } catch (error) {
                if (!controller.signal.aborted) setIsError(true)
            } finally {
                if (!controller.signal.aborted) setIsLoading(false)
            }
        }

        if (dataMap[rangeFilter] === undefined) {
            fetchData()
        }

        return () => controller.abort()
    }, [rangeFilter])

    const nivoData: { data: NivoPieSlice[]; total: number } = useMemo(() => {
        if (!rangeFilter || !dataMap || !dataMap[rangeFilter])
            return { data: [], total: 0 }

        const nivoData: NivoPieSlice[] = []
        let total: number = 0
        Object.entries(dataMap[rangeFilter]).forEach(
            ([serverName, serverData]) => {
                if (
                    (serverFilter === ServerFilterEnum.ONLY_32_BIT &&
                        !SERVERS_32_BITS_LOWER.includes(
                            serverName.toLowerCase()
                        )) ||
                    (serverFilter === ServerFilterEnum.ONLY_64_BIT &&
                        !SERVERS_64_BITS_LOWER.includes(
                            serverName.toLowerCase()
                        ))
                ) {
                    return
                }

                Object.entries(serverData).forEach(([classCount, count]) => {
                    if (classCount === "0") return
                    const series = nivoData.find((s) => s.id === classCount)
                    total += count ?? 0
                    if (series) {
                        series.value += count ?? 0
                    } else {
                        nivoData.push({
                            id: classCount,
                            label: classCount,
                            value: count ?? 0,
                        })
                    }
                })
            }
        )

        return { data: nivoData, total: total }
    }, [rangeFilter, dataMap, serverFilter])

    return (
        <div>
            <FilterSelection
                range={rangeFilter}
                setRange={setRangeFilter}
                serverFilter={serverFilter}
                setServerFilter={setServerFilter}
            />
            <div style={{ height: "500px" }}>
                <ResponsivePie
                    data={nivoData.data}
                    colors={({ id }) => {
                        const classCount = Number(id)
                        // gradient from green to red based on class count (1-4)
                        if (classCount === 1) return "rgba(76, 175, 80, 1)" // green
                        if (classCount === 2) return "rgba(0, 162, 255, 1)" // orange
                        if (classCount === 3) return "rgba(222, 54, 244, 1)" // red
                        return "#888"
                    }}
                    theme={PIE_CHART_THEME}
                    cornerRadius={5}
                    sortByValue={true}
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
                    margin={{
                        top: 30,
                        right: 140,
                        bottom: 30,
                        left: 140,
                    }}
                    arcLinkLabel={(e) => {
                        return `${e.id.toString()} ${pluralize(
                            "class",
                            Number(e.id ?? 0)
                        )}`
                    }}
                    arcLabel={(e) =>
                        (((e.value ?? 0) / nivoData.total) * 100).toFixed(1) +
                        "%"
                    }
                    tooltip={({ datum }) => (
                        <PieChartTooltip
                            datum={datum}
                            total={nivoData.total}
                            titleFormatter={(value: string) =>
                                `${value} ${pluralize("class", Number(value ?? 0))}`
                            }
                            descriptionFormatter={(value: number) =>
                                `${value.toLocaleString()} characters (${((value / nivoData.total) * 100).toFixed(2)}%)`
                            }
                        />
                    )}
                />
            </div>
        </div>
    )
}

export default ClassCountPopulationDistribution
