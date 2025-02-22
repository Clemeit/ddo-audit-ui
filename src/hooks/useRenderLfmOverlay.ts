import { useCallback, useMemo } from "react"
import { useLfmContext } from "../contexts/LfmContext.tsx"
import { FlatActivityEvent, Lfm, LfmActivityType } from "../models/Lfm.ts"
import {
    FONTS,
    MAXIMUM_ACTIVITY_EVENTS,
    OVERLAY_ACTIVITY_LEFT_PADDING,
    OVERLAY_CHARACTER_HEIGHT,
    OVERLAY_CHARACTER_HEIGHT_WITH_GUILD_NAME,
    OVERLAY_CHARACTER_WIDTH,
    OVERLAY_COLORS,
    OVERLAY_FONTS,
    OVERLAY_QUEST_INFO_LEFT_GAP,
    OVERLAY_QUEST_INFO_SPACING,
    OVERLAY_SIDE_BAR_WIDTH,
    OVERLAY_WIDTH,
} from "../constants/lfmPanel.ts"
import {
    getLfmActivityEventsFlatMap,
    mapClassToIconBoundingBox,
} from "../utils/lfmUtils.ts"
import { CLASS_LIST_LOWER } from "../constants/game.ts"
import {
    convertMillisecondsToPrettyString,
    wrapText,
} from "../utils/stringUtils.ts"
import useTextRenderer from "./useTextRenderer.ts"
import { BoundingBox } from "../models/Geometry.ts"
import { CHARACTER_IDS } from "../constants/characterIds.ts"
import { SPRITE_MAP } from "../constants/spriteMap.ts"
import { mapRaceAndGenderToRaceIconBoundingBox } from "../utils/socialUtils.ts"

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
        showBoundingBoxes,
        showLfmActivity,
        showCharacterGuildNames,
        // fontSize,
        // showRaidTimerIndicator,
        // showMemberCount,
        isMultiColumn,
    } = useLfmContext()
    const fonts = useMemo(() => FONTS(14), [])
    const { confineTextToBoundingBox } = useTextRenderer(context)

    const renderLfmOverlay = useCallback<
        (lfm: Lfm, renderType: RenderType) => { width: number; height: number }
    >(
        (
            lfm: Lfm,
            renderType: RenderType
        ): { width: number; height: number } => {
            if (!context || !lfmSprite) return { width: 0, height: 0 }
            if (renderType === RenderType.QUEST && lfm.quest == null)
                return { width: 0, height: 0 }
            context.imageSmoothingEnabled = false
            const willWrap =
                renderType === RenderType.LFM &&
                isMultiColumn &&
                lfm.members.length > 5
            const maxColumnCount = Math.ceil((lfm.members.length + 1) / 2)
            context.clearRect(0, 0, panelWidth, panelHeight)
            const characterHeight = showCharacterGuildNames
                ? OVERLAY_CHARACTER_HEIGHT_WITH_GUILD_NAME
                : OVERLAY_CHARACTER_HEIGHT
            let totalOverlayHeight = 100
            let totalOverlayWidth = OVERLAY_WIDTH

            if (willWrap)
                totalOverlayWidth = OVERLAY_WIDTH + OVERLAY_CHARACTER_WIDTH + 3

            const {
                textLines: commentTextLines,
                boundingBox: commentBoundingBox,
                lineHeight: commentLineHeight,
            } = confineTextToBoundingBox({
                text: lfm.comment,
                boundingBox: new BoundingBox(
                    4,
                    4,
                    totalOverlayWidth - OVERLAY_SIDE_BAR_WIDTH - 8,
                    400
                ),
                font: OVERLAY_FONTS.COMMENT,
                maxLines: 4,
            })

            // figure out the quest activity history
            const rawActivityEvents = getLfmActivityEventsFlatMap(lfm)
            // we always want the first event.
            // Then we want the last 7 events, or all of them if there are less than 7.
            const truncatedActivityEvents: FlatActivityEvent[] = []
            if (rawActivityEvents.length > MAXIMUM_ACTIVITY_EVENTS) {
                truncatedActivityEvents.push(rawActivityEvents[0])
                truncatedActivityEvents.push({
                    tag: LfmActivityType.SPACER,
                    data: "",
                    timestamp: "",
                })
                truncatedActivityEvents.push(
                    ...rawActivityEvents.slice(-(MAXIMUM_ACTIVITY_EVENTS - 1))
                )
            } else {
                truncatedActivityEvents.push(...rawActivityEvents)
            }
            const activityEvents = truncatedActivityEvents
                .filter((event) => event.tag !== LfmActivityType.COMMENT)
                .reduce((acc, event) => {
                    if (
                        acc.length > 0 &&
                        acc[acc.length - 1].tag === LfmActivityType.QUEST &&
                        acc[acc.length - 1].data === "" &&
                        event.tag === LfmActivityType.QUEST &&
                        event.data !== null
                    ) {
                        acc.pop()
                    }
                    acc.push(event)
                    return acc
                }, [] as FlatActivityEvent[])
                .reduce((acc, event) => {
                    if (
                        acc.length > 0 &&
                        acc[acc.length - 1].tag === event.tag &&
                        acc[acc.length - 1].data === event.data
                    ) {
                        return acc
                    }
                    acc.push(event)
                    return acc
                }, [] as FlatActivityEvent[])

            // get the total height of the overlay
            if (renderType === RenderType.LFM) {
                // party members
                if (willWrap) {
                    totalOverlayHeight =
                        maxColumnCount * (characterHeight + 2) + 10
                } else {
                    totalOverlayHeight =
                        (lfm.members.length + 1) * (characterHeight + 2) + 10
                }
                if (lfm.comment)
                    totalOverlayHeight +=
                        commentBoundingBox.y + commentBoundingBox.height
                if (showLfmActivity)
                    totalOverlayHeight += activityEvents.length * 20 + 5
            } else {
                // quest
                totalOverlayHeight = OVERLAY_QUEST_INFO_SPACING
                const quest = lfm.quest
                if (quest) {
                    const infoFields = [
                        quest.name,
                        quest.adventure_area,
                        quest.quest_journal_group,
                        quest.required_adventure_pack,
                        quest.patron,
                        quest.average_time,
                        quest.group_size,
                        quest.level.heroic_normal,
                        quest.level.epic_normal,
                        lfm.difficulty,
                    ]
                    context.font = OVERLAY_FONTS.QUEST_INFO
                    infoFields.forEach((field) => {
                        if (field) {
                            totalOverlayHeight += OVERLAY_QUEST_INFO_SPACING
                            const fieldWidth = context.measureText(
                                field.toString()
                            ).width
                            totalOverlayWidth = Math.max(
                                totalOverlayWidth,
                                OVERLAY_QUEST_INFO_LEFT_GAP + fieldWidth + 25
                            )
                        }
                    })
                }
            }

            // draw base
            context.lineWidth = 1
            context.fillStyle = OVERLAY_COLORS.BLACK_BACKGROUND
            context.globalAlpha = 0.8
            context.fillRect(0, 0, totalOverlayWidth, totalOverlayHeight)
            context.globalAlpha = 1
            context.fillStyle = OVERLAY_COLORS.SIDE_BAR
            context.fillRect(
                totalOverlayWidth - OVERLAY_SIDE_BAR_WIDTH - 2,
                0,
                OVERLAY_SIDE_BAR_WIDTH + 2,
                totalOverlayHeight
            )
            context.strokeStyle = OVERLAY_COLORS.OUTER_BORDER
            context.strokeRect(0, 0, totalOverlayWidth, totalOverlayHeight)
            context.strokeStyle = OVERLAY_COLORS.INNER_BORDER
            context.strokeRect(
                1,
                1,
                totalOverlayWidth - OVERLAY_SIDE_BAR_WIDTH - 2,
                totalOverlayHeight - 2
            )

            if (renderType === RenderType.LFM) {
                // Render LFM
                context.translate(4, 3)

                const gradient = context.createLinearGradient(
                    0,
                    0,
                    0,
                    characterHeight
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

                let hasWrapped = false
                const characters = [lfm.leader, ...lfm.members]
                characters.forEach((member, index) => {
                    context.fillStyle = gradient
                    context.fillRect(
                        0,
                        0,
                        OVERLAY_CHARACTER_WIDTH,
                        characterHeight
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
                    if (CHARACTER_IDS.includes(member.id)) {
                        const nameWidth = context.measureText(
                            member.name || ""
                        ).width
                        context.drawImage(
                            lfmSprite,
                            SPRITE_MAP.CROWN.x,
                            SPRITE_MAP.CROWN.y,
                            SPRITE_MAP.CROWN.width,
                            SPRITE_MAP.CROWN.height,
                            nameWidth + 26,
                            0,
                            SPRITE_MAP.CROWN.width,
                            SPRITE_MAP.CROWN.height
                        )
                    }

                    // draw guild name
                    if (showCharacterGuildNames) {
                        context.font = OVERLAY_FONTS.MEMBER_GUILD_NAME
                        context.fillStyle = OVERLAY_COLORS.MEMBER_NAME
                        context.fillText(
                            member.guild_name || "No Guild",
                            22,
                            30
                        )

                        // draw line
                        // const lineStart = OVERLAY_WIDTH / 2 - 80
                        // const lineEnd = OVERLAY_WIDTH / 2 + 80
                        // const gradient = context.createLinearGradient(
                        //     lineStart,
                        //     0,
                        //     lineEnd,
                        //     0
                        // )
                        // gradient.addColorStop(0, "rgb(255, 255, 255, 0)")
                        // gradient.addColorStop(0.25, "rgb(255, 255, 255, 0.8)")
                        // gradient.addColorStop(0.75, "rgb(255, 255, 255, 0.8)")
                        // gradient.addColorStop(1, "rgb(255, 255, 255, 0)")
                        // context.strokeStyle = gradient
                        // context.lineWidth = 1
                        // context.beginPath()
                        // context.moveTo(lineStart, 45)
                        // context.lineTo(lineEnd, 45)
                        // context.stroke()
                    }

                    // draw location
                    context.font = OVERLAY_FONTS.MEMBER_LOCATION
                    context.fillStyle = OVERLAY_COLORS.MEMBER_LOCATION
                    const locationTextLines = wrapText(
                        member.location?.name || "Somewhere in the aether",
                        OVERLAY_CHARACTER_WIDTH - 45,
                        context.font,
                        context,
                        1
                    )
                    const isPlayerInQuest =
                        member.location?.name === lfm.quest?.adventure_area
                    context.fillText(
                        (isPlayerInQuest ? "✓ " : "") +
                            locationTextLines[0] +
                            (locationTextLines[0] !== member.location?.name
                                ? "..."
                                : ""),
                        22,
                        characterHeight - 10
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

                    if (willWrap && index === maxColumnCount - 1) {
                        context.setTransform(1, 0, 0, 1, 0, 0)
                        context.translate(OVERLAY_CHARACTER_WIDTH + 3, 0)
                        context.translate(4, 3)
                    } else {
                        context.translate(0, characterHeight + 2)
                    }
                })

                if (willWrap) {
                    context.setTransform(1, 0, 0, 1, 0, 0)
                    context.translate(4, 3)
                    context.translate(
                        0,
                        (characterHeight + 2) *
                            Math.floor(lfm.members.length / 2 + 1)
                    )
                }

                // draw comment
                context.textAlign = "left"
                context.textBaseline = "top"
                context.font = OVERLAY_FONTS.COMMENT
                context.fillStyle = OVERLAY_COLORS.COMMENT
                commentTextLines.forEach((line, index) => {
                    context.fillText(
                        line,
                        commentBoundingBox.x,
                        commentBoundingBox.y + index * commentLineHeight
                    )
                })

                // draw activity history
                context.translate(
                    4 + OVERLAY_ACTIVITY_LEFT_PADDING,
                    commentBoundingBox.y +
                        commentTextLines.length * commentLineHeight +
                        15
                )

                let lastElapsedMinutes = 0
                let hasRenderedAtLeastOne = false
                if (showLfmActivity) {
                    activityEvents.forEach((event) => {
                        switch (event.tag) {
                            case LfmActivityType.POSTED:
                                context.fillStyle =
                                    OVERLAY_COLORS.ACTIVITY_POSTED
                                break
                            case LfmActivityType.QUEST:
                                context.fillStyle =
                                    OVERLAY_COLORS.ACTIVITY_QUEST
                                break
                            case LfmActivityType.MEMBER_JOINED:
                                context.fillStyle =
                                    OVERLAY_COLORS.ACTIVITY_MEMBER_JOINED
                                break
                            case LfmActivityType.MEMBER_LEFT:
                                context.fillStyle =
                                    OVERLAY_COLORS.ACTIVITY_MEMBER_LEFT
                                break
                            default:
                                context.fillStyle =
                                    OVERLAY_COLORS.ACTIVITY_COMMENT
                                break
                        }

                        context.font = OVERLAY_FONTS.ACTIVITY
                        context.textAlign = "left"
                        context.textBaseline = "middle"
                        let activityDataText = ""
                        switch (event.tag) {
                            case LfmActivityType.POSTED:
                                activityDataText = "Posted"
                                break
                            case LfmActivityType.MEMBER_JOINED:
                                activityDataText = `${event.data} joined`
                                break
                            case LfmActivityType.MEMBER_LEFT:
                                activityDataText = `${event.data} left`
                                break
                            case LfmActivityType.QUEST:
                                activityDataText = event.data || "No quest"
                                break
                            case LfmActivityType.COMMENT:
                                activityDataText = event.data || "No comment"
                                break
                        }
                        const activityDataLines = wrapText(
                            activityDataText,
                            totalOverlayWidth - OVERLAY_SIDE_BAR_WIDTH - 8,
                            context.font,
                            context,
                            1
                        )
                        const textToRender =
                            activityDataLines[0] +
                                (activityDataLines[0] !== activityDataText
                                    ? "..."
                                    : "") || ""
                        context.fillText(textToRender, 0, 0)

                        // draw the timeline
                        context.strokeStyle = "white"
                        context.lineWidth = 1
                        if (event.tag === LfmActivityType.SPACER) {
                            // dashed line:
                            context.setLineDash([2, 2])
                        } else {
                            context.setLineDash([])
                        }
                        context.beginPath()
                        context.moveTo(-10, -10)
                        context.lineTo(-10, 10)
                        context.stroke()

                        // draw the elapsed time since the last event and the little dot
                        if (event.tag !== LfmActivityType.SPACER) {
                            const currentDate = new Date()
                            const currentActivityDate = new Date(
                                event.timestamp + "Z"
                            )
                            const elapsedMinutes = Math.floor(
                                (currentDate.getTime() -
                                    currentActivityDate.getTime()) /
                                    60000
                            )
                            if (
                                !hasRenderedAtLeastOne ||
                                Math.abs(elapsedMinutes - lastElapsedMinutes) >
                                    1
                            ) {
                                context.font = OVERLAY_FONTS.ACTIVITY
                                context.textAlign = "right"
                                context.textBaseline = "middle"
                                context.fillStyle =
                                    OVERLAY_COLORS.ACTIVITY_COMMENT
                                context.fillText(
                                    elapsedMinutes === 0
                                        ? "Now"
                                        : `${elapsedMinutes}m`,
                                    -20,
                                    0
                                )
                                lastElapsedMinutes = elapsedMinutes

                                // render the little dot
                                context.beginPath()
                                context.arc(-10, -1, 5, 0, 2 * Math.PI)
                                context.strokeStyle = context.fillStyle
                                context.fill()

                                hasRenderedAtLeastOne = true
                            }
                        }

                        context.translate(0, 20)
                    })
                }
            } else {
                // Render Quest
                let maxWidth = 0

                const renderQuestInfo = (title: string, text: string) => {
                    context.font = OVERLAY_FONTS.QUEST_INFO_HEADER
                    context.textAlign = "right"
                    context.fillText(title, 0, 0)
                    context.font = OVERLAY_FONTS.QUEST_INFO
                    context.textAlign = "left"
                    context.fillText(text, 5, 0)
                    context.translate(0, OVERLAY_QUEST_INFO_SPACING)
                    maxWidth = Math.max(
                        maxWidth,
                        context.measureText(title).width
                    )
                }

                const quest = lfm.quest
                if (quest) {
                    context.fillStyle = OVERLAY_COLORS.QUEST_INFO
                    context.textBaseline = "middle"
                    context.translate(
                        OVERLAY_QUEST_INFO_LEFT_GAP,
                        OVERLAY_QUEST_INFO_SPACING
                    )
                    if (quest.name) {
                        renderQuestInfo("Quest:", quest.name)
                    }

                    if (quest.adventure_area) {
                        renderQuestInfo("Area:", quest.adventure_area)
                    }

                    if (quest.quest_journal_group) {
                        renderQuestInfo(
                            "Nearest hub:",
                            quest.quest_journal_group
                        )
                    }

                    if (quest.required_adventure_pack) {
                        renderQuestInfo("Pack", quest.required_adventure_pack)
                    }

                    if (quest.patron) {
                        renderQuestInfo("Patron:", quest.patron)
                    }

                    if (quest.average_time) {
                        renderQuestInfo(
                            "Average time:",
                            convertMillisecondsToPrettyString(
                                quest.average_time * 1000,
                                true
                            )
                        )
                    }

                    if (quest.group_size) {
                        renderQuestInfo("Group size:", quest.group_size)
                    }

                    if (quest.level.heroic_normal) {
                        renderQuestInfo(
                            "Heroic level:",
                            quest.level?.heroic_normal.toString()
                        )
                    }

                    if (quest.level.epic_normal) {
                        renderQuestInfo(
                            "Epic level:",
                            quest.level?.epic_normal.toString()
                        )
                    }

                    if (lfm.difficulty) {
                        renderQuestInfo("Difficulty:", lfm.difficulty)
                    }
                }
            }

            context.setTransform(1, 0, 0, 1, 0, 0)

            if (showBoundingBoxes) {
                context.strokeStyle = "red"
                context.strokeRect(
                    commentBoundingBox.x,
                    commentBoundingBox.y,
                    commentBoundingBox.width,
                    commentBoundingBox.height
                )
            }

            return { width: totalOverlayWidth, height: totalOverlayHeight }
        },
        [
            context,
            lfmSprite,
            fonts,
            panelWidth,
            panelHeight,
            showLfmActivity,
            showCharacterGuildNames,
            confineTextToBoundingBox,
        ]
    )

    const clearOverlay = useCallback(() => {
        if (!context) return
        context.clearRect(0, 0, panelWidth, panelHeight)
    }, [context, panelWidth, panelHeight])

    return { renderLfmOverlay, clearOverlay }
}

export default useRenderLfmOverlay
