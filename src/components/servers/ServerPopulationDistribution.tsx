import React, { useMemo } from "react"
import { AveragePopulationData } from "../../models/Population"
import GenericPie from "../charts/GenericPie"
import {
    convertAveragePopulationDataToNivoFormat,
    NivoPieSlice,
    NivoSeries,
} from "../../utils/nivoUtils"

interface Props {
    averageData?: AveragePopulationData
}

const ServerPopulationDistribution = ({ averageData }: Props) => {
    const nivoData = useMemo<NivoPieSlice[]>(() => {
        if (!averageData) return []
        return convertAveragePopulationDataToNivoFormat(averageData)
    }, [averageData])

    const descriptionFormatter = (value: number, total: number) => {
        return `${value.toFixed(1)} average characters (${((value / total) * 100).toFixed(1)}%)`
    }

    return (
        <GenericPie
            nivoData={nivoData}
            showLegend
            descriptionFormatter={descriptionFormatter}
        />
    )
}

export default ServerPopulationDistribution
