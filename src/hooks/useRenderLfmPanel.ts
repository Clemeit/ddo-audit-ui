import { useCallback, useMemo } from "react"
import {
    LFM_HEIGHT,
    LFM_COLORS,
    FONTS,
    LFM_PANEL_TOP_BORDER_HEIGHT,
    LFM_AREA_PADDING,
    MINIMUM_LFM_COUNT,
    SORT_HEADERS,
} from "../constants/lfmPanel.ts"
import { useLfmContext } from "../contexts/LfmContext.tsx"
import { calculateCommonBoundingBoxes } from "../utils/lfmUtils.ts"
import { SPRITE_MAP } from "../constants/spriteMap.ts"

interface Props {
    lfmSprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
    minimumLfmCount?: number
    raidView?: boolean
}

const useRenderLfmPanel = ({
    lfmSprite,
    context,
    minimumLfmCount = MINIMUM_LFM_COUNT,
    raidView = false,
}: Props) => {
    const { panelWidth, sortBy } = useLfmContext()
    const commonBoundingBoxes = useMemo(
        () => calculateCommonBoundingBoxes(panelWidth),
        [panelWidth]
    )
    const fonts = useMemo(() => FONTS(0), [])
    const sortHeaders = useMemo(
        () => SORT_HEADERS(commonBoundingBoxes),
        [commonBoundingBoxes]
    )

    const renderLfmPanelToCanvas = useCallback(
        (panelHeight: number) => {
            if (!context || !lfmSprite) return
            context.imageSmoothingEnabled = false

            context.fillStyle = "black"
            context.fillRect(
                0,
                raidView ? 0 : SPRITE_MAP.HEADER_BAR.height,
                panelWidth,
                panelHeight
            )

            if (!raidView) {
                // draw header
                for (
                    let i = 0;
                    i <= Math.round(panelWidth / SPRITE_MAP.HEADER_BAR.width);
                    i++
                ) {
                    context.drawImage(
                        lfmSprite,
                        SPRITE_MAP.HEADER_BAR.x,
                        SPRITE_MAP.HEADER_BAR.y,
                        SPRITE_MAP.HEADER_BAR.width,
                        SPRITE_MAP.HEADER_BAR.height,
                        SPRITE_MAP.HEADER_LEFT.width +
                            SPRITE_MAP.HEADER_BAR.width * i,
                        0,
                        SPRITE_MAP.HEADER_BAR.width,
                        SPRITE_MAP.HEADER_BAR.height
                    )
                }
                context.drawImage(
                    lfmSprite,
                    SPRITE_MAP.HEADER_LEFT.x,
                    SPRITE_MAP.HEADER_LEFT.y,
                    SPRITE_MAP.HEADER_LEFT.width,
                    SPRITE_MAP.HEADER_LEFT.height,
                    0,
                    0,
                    SPRITE_MAP.HEADER_LEFT.width,
                    SPRITE_MAP.HEADER_LEFT.height
                )
                context.drawImage(
                    lfmSprite,
                    SPRITE_MAP.HEADER_RIGHT.x,
                    SPRITE_MAP.HEADER_RIGHT.y,
                    SPRITE_MAP.HEADER_RIGHT.width,
                    SPRITE_MAP.HEADER_RIGHT.height,
                    panelWidth - SPRITE_MAP.HEADER_RIGHT.width,
                    0,
                    SPRITE_MAP.HEADER_RIGHT.width,
                    SPRITE_MAP.HEADER_RIGHT.height
                )
                context.fillStyle = "white"
                context.font = fonts.MAIN_HEADER
                context.textBaseline = "middle"
                context.textAlign = "center"
                context.fillText(
                    "Grouping Panel - DDO Audit",
                    panelWidth / 2,
                    SPRITE_MAP.HEADER_BAR.height / 2 + 3
                )

                // draw top border
                for (
                    let i = 0;
                    i <= Math.round(panelWidth / SPRITE_MAP.CONTENT_TOP.width);
                    i++
                ) {
                    context.drawImage(
                        lfmSprite,
                        SPRITE_MAP.CONTENT_TOP.x,
                        SPRITE_MAP.CONTENT_TOP.y,
                        SPRITE_MAP.CONTENT_TOP.width,
                        SPRITE_MAP.CONTENT_TOP.height,
                        SPRITE_MAP.CONTENT_TOP.width * i,
                        SPRITE_MAP.HEADER_BAR.height,
                        SPRITE_MAP.CONTENT_TOP.width,
                        SPRITE_MAP.CONTENT_TOP.height
                    )
                }
                context.drawImage(
                    lfmSprite,
                    SPRITE_MAP.CONTENT_TOP_LEFT.x,
                    SPRITE_MAP.CONTENT_TOP_LEFT.y,
                    SPRITE_MAP.CONTENT_TOP_LEFT.width,
                    SPRITE_MAP.CONTENT_TOP_LEFT.height,
                    0,
                    SPRITE_MAP.HEADER_BAR.height,
                    SPRITE_MAP.CONTENT_TOP_LEFT.width,
                    SPRITE_MAP.CONTENT_TOP_LEFT.height
                )
                context.drawImage(
                    lfmSprite,
                    SPRITE_MAP.CONTENT_TOP_RIGHT.x,
                    SPRITE_MAP.CONTENT_TOP_RIGHT.y,
                    SPRITE_MAP.CONTENT_TOP_RIGHT.width,
                    SPRITE_MAP.CONTENT_TOP_RIGHT.height,
                    panelWidth - SPRITE_MAP.CONTENT_TOP_RIGHT.width,
                    SPRITE_MAP.HEADER_BAR.height,
                    SPRITE_MAP.CONTENT_TOP_RIGHT.width,
                    SPRITE_MAP.CONTENT_TOP_RIGHT.height
                )
            }

            // draw left and right borders
            context.translate(0, raidView ? 0 : LFM_PANEL_TOP_BORDER_HEIGHT)
            for (let i = 0; i < Math.round(panelHeight / LFM_HEIGHT); i++) {
                context.drawImage(
                    lfmSprite,
                    SPRITE_MAP.CONTENT_LEFT.x,
                    SPRITE_MAP.CONTENT_LEFT.y,
                    SPRITE_MAP.CONTENT_LEFT.width,
                    SPRITE_MAP.CONTENT_LEFT.height,
                    0,
                    LFM_HEIGHT * i,
                    SPRITE_MAP.CONTENT_LEFT.width,
                    LFM_HEIGHT
                )

                context.drawImage(
                    lfmSprite,
                    SPRITE_MAP.CONTENT_RIGHT.x,
                    SPRITE_MAP.CONTENT_RIGHT.y,
                    SPRITE_MAP.CONTENT_RIGHT.width,
                    SPRITE_MAP.CONTENT_RIGHT.height,
                    panelWidth - SPRITE_MAP.CONTENT_RIGHT.width,
                    LFM_HEIGHT * i,
                    SPRITE_MAP.CONTENT_RIGHT.width,
                    LFM_HEIGHT
                )
            }
            context.setTransform(1, 0, 0, 1, 0, 0)

            if (!raidView) {
                // draw bottom border
                for (
                    let i = 0;
                    i <=
                    Math.round(panelWidth / SPRITE_MAP.CONTENT_BOTTOM.width);
                    i++
                ) {
                    context.drawImage(
                        lfmSprite,
                        SPRITE_MAP.CONTENT_BOTTOM.x,
                        SPRITE_MAP.CONTENT_BOTTOM.y,
                        SPRITE_MAP.CONTENT_BOTTOM.width,
                        SPRITE_MAP.CONTENT_BOTTOM.height,
                        SPRITE_MAP.CONTENT_BOTTOM.width * i,
                        panelHeight - SPRITE_MAP.CONTENT_BOTTOM.height,
                        SPRITE_MAP.CONTENT_BOTTOM.width,
                        SPRITE_MAP.CONTENT_BOTTOM.height
                    )
                }
                context.drawImage(
                    lfmSprite,
                    SPRITE_MAP.CONTENT_BOTTOM_LEFT.x,
                    SPRITE_MAP.CONTENT_BOTTOM_LEFT.y,
                    SPRITE_MAP.CONTENT_BOTTOM_LEFT.width,
                    SPRITE_MAP.CONTENT_BOTTOM_LEFT.height,
                    0,
                    panelHeight - SPRITE_MAP.CONTENT_BOTTOM.height,
                    SPRITE_MAP.CONTENT_BOTTOM_LEFT.width,
                    SPRITE_MAP.CONTENT_BOTTOM_LEFT.height
                )
                context.drawImage(
                    lfmSprite,
                    SPRITE_MAP.CONTENT_BOTTOM_RIGHT.x,
                    SPRITE_MAP.CONTENT_BOTTOM_RIGHT.y,
                    SPRITE_MAP.CONTENT_BOTTOM_RIGHT.width,
                    SPRITE_MAP.CONTENT_BOTTOM_RIGHT.height,
                    panelWidth - SPRITE_MAP.CONTENT_BOTTOM_RIGHT.width,
                    panelHeight - SPRITE_MAP.CONTENT_BOTTOM.height,
                    SPRITE_MAP.CONTENT_BOTTOM_RIGHT.width,
                    SPRITE_MAP.CONTENT_BOTTOM_RIGHT.height
                )

                // draw sorting headers
                context.fillStyle = LFM_COLORS.LEADER_NAME
                context.font = fonts.SORT_HEADER
                context.textBaseline = "middle"
                context.textAlign = "left"
                sortHeaders.forEach(
                    ({ type, boundingBox, displayText }, index) => {
                        context.translate(
                            boundingBox.x +
                                SPRITE_MAP.CONTENT_LEFT.width +
                                LFM_AREA_PADDING.left -
                                1,
                            boundingBox.y +
                                LFM_PANEL_TOP_BORDER_HEIGHT +
                                LFM_AREA_PADDING.top
                        )
                        const sourceBox =
                            sortBy.type === type
                                ? SPRITE_MAP.SORT_HEADER_HIGHLIGHTED
                                : SPRITE_MAP.SORT_HEADER
                        context.drawImage(
                            lfmSprite,
                            sourceBox.LEFT.x,
                            sourceBox.LEFT.y,
                            sourceBox.LEFT.width,
                            sourceBox.LEFT.height,
                            0,
                            0,
                            sourceBox.LEFT.width,
                            sourceBox.LEFT.height
                        )
                        context.drawImage(
                            lfmSprite,
                            sourceBox.CENTER.x,
                            sourceBox.CENTER.y,
                            sourceBox.CENTER.width,
                            sourceBox.CENTER.height,
                            sourceBox.LEFT.width,
                            0,
                            boundingBox.width,
                            sourceBox.CENTER.height
                        )
                        context.drawImage(
                            lfmSprite,
                            sourceBox.RIGHT.x,
                            sourceBox.RIGHT.y,
                            sourceBox.RIGHT.width,
                            sourceBox.RIGHT.height,
                            boundingBox.width -
                                (index === sortHeaders.length - 1 ? 0 : 2),
                            0,
                            sourceBox.RIGHT.width,
                            sourceBox.RIGHT.height
                        )
                        context.fillText(
                            displayText,
                            20,
                            sourceBox.CENTER.height / 2
                        )
                        if (sortBy.type === type) {
                            // draw a little triangle to indicate sorting
                            context.save()
                            context.shadowBlur = 2
                            context.shadowColor = "black"
                            context.shadowOffsetX = 1
                            context.shadowOffsetY = 1
                            const triangleX = 10
                            if (sortBy.direction === "asc") {
                                const triangleY =
                                    sourceBox.CENTER.height / 2 - 3
                                context.beginPath()
                                context.moveTo(triangleX, triangleY + 5)
                                context.lineTo(triangleX + 5, triangleY + 5)
                                context.lineTo(triangleX + 2.5, triangleY)
                                context.fill()
                            } else {
                                const triangleY =
                                    sourceBox.CENTER.height / 2 - 2
                                context.beginPath()
                                context.moveTo(triangleX, triangleY)
                                context.lineTo(triangleX + 5, triangleY)
                                context.lineTo(triangleX + 2.5, triangleY + 5)
                                context.fill()
                            }
                            context.restore()
                        }
                        context.setTransform(1, 0, 0, 1, 0, 0)
                    }
                )
            }
        },
        [
            lfmSprite,
            context,
            minimumLfmCount,
            raidView,
            panelWidth,
            fonts,
            sortBy,
            sortHeaders,
        ]
    )

    return { renderLfmPanelToCanvas }
}

export default useRenderLfmPanel
