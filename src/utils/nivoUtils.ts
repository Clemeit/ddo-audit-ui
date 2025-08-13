import { PopulationPointInTime } from "../models/Game"
import { AveragePopulationData } from "../models/Population"
import { toSentenceCase } from "./stringUtils"

export interface NivoSeries {
    id: string
    data: { x: string; y: number }[]
}

export interface NivoPieSlice {
    id: string
    label: string
    value: number
}

function convertToNivoFormat(data: PopulationPointInTime[]): NivoSeries[] {
    if (!data || data.length === 0) {
        return []
    }
    const series: NivoSeries[] = []
    data.forEach((point) => {
        if (point.data) {
            Object.entries(point.data).forEach(([serverName, dataPoint]) => {
                const existingSeries = series.find((s) => s.id === serverName)
                if (existingSeries) {
                    existingSeries.data.push({
                        x: point.timestamp || "",
                        y: dataPoint.character_count,
                    })
                } else {
                    series.push({
                        id: serverName,
                        data: [
                            {
                                x: point.timestamp || "",
                                y: dataPoint.character_count,
                            },
                        ],
                    })
                }
            })
        }
    })
    return series
}

function convertAveragePopulationDataToNivoFormat(
    data: AveragePopulationData
): NivoPieSlice[] {
    if (!data || Object.keys(data).length === 0) return []
    const slices: NivoPieSlice[] = []
    Object.entries(data).forEach(([serverName, serverData]) => {
        slices.push({
            id: serverName.toLowerCase(),
            label: toSentenceCase(serverName),
            value: Math.round((serverData ?? 0) * 10) / 10,
        })
    })
    return slices
}

export { convertToNivoFormat, convertAveragePopulationDataToNivoFormat }
