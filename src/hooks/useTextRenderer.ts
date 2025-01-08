import { useCallback } from "react"
import { BoundingBox } from "../models/Geometry.ts"
import { wrapText } from "../utils/stringUtils.ts"

interface ConfineTextProps {
    text?: string
    boundingBox: BoundingBox
    font: string
    maxLines?: number
    centered?: boolean
}
interface ConfineTextReturnType {
    textLines: string[]
    lineHeight: number
    boundingBox: BoundingBox
}

const useTextRenderer = (
    context?: CanvasRenderingContext2D | null
): {
    confineTextToBoundingBox: (props: ConfineTextProps) => ConfineTextReturnType
} => {
    const confineTextToBoundingBox = useCallback(
        ({
            text,
            boundingBox,
            font,
            maxLines,
            centered,
        }: ConfineTextProps): ConfineTextReturnType => {
            if (!text || text.length === 0 || context == null) {
                return {
                    textLines: [],
                    lineHeight: 0,
                    boundingBox: new BoundingBox(0, 0, 0, 0),
                }
            }

            const initialFont = context.font
            context.font = font
            const measuredText = context.measureText(text)
            const fontHeight =
                measuredText.actualBoundingBoxAscent +
                measuredText.actualBoundingBoxDescent
            // take care of wrapping...
            const wrappedText = wrapText(text, boundingBox.width, font, context)
            // take care of height...
            const lineHeight = fontHeight * 1.33
            const textLines: string[] = []
            wrappedText.forEach((line, index) => {
                const totalHeight = (index + 1) * lineHeight
                if (
                    totalHeight <= boundingBox.height &&
                    (maxLines ? index < maxLines : true)
                )
                    textLines.push(line ? line.trim() : "")
            })
            if (textLines.length < wrappedText.length) {
                // was truncated
                if (textLines.length - 1 >= 0) {
                    textLines[textLines.length - 1] =
                        textLines[textLines.length - 1].slice(0, -3) + "..."
                }
            }
            const longestLine = textLines.reduce((previous, current) => {
                return Math.max(context.measureText(current).width, previous)
            }, 0)
            const actualBoundingBox: BoundingBox = new BoundingBox(
                boundingBox.x +
                    (centered ? boundingBox.width / 2 - longestLine / 2 : 0),
                boundingBox.y +
                    (centered
                        ? boundingBox.height / 2 -
                          (textLines.length * lineHeight) / 2
                        : 0),
                longestLine,
                textLines.length * lineHeight
            )
            context.font = initialFont
            return {
                textLines,
                lineHeight,
                boundingBox: actualBoundingBox,
            }
        },
        [context]
    )

    return { confineTextToBoundingBox }
}

export default useTextRenderer
