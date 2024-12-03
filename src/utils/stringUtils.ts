function toSentenceCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function convertMillisecondsToPrettyString(millis: number): string {
    const seconds = Math.floor(millis / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    let result = ""
    if (days > 0) result += `${days} day${days > 1 ? "s" : ""} `
    if (hours > 0) result += `${hours % 24} hour${hours > 1 ? "s" : ""} `
    if (minutes > 0 && !result) result += `${minutes % 60} min `
    if (seconds > 0 && !result) result += `${seconds % 60} sec`

    return result.trim()
}

export { toSentenceCase, convertMillisecondsToPrettyString }
