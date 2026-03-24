import { useCallback, useMemo } from "react"
import { SPRITE_MAP } from "../constants/spriteMap.ts"
import { useWhoContext } from "../contexts/WhoContext.tsx"
import {
    FONTS,
    WHO_COLORS,
    SORT_HEADER_AREA_HEIGHT,
} from "../constants/whoPanel.ts"
import useRenderBox from "../utils/renderUtils.ts"
import { BoundingBox } from "../models/Geometry.ts"
import { CharacterSortType } from "../models/Character.ts"
import { calculateCommonFilterBoundingBoxes } from "../utils/whoUtils.ts"

interface Props {
    sprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
}

interface RenderWhoPanelProps {
    viewportHeight: number
    isLoading: boolean
}

const useRenderWhoPanel = ({ sprite, context }: Props) => {
    const { panelWidth, sortBy } = useWhoContext()
    const fonts = useMemo(() => FONTS(0), [])
    const { renderBox, renderSortHeader } = useRenderBox({
        sprite,
        context,
    })
    const {
        lfmHeaderBoundingBox,
        nameHeaderBoundingBox,
        classHeaderBoundingBox,
        levelHeaderBoundingBox,
        guildHeaderBoundingBox,
    } = useMemo(
        () => calculateCommonFilterBoundingBoxes(panelWidth),
        [panelWidth]
    )

    /** Draw background fill only. Call before rendering characters. */
    const renderBackground = useCallback(
        (viewportHeight: number) => {
            if (!context || !sprite) return
            if (viewportHeight === 0) return
            context.imageSmoothingEnabled = false

            context.fillStyle = WHO_COLORS.BLACK_BACKGROUND
            context.fillRect(0, 0, panelWidth, viewportHeight)
        },
        [sprite, context, panelWidth]
    )

    /** Draw sort headers and loading message. Call after characters. */
    const renderOverlay = useCallback(
        ({ viewportHeight = 0, isLoading = false }: RenderWhoPanelProps) => {
            if (!context || !sprite) return
            if (viewportHeight === 0) return
            context.imageSmoothingEnabled = false

            // fill sort header background so characters don't show through
            context.fillStyle = WHO_COLORS.BLACK_BACKGROUND
            context.fillRect(
                SPRITE_MAP.CONTENT_LEFT.width,
                SPRITE_MAP.CONTENT_TOP.height,
                panelWidth -
                    SPRITE_MAP.CONTENT_LEFT.width -
                    SPRITE_MAP.CONTENT_RIGHT.width,
                SORT_HEADER_AREA_HEIGHT - SPRITE_MAP.CONTENT_TOP.height
            )

            // render sort headers
            const sortHeaderY = SPRITE_MAP.CONTENT_TOP.height
            const sortHeaders = [
                {
                    boundingBox: new BoundingBox(
                        lfmHeaderBoundingBox.x,
                        sortHeaderY,
                        lfmHeaderBoundingBox.width,
                        lfmHeaderBoundingBox.height
                    ),
                    type: CharacterSortType.Lfm,
                    text: "",
                },
                {
                    boundingBox: new BoundingBox(
                        nameHeaderBoundingBox.x,
                        sortHeaderY,
                        nameHeaderBoundingBox.width,
                        nameHeaderBoundingBox.height
                    ),
                    type: CharacterSortType.Name,
                    text: "Name",
                },
                {
                    boundingBox: new BoundingBox(
                        classHeaderBoundingBox.x,
                        sortHeaderY,
                        classHeaderBoundingBox.width,
                        classHeaderBoundingBox.height
                    ),
                    type: CharacterSortType.Class,
                    text: "Class",
                },
                {
                    boundingBox: new BoundingBox(
                        levelHeaderBoundingBox.x,
                        sortHeaderY,
                        levelHeaderBoundingBox.width,
                        levelHeaderBoundingBox.height
                    ),
                    type: CharacterSortType.Level,
                    text: "Level",
                },
                {
                    boundingBox: new BoundingBox(
                        guildHeaderBoundingBox.x,
                        sortHeaderY,
                        guildHeaderBoundingBox.width,
                        guildHeaderBoundingBox.height
                    ),
                    type: CharacterSortType.Guild,
                    text: "Guild",
                },
            ]
            sortHeaders.forEach(({ boundingBox, type, text }) => {
                const sortHeaderType =
                    sortBy.type === type
                        ? "SORT_HEADER_HIGHLIGHTED"
                        : "SORT_HEADER"
                renderSortHeader({
                    boundingBox: boundingBox,
                    text: text,
                    font: fonts.SORT_HEADER,
                    left: SPRITE_MAP[sortHeaderType].LEFT,
                    center: SPRITE_MAP[sortHeaderType].CENTER,
                    right: SPRITE_MAP[sortHeaderType].RIGHT,
                    textOffsetX: sortBy.type === type ? 20 : 10,
                })
                if (sortBy.type === type) {
                    context.save()
                    context.shadowBlur = 2
                    context.shadowColor = "black"
                    context.shadowOffsetX = 1
                    context.shadowOffsetY = 1
                    const triangleX = boundingBox.x + 10
                    if (sortBy.ascending) {
                        const triangleY = boundingBox.centerY() - 3
                        context.beginPath()
                        context.moveTo(triangleX, triangleY + 5)
                        context.lineTo(triangleX + 5, triangleY + 5)
                        context.lineTo(triangleX + 2.5, triangleY)
                        context.fill()
                    } else {
                        const triangleY = boundingBox.centerY() - 2
                        context.beginPath()
                        context.moveTo(triangleX, triangleY)
                        context.lineTo(triangleX + 5, triangleY)
                        context.lineTo(triangleX + 2.5, triangleY + 5)
                        context.fill()
                    }
                    context.restore()
                }
            })
            context.drawImage(
                sprite,
                SPRITE_MAP.LFM_SORT_ICON.x,
                SPRITE_MAP.LFM_SORT_ICON.y,
                SPRITE_MAP.LFM_SORT_ICON.width,
                SPRITE_MAP.LFM_SORT_ICON.height,
                lfmHeaderBoundingBox.x + 3,
                sortHeaderY + 2,
                SPRITE_MAP.LFM_SORT_ICON.width,
                SPRITE_MAP.LFM_SORT_ICON.height
            )

            if (isLoading) {
                context.fillStyle = WHO_COLORS.BLACK_BACKGROUND
                context.fillRect(50, 100, panelWidth - 100, 40)
                context.fillStyle = WHO_COLORS.SECONDARY_TEXT
                context.font = fonts.MISC_INFO_MESSAGE
                context.textAlign = "center"
                context.fillText(`Content loading...`, panelWidth / 2, 120)
            }
        },
        [sprite, context, panelWidth, sortBy]
    )

    return { renderBackground, renderOverlay }
}

export default useRenderWhoPanel
