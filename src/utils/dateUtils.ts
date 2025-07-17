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

export { dateToLongString }
