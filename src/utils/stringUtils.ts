import { CharacterClass } from "../models/Character.ts"

function toSentenceCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function toPossessiveCase(str: string): string {
    return str.endsWith("s") ? `${str}'` : `${str}'s`
}

function convertMillisecondsToPrettyString(
    millis: number,
    commaSeparated: boolean = false,
    useFullWords: boolean = false,
    onlyIncludeLargest: boolean = false
): string {
    if (millis == 0) {
        return "0 seconds"
    } else if (millis < 0) {
        return "in the past"
    }

    const seconds = Math.floor(millis / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    const resultArray: string[] = []
    if (days > 0) resultArray.push(`${days} day${days > 1 ? "s" : ""}`)
    if (hours % 24 > 0)
        resultArray.push(`${hours % 24} hour${hours > 1 ? "s" : ""}`)
    if (minutes % 60 > 0 && hours < 12)
        resultArray.push(
            `${minutes % 60} min${useFullWords ? "ute" : ""}${minutes > 1 ? "s" : ""}`
        )
    if (seconds % 60 > 0 && minutes < 30 && hours === 0)
        resultArray.push(
            `${seconds % 60} sec${useFullWords ? "ond" : ""}${seconds > 1 ? "s" : ""}`
        )

    if (onlyIncludeLargest) {
        return resultArray[0]
    }
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
    font: string,
    context: CanvasRenderingContext2D,
    maxLines?: number
) {
    if (!text || text.length === 0) return [""]

    const previousFont = context.font
    context.font = font

    const words = text.split(" ")
    let line = ""
    let lines: string[] = []

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " "
        const testWidth = context.measureText(testLine).width
        if (testWidth > width) {
            const wordWidth = context.measureText(words[i]).width
            lines.push(line ? line.trim() : "")
            if (wordWidth > width) {
                const letters = words[i].split("")
                let partialWord = ""
                for (let j = 0; j < letters.length; j++) {
                    const testPartialWord = partialWord + letters[j]
                    const testPartialWidth =
                        context.measureText(testPartialWord).width
                    if (testPartialWidth > width) {
                        lines.push(partialWord.slice(0, -3) + "...")
                        partialWord = ""
                    }
                    partialWord += letters[j]
                }
            } else {
                line = words[i] + " "
            }
        } else {
            line = testLine
        }
    }

    lines.push(line)
    if (maxLines && lines.length > maxLines) {
        lines = lines.slice(0, maxLines)
        const originalLastLine = lines[maxLines - 1]
        const letters = originalLastLine.split("")
        let testLine = ""
        for (let i = 0; i < letters.length; i++) {
            testLine += letters[i]
            if (context.measureText(testLine).width > width) {
                lines[maxLines - 1] = testLine.slice(0, -3)
                break
            }
        }
    }

    context.font = previousFont

    return lines.filter((line) => line.length > 0).map((line) => line.trim())
}

function truncateText(
    text: string,
    width: number,
    font: string,
    context: CanvasRenderingContext2D
) {
    const previousFont = context.font
    context.font = font
    const ellipsisWidth = context.measureText("...").width
    let truncatedText = text
    let wasTruncated = false
    while (context.measureText(truncatedText).width > width - ellipsisWidth) {
        truncatedText = truncatedText.slice(0, -1)
        wasTruncated = true
    }
    context.font = previousFont
    return truncatedText.trim() + (wasTruncated ? "..." : "")
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

function pluralize(word: string, count: number | undefined): string {
    return count === 1 ? word : `${word}s`
}

function levenshteinDistance(s: string, t: string): number {
    if (!s.length) return t.length
    if (!t.length) return s.length
    const arr: number[][] = []
    for (let i = 0; i <= t.length; i++) {
        arr[i] = [i]
        for (let j = 1; j <= s.length; j++) {
            arr[i][j] =
                i === 0
                    ? j
                    : Math.min(
                          arr[i - 1][j] + 1,
                          arr[i][j - 1] + 1,
                          arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
                      )
        }
    }
    return arr[t.length][s.length]
}

export {
    toSentenceCase,
    toPossessiveCase,
    convertMillisecondsToPrettyString,
    mapClassesToString,
    wrapText,
    getTextSize,
    pluralize,
    truncateText,
    levenshteinDistance,
}
