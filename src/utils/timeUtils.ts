function MsFromSeconds(seconds: number): number {
    return seconds * 1000
}

function MsFromMinutes(minutes: number): number {
    return minutes * 60 * 1000
}

function MsFromHours(hours: number): number {
    return hours * 60 * 60 * 1000
}

function MsFromDays(days: number): number {
    return days * 24 * 60 * 60 * 1000
}

export { MsFromSeconds, MsFromMinutes, MsFromHours, MsFromDays }
