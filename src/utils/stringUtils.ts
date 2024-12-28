import { CharacterClass } from "../models/Character.ts"

function toSentenceCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function convertMillisecondsToPrettyString(
    millis: number,
    commaSeparated: boolean = false
): string {
    const seconds = Math.floor(millis / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    let resultArray: string[] = []
    if (days > 0) resultArray.push(`${days} day${days > 1 ? "s" : ""}`)
    if (hours % 24 > 0)
        resultArray.push(`${hours % 24} hour${hours > 1 ? "s" : ""}`)
    if (minutes % 60 > 0 && hours < 12) resultArray.push(`${minutes % 60} min`)
    if (seconds % 60 > 0 && minutes < 30 && hours === 0)
        resultArray.push(`${seconds % 60} sec`)

    return resultArray.join(commaSeparated ? ", " : " ").trim()
}

function mapClassesToString(classes?: CharacterClass[]): string {
    const excludedClasses = ["Epic", "Legendary"]

    if (!classes) return ""
    return classes
        .filter(
            (characterClass) => !excludedClasses.includes(characterClass.name)
        )
        .map(
            (characterClass) => `${characterClass.name} ${characterClass.level}`
        )
        .join(", ")
}

export { toSentenceCase, convertMillisecondsToPrettyString, mapClassesToString }
