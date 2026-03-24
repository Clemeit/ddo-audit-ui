import { useCallback, useMemo } from "react"
import {
    LFM_HEIGHT,
    LFM_COLORS,
    FONTS,
    LFM_AREA_PADDING,
    MINIMUM_LFM_COUNT,
    SORT_HEADERS,
} from "../constants/lfmPanel.ts"
import { useLfmContext } from "../contexts/LfmContext.tsx"
import { calculateCommonBoundingBoxes } from "../utils/lfmUtils.ts"
import { SPRITE_MAP } from "../constants/spriteMap.ts"
import useRenderBox from "../utils/renderUtils.ts"
import { BoundingBox } from "../models/Geometry.ts"

interface Props {
    sprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
    raidView?: boolean
}

const useRenderLfmPanel = ({ sprite, context, raidView = false }: Props) => {
    const { panelWidth, sortBy } = useLfmContext()
    const commonBoundingBoxes = useMemo(
        () => calculateCommonBoundingBoxes(panelWidth),
        [panelWidth]
    )
    const fonts = useMemo(() => FONTS(), [])
    const sortHeaders = useMemo(
        () => SORT_HEADERS(commonBoundingBoxes),
        [commonBoundingBoxes]
    )
    const { renderSortHeader } = useRenderBox({
        sprite,
        context,
    })

    /** Draw background fill. Call before rendering LFMs. */
    const renderBackground = useCallback(
        (viewportHeight: number) => {
            if (!context || !sprite) return
            context.imageSmoothingEnabled = false
            context.fillStyle = LFM_COLORS.BLACK_BACKGROUND
            context.fillRect(0, 0, panelWidth, viewportHeight)
        },
        [sprite, context, panelWidth]
    )

    /** Draw sort headers and info messages. Call after LFMs. */
    const renderSortHeaders = useCallback(
        (
            _viewportHeight: number,
            renderedLfmCount: number,
            excludedLfmCount: number,
            isLoading: boolean
        ) => {
            if (!context || !sprite || raidView) return
            context.imageSmoothingEnabled = false

            // Fill sort header background so LFMs don't show through when scrolled
            context.fillStyle = LFM_COLORS.BLACK_BACKGROUND
            context.fillRect(
                SPRITE_MAP.CONTENT_LEFT.width,
                SPRITE_MAP.CONTENT_TOP.height,
                panelWidth -
                    SPRITE_MAP.CONTENT_LEFT.width -
                    SPRITE_MAP.CONTENT_RIGHT.width,
                LFM_AREA_PADDING.top + SPRITE_MAP.SORT_HEADER.CENTER.height
            )

            // Draw sorting headers
            context.fillStyle = LFM_COLORS.LEADER_NAME
            context.font = fonts.SORT_HEADER
            context.textBaseline = "middle"
            context.textAlign = "left"
            sortHeaders.forEach(({ type, boundingBox, displayText }) => {
                const sortHeaderType =
                    sortBy?.type === type
                        ? "SORT_HEADER_HIGHLIGHTED"
                        : "SORT_HEADER"
                const actualBoundingBox = new BoundingBox(
                    boundingBox.x +
                        SPRITE_MAP.CONTENT_LEFT.width +
                        LFM_AREA_PADDING.left,
                    boundingBox.y +
                        SPRITE_MAP.CONTENT_TOP.height +
                        LFM_AREA_PADDING.top,
                    boundingBox.width,
                    SPRITE_MAP[sortHeaderType].CENTER.height
                )
                renderSortHeader({
                    boundingBox: actualBoundingBox,
                    text: displayText,
                    font: fonts.SORT_HEADER,
                    left: SPRITE_MAP[sortHeaderType].LEFT,
                    center: SPRITE_MAP[sortHeaderType].CENTER,
                    right: SPRITE_MAP[sortHeaderType].RIGHT,
                    textOffsetX: sortBy?.type === type ? 20 : 10,
                })
                if (sortBy?.type === type) {
                    context.save()
                    context.shadowBlur = 2
                    context.shadowColor = "black"
                    context.shadowOffsetX = 1
                    context.shadowOffsetY = 1
                    const triangleX = actualBoundingBox.x + 10
                    if (sortBy.ascending) {
                        const triangleY = actualBoundingBox.centerY() - 3
                        context.beginPath()
                        context.moveTo(triangleX, triangleY + 5)
                        context.lineTo(triangleX + 5, triangleY + 5)
                        context.lineTo(triangleX + 2.5, triangleY)
                        context.fill()
                    } else {
                        const triangleY = actualBoundingBox.centerY() - 2
                        context.beginPath()
                        context.moveTo(triangleX, triangleY)
                        context.lineTo(triangleX + 5, triangleY)
                        context.lineTo(triangleX + 2.5, triangleY + 5)
                        context.fill()
                    }
                    context.restore()
                }
            })

            // Show hidden groups message
            if (renderedLfmCount === 0 && excludedLfmCount > 0 && !isLoading) {
                context.setTransform(1, 0, 0, 1, 0, 0)
                context.fillStyle = LFM_COLORS.SECONDARY_TEXT
                context.font = fonts.MISC_INFO_MESSAGE
                context.textAlign = "center"
                context.fillText(
                    `${excludedLfmCount} ${excludedLfmCount !== 1 ? "groups were" : "group was"} hidden by your filter settings`,
                    panelWidth / 2,
                    150
                )
            }
        },
        [sprite, context, raidView, panelWidth, fonts, sortBy, sortHeaders]
    )

    return { renderSortHeaders, renderBackground }
}

export default useRenderLfmPanel
