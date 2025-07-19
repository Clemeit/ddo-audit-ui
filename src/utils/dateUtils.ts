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

export { dateToLongString, dateToLongStringWithTime }
