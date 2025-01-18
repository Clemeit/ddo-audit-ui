import { useCallback, useMemo } from "react"
import { useLfmContext } from "../contexts/LfmContext.tsx"
import { Lfm } from "../models/Lfm.ts"
import {
    FONTS,
    OVERLAY_CHARACTER_HEIGHT,
    OVERLAY_CHARACTER_WIDTH,
    OVERLAY_COLORS,
    OVERLAY_FONTS,
    OVERLAY_SIDE_BAR_WIDTH,
    OVERLAY_WIDTH,
} from "../constants/lfmPanel.ts"
import {
    mapClassToIconBoundingBox,
    mapRaceAndGenderToRaceIconBoundingBox,
} from "../utils/lfmUtils.ts"
import { CLASS_LIST_LOWER } from "../constants/game.ts"
import { wrapText } from "../utils/stringUtils.ts"

interface Props {
    lfmSprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
}

export enum RenderType {
    LFM,
    QUEST,
}

const useRenderLfmOverlay = ({ lfmSprite, context }: Props) => {
    const {
        panelWidth,
        panelHeight,
        // fontSize,
        // showRaidTimerIndicator,
        // showMemberCount,
    } = useLfmContext()
    const fonts = useMemo(() => FONTS(14), [])

    const renderLfmOverlay = useCallback(
        (lfm: Lfm, renderType: RenderType) => {
            if (!context || !lfmSprite) return
            context.imageSmoothingEnabled = false
            context.clearRect(0, 0, panelWidth, panelHeight)
            let totalOverlayHeight = 100 // calculate the height using all the crap we draw to it

            // get the total height of the overlay
            if (renderType === RenderType.LFM) {
                // party members
                totalOverlayHeight =
                    (lfm.members.length + 1) * (OVERLAY_CHARACTER_HEIGHT + 2) +
                    10
                // add height to account for the comment
            } else {
                // quest
            }

            // draw base
            context.lineWidth = 1
            context.fillStyle = OVERLAY_COLORS.BLACK_BACKGROUND
            context.globalAlpha = 0.8
            context.fillRect(0, 0, OVERLAY_WIDTH, totalOverlayHeight)
            context.globalAlpha = 1
            context.fillStyle = OVERLAY_COLORS.SIDE_BAR
            context.fillRect(
                OVERLAY_WIDTH - OVERLAY_SIDE_BAR_WIDTH - 2,
                0,
                OVERLAY_SIDE_BAR_WIDTH + 2,
                totalOverlayHeight
            )
            context.strokeStyle = OVERLAY_COLORS.OUTER_BORDER
            context.strokeRect(0, 0, OVERLAY_WIDTH, totalOverlayHeight)
            context.strokeStyle = OVERLAY_COLORS.INNER_BORDER
            context.strokeRect(
                1,
                1,
                OVERLAY_WIDTH - OVERLAY_SIDE_BAR_WIDTH - 2,
                totalOverlayHeight - 2
            )

            if (renderType === RenderType.LFM) {
                // Render LFM
                context.translate(4, 3)

                const gradient = context.createLinearGradient(
                    0,
                    0,
                    0,
                    OVERLAY_CHARACTER_HEIGHT
                )
                gradient.addColorStop(0, OVERLAY_COLORS.CHARACTER_GRADIENT_EDGE)
                gradient.addColorStop(
                    0.25,
                    OVERLAY_COLORS.CHARACTER_GRADIENT_CENTER
                )
                gradient.addColorStop(
                    0.75,
                    OVERLAY_COLORS.CHARACTER_GRADIENT_CENTER
                )
                gradient.addColorStop(1, OVERLAY_COLORS.CHARACTER_GRADIENT_EDGE)

                const characters = [lfm.leader, ...lfm.members]
                characters.forEach((member) => {
                    context.fillStyle = gradient
                    context.fillRect(
                        0,
                        0,
                        OVERLAY_CHARACTER_WIDTH,
                        OVERLAY_CHARACTER_HEIGHT
                    )

                    // draw class icon
                    const raceIconBoundingBox =
                        mapRaceAndGenderToRaceIconBoundingBox(
                            member.race,
                            member.gender
                        )
                    context.drawImage(
                        lfmSprite,
                        raceIconBoundingBox.x,
                        raceIconBoundingBox.y,
                        raceIconBoundingBox.width,
                        raceIconBoundingBox.height,
                        0,
                        -1,
                        raceIconBoundingBox.width,
                        raceIconBoundingBox.height
                    )

                    // draw name
                    context.font = OVERLAY_FONTS.MEMBER_NAME
                    context.fillStyle = OVERLAY_COLORS.MEMBER_NAME
                    context.textBaseline = "middle"
                    context.textAlign = "left"
                    context.fillText(member.name || "Anonymous", 22, 10)

                    // draw location
                    context.font = OVERLAY_FONTS.MEMBER_LOCATION
                    context.fillStyle = OVERLAY_COLORS.MEMBER_LOCATION
                    const locationTextLines = wrapText(
                        member.location?.name || "Somewhere in the aether",
                        OVERLAY_CHARACTER_WIDTH - 30,
                        context.font,
                        context,
                        1
                    )
                    context.fillText(
                        locationTextLines[0] +
                            (locationTextLines[0] !== member.location?.name
                                ? "..."
                                : ""),
                        22,
                        30
                    )

                    // draw classes
                    member.classes
                        ?.filter((classData) =>
                            CLASS_LIST_LOWER.includes(
                                classData.name.toLowerCase()
                            )
                        )
                        .sort((a, b) => b.level - a.level)
                        .forEach((classData, index) => {
                            const classIconBoundingBox =
                                mapClassToIconBoundingBox(classData.name)
                            context.drawImage(
                                lfmSprite,
                                classIconBoundingBox.x,
                                classIconBoundingBox.y,
                                classIconBoundingBox.width,
                                classIconBoundingBox.height,
                                165 + index * (classIconBoundingBox.width + 1),
                                1,
                                classIconBoundingBox.width,
                                classIconBoundingBox.height
                            )

                            // shadow under text
                            context.save()
                            context.shadowColor = "black"
                            context.shadowBlur = 1
                            context.shadowOffsetX = 0
                            context.shadowOffsetY = 0
                            context.textAlign = "right"
                            context.textBaseline = "bottom"
                            context.fillStyle =
                                OVERLAY_COLORS.MEMBER_CLASS_LEVEL
                            context.font = OVERLAY_FONTS.MEMBER_CLASS_LEVEL
                            context.fillText(
                                classData.level.toString(),
                                166 +
                                    classIconBoundingBox.width +
                                    index * (classIconBoundingBox.width + 1),
                                classIconBoundingBox.height
                            )

                            context.restore()
                        })

                    // draw total level
                    context.font = OVERLAY_FONTS.MEMBER_TOTAL_LEVEL
                    context.fillStyle = OVERLAY_COLORS.MEMBER_TOTAL_LEVEL
                    context.textAlign = "right"
                    context.textBaseline = "middle"
                    context.fillText(
                        member.total_level?.toString() || "???",
                        OVERLAY_CHARACTER_WIDTH - 10,
                        10
                    )

                    context.translate(0, OVERLAY_CHARACTER_HEIGHT + 2)
                })
            } else {
                // Render Quest
            }
        },
        [context, lfmSprite, fonts]
    )

    const clearOverlay = useCallback(() => {
        if (!context) return
        context.clearRect(0, 0, panelWidth, panelHeight)
    }, [context, panelWidth, panelHeight])

    return { renderLfmOverlay, clearOverlay }
}

export default useRenderLfmOverlay
