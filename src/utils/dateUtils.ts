import { DAYS_OF_WEEK } from "../constants/dates"

const dateToLongString = (date?: Date): string => {
    if (!date) return "Unknown date"

    if (isNaN(date.getTime())) return "Invalid date"

    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

const dateToLongStringWithTime = (date?: Date): string => {
    if (!date) return "Unknown date"
    if (isNaN(date.getTime())) return "Invalid date"
    return date.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    })
}

const dateToShortStringWithTime = (date?: Date): string => {
    if (!date) return "Unknown date"
    if (isNaN(date.getTime())) return "Invalid date"
    return date.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    })
}

const numberToDayOfWeek = (day: number): string => {
    return DAYS_OF_WEEK[day] || "Unknown"
}

const dayOfWeekToNumber = (dayOfWeek: string): number => {
    return DAYS_OF_WEEK.findIndex(
        (day) => day.toLowerCase() === dayOfWeek?.toLowerCase()
    )
}

const numberToHourOfDay = (hour: number): string => {
    const date = new Date()
    date.setHours(hour)

    return date.toLocaleString("en-US", {
        hour: "numeric",
        hour12: true,
    })
}

export {
    dateToLongString,
    dateToLongStringWithTime,
    numberToDayOfWeek,
    numberToHourOfDay,
    dayOfWeekToNumber,
    dateToShortStringWithTime,
}
