import { PopulationPointInTime } from "../models/Game"
import {
    AveragePopulationData,
    PopulationByDayOfWeekData,
    PopulationByHourData,
} from "../models/Population"
import { numberToDayOfWeek } from "./dateUtils"
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

export interface NivoBarSlice {
    index: string
    [key: string]: number | string
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

function convertByHourPopulationDataToNivoFormat(
    data: PopulationByHourData
): NivoSeries[] {
    if (!data || Object.keys(data).length === 0) return []
    const series: NivoSeries[] = []
    Object.entries(data).forEach(([serverName, hoursData]) => {
        const dataPoints = Object.entries(hoursData).map(([hour, count]) => ({
            x: hour,
            y: count ?? 0,
        }))
        series.push({
            id: serverName.toLowerCase(),
            data: dataPoints,
        })
    })
    return series
}

function convertByDayOfWeekPopulationDataToNivoFormat(
    data: PopulationByDayOfWeekData
): NivoBarSlice[] {
    if (!data || Object.keys(data).length === 0) return []
    const slices: NivoBarSlice[] = []
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]
    daysOfWeek.forEach((dayOfWeek) => {
        const dayName = numberToDayOfWeek(dayOfWeek)
        const slice: NivoBarSlice = { index: dayName }
        Object.entries(data).forEach(([serverName, serverData]) => {
            slice[serverName.toLowerCase()] = serverData[dayOfWeek] ?? 0
        })
        slices.push(slice)
    })
    return slices
}

export {
    convertToNivoFormat,
    convertAveragePopulationDataToNivoFormat,
    convertByHourPopulationDataToNivoFormat,
    convertByDayOfWeekPopulationDataToNivoFormat,
}
