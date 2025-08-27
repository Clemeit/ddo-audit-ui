/**
 * Adds a data point to the correct series, or creates a new series if needed.
 */
function addToSeries(
    series: Array<{ id: string; data: any[] }>,
    serverName: string,
    dataPoint: any
) {
    const existingSeries = series.find((s) => s.id === serverName)
    if (existingSeries) {
        existingSeries.data.push(dataPoint)
    } else {
        series.push({ id: serverName, data: [dataPoint] })
    }
}
import { PopulationPointInTime } from "../models/Game"
import {
    AveragePopulationData,
    PopulationByHourData,
} from "../models/Population"
import { toSentenceCase } from "./stringUtils"
import { toZonedTime } from "date-fns-tz"

export interface NivoDateSeries {
    id: string
    data: { x: Date; y: number }[]
}

export interface NivoNumberSeries {
    id: string
    data: { x: number; y: number }[]
}

export interface NivoPieSlice {
    id: string
    label: string
    value: number
}

/**
 * Converts population point-in-time data to Nivo date series format.
 * @param data Array of PopulationPointInTime objects
 * @param timezone IANA timezone string (e.g., 'UTC', 'America/New_York')
 * @returns Array of NivoDateSeries for Nivo charts
 */
function convertToNivoFormat(
    data: PopulationPointInTime[],
    timezone: string
): NivoDateSeries[] {
    if (!data || data.length === 0) {
        return []
    }
    const series: NivoDateSeries[] = []
    data.forEach((point) => {
        if (point.data) {
            Object.entries(point.data).forEach(([serverName, dataPoint]) => {
                const date = new Date(point.timestamp || "")
                if (isNaN(date.getTime())) {
                    // Invalid timestamp, skip
                    console.warn(
                        `Invalid timestamp for server ${serverName}:`,
                        point.timestamp
                    )
                    return
                }
                const tz = timezone || "UTC"
                const zonedDate = toZonedTime(date, tz)
                addToSeries(series, serverName, {
                    x: zonedDate,
                    y: dataPoint.character_count,
                })
            })
        }
    })
    return series
}

/**
 * Converts average population data to Nivo pie slice format.
 * @param data AveragePopulationData object
 * @returns Array of NivoPieSlice for Nivo pie charts
 */
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

/**
 * Converts population by hour data to Nivo number series format.
 * @param data PopulationByHourData object
 * @returns Array of NivoNumberSeries for Nivo charts
 */
function convertByHourPopulationDataToNivoFormat(
    data: PopulationByHourData
): NivoNumberSeries[] {
    if (!data || Object.keys(data).length === 0) return []
    const series: NivoNumberSeries[] = []
    Object.entries(data).forEach(([serverName, hoursData]) => {
        Object.entries(hoursData).forEach(([hour, count]) => {
            addToSeries(series, serverName.toLowerCase(), {
                x: parseInt(hour),
                y: count ?? 0,
            })
        })
    })
    return series
}

export {
    convertToNivoFormat,
    convertAveragePopulationDataToNivoFormat,
    convertByHourPopulationDataToNivoFormat,
}
