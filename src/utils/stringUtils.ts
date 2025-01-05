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

function wrapText(
    text: string,
    width: number,
    maxLines: number,
    font: string,
    context: CanvasRenderingContext2D
) {
    if (text.length === 0) return [""]

    const previousFont = context.font
    context.font = font

    const words = text.split(" ")
    let line = ""
    let lines: string[] = []

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " "
        const testWidth = context.measureText(testLine).width
        if (testWidth > width) {
            lines.push(line)
            line = words[i] + " "
        } else {
            line = testLine
        }
    }

    lines.push(line)
    if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines)
        lines[maxLines - 1] = lines[maxLines - 1].slice(0, -3) + "..."
    }

    context.font = previousFont

    return lines
}

function getTextSize(
    text: string,
    font: string,
    context: CanvasRenderingContext2D
): { width: number; height: number } {
    const previousFont = context.font
    context.font = font
    const metrics = context.measureText(text)
    const width = metrics.width
    const height =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    context.font = previousFont
    return { width, height }
}

export {
    toSentenceCase,
    convertMillisecondsToPrettyString,
    mapClassesToString,
    wrapText,
    getTextSize,
}
