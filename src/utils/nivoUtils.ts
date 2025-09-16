import { DEFAULT_TIMEZONE } from "../constants/client"
import { PopulationPointInTime } from "../models/Game"
import {
    AveragePopulationData,
    PopulationByDayOfWeekData,
    DataTypeFilterEnum,
    PopulationByHourData,
} from "../models/Population"
import { numberToDayOfWeek } from "./dateUtils"
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

export interface NivoBarSlice {
    index: string
    [key: string]: number | string
}

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

/**
 * Converts population point-in-time data to Nivo date series format.
 * @param data Array of PopulationPointInTime objects
 * @param timezone IANA timezone string (e.g., 'UTC', 'America/New_York')
 * @returns Array of NivoDateSeries for Nivo charts
 */
function convertToNivoFormat(
    data: PopulationPointInTime[],
    timezone: string,
    dataType: DataTypeFilterEnum = DataTypeFilterEnum.CHARACTERS
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
                const tz = timezone || DEFAULT_TIMEZONE
                const zonedDate = toZonedTime(date, tz)
                const value =
                    dataType === DataTypeFilterEnum.CHARACTERS
                        ? dataPoint.character_count
                        : dataPoint.lfm_count
                addToSeries(series, serverName, {
                    x: zonedDate,
                    y: value,
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
    data: AveragePopulationData,
    dataType: DataTypeFilterEnum = DataTypeFilterEnum.CHARACTERS
): NivoPieSlice[] {
    if (!data || Object.keys(data).length === 0) return []
    const slices: NivoPieSlice[] = []
    Object.entries(data).forEach(([serverName, serverData]) => {
        const serverValue =
            dataType === DataTypeFilterEnum.CHARACTERS
                ? serverData?.avg_character_count
                : serverData?.avg_lfm_count
        slices.push({
            id: serverName.toLowerCase(),
            label: toSentenceCase(serverName),
            value: Math.round((serverValue ?? 0) * 10) / 10,
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
    data: PopulationByHourData,
    dataType: DataTypeFilterEnum = DataTypeFilterEnum.CHARACTERS
): NivoNumberSeries[] {
    if (!data || Object.keys(data).length === 0) return []
    const series: NivoNumberSeries[] = []
    Object.entries(data).forEach(([serverName, hoursData]) => {
        Object.entries(hoursData).forEach(([hour, hourData]) => {
            addToSeries(series, serverName.toLowerCase(), {
                x: parseInt(hour),
                y:
                    dataType === DataTypeFilterEnum.CHARACTERS
                        ? (hourData.avg_character_count ?? 0)
                        : (hourData.avg_lfm_count ?? 0),
            })
        })
    })
    return series
}

function convertByDayOfWeekPopulationDataToNivoFormat(
    data: PopulationByDayOfWeekData,
    dataType: DataTypeFilterEnum = DataTypeFilterEnum.CHARACTERS
): NivoBarSlice[] {
    if (!data || Object.keys(data).length === 0) return []
    const slices: NivoBarSlice[] = []
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]
    daysOfWeek.forEach((dayOfWeek) => {
        const dayName = numberToDayOfWeek(dayOfWeek)
        const slice: NivoBarSlice = { index: dayName }
        Object.entries(data).forEach(([serverName, serverData]) => {
            slice[serverName.toLowerCase()] =
                dataType === DataTypeFilterEnum.CHARACTERS
                    ? (serverData[dayOfWeek]?.avg_character_count ?? 0)
                    : (serverData[dayOfWeek]?.avg_lfm_count ?? 0)
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
