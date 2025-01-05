import { useCallback } from "react"
import { Lfm } from "../models/Lfm"
import {
    LFM_HEIGHT,
    LFM_PADDING,
    GROUPING_SPRITE_MAP,
    GROUPING_COLORS,
    FONTS,
} from "../constants/grouping.ts"
import { getTextSize, wrapText } from "../utils/stringUtils.ts"
import { useGroupingContext } from "../components/grouping/GroupingContext.tsx"

interface UseRenderLfmsProps {
    lfmSprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
}

const useRenderLfms = ({ lfmSprite, context }: UseRenderLfmsProps) => {
    const { panelWidth, showBoundingBoxes } = useGroupingContext()

    const renderLfmToCanvas = useCallback(
        (lfm: Lfm, tempFontSize: number) => {
            if (!context || !lfmSprite) return
            const fonts = FONTS(tempFontSize)

            // set up this lfm's bounds
            const lfmBoundingBox = {
                x: LFM_PADDING.left + GROUPING_SPRITE_MAP.CONTENT_LEFT.width,
                y: LFM_PADDING.top,
                width:
                    panelWidth -
                    LFM_PADDING.right -
                    LFM_PADDING.left -
                    GROUPING_SPRITE_MAP.CONTENT_LEFT.width -
                    GROUPING_SPRITE_MAP.CONTENT_RIGHT.width,
                height: LFM_HEIGHT - LFM_PADDING.top - LFM_PADDING.bottom,
            }
            const mainPanelBoundingBox = {
                x: lfmBoundingBox.x,
                y: lfmBoundingBox.y,
                width: lfmBoundingBox.width * 0.4,
                height: lfmBoundingBox.height,
            }
            const questPanelBoundingBox = {
                x: mainPanelBoundingBox.x + mainPanelBoundingBox.width,
                y: lfmBoundingBox.y,
                width: lfmBoundingBox.width * 0.25,
                height: lfmBoundingBox.height,
            }
            const classPanelBoundingBox = {
                x: questPanelBoundingBox.x + questPanelBoundingBox.width,
                y: lfmBoundingBox.y,
                width: lfmBoundingBox.width * 0.2,
                height: lfmBoundingBox.height,
            }
            const levelPanelBoundingBox = {
                x: classPanelBoundingBox.x + classPanelBoundingBox.width,
                y: lfmBoundingBox.y,
                width: lfmBoundingBox.width * 0.15,
                height: lfmBoundingBox.height,
            }
            const leaderClassIconBoundingBox = {
                x: mainPanelBoundingBox.x + 4,
                y: mainPanelBoundingBox.y + 4,
                width: 18,
                height: 18,
            }
            const leaderNameMetrics = getTextSize(
                lfm.leader.name || "Anonymous",
                fonts.LEADER_NAME,
                context
            )
            const leaderNameBoundingBox = {
                x:
                    leaderClassIconBoundingBox.x +
                    leaderClassIconBoundingBox.width +
                    6,
                y:
                    leaderClassIconBoundingBox.y +
                    leaderClassIconBoundingBox.height / 2 -
                    leaderNameMetrics.height / 2,
                width: leaderNameMetrics.width,
                height: leaderNameMetrics.height,
            }
            const memberCount = lfm.members.length + 1
            const memberCountText = ({ abbreviated = false }) =>
                `(${memberCount}${abbreviated ? "" : " members"})`
            const memberCountTextMetrics = getTextSize(
                memberCountText({ abbreviated: false }),
                fonts.MEMBER_COUNT,
                context
            )
            const memberCountBoundingBox = {
                x: leaderNameBoundingBox.x + leaderNameBoundingBox.width + 6,
                y:
                    leaderNameBoundingBox.y +
                    leaderNameBoundingBox.height / 2 -
                    memberCountTextMetrics.height / 2,
                width: Math.min(
                    memberCountTextMetrics.width,
                    mainPanelBoundingBox.width +
                        9 -
                        (leaderNameBoundingBox.x + leaderNameBoundingBox.width)
                ),
                height: memberCountTextMetrics.height,
            }
            const commentLineHeight =
                getTextSize("Mj", fonts.COMMENT, context).height * 1.33
            const commentBoundingBox = {
                x: mainPanelBoundingBox.x + 4,
                y:
                    leaderClassIconBoundingBox.y +
                    leaderClassIconBoundingBox.height +
                    4,
                width: mainPanelBoundingBox.width - 8,
                height:
                    mainPanelBoundingBox.height -
                    leaderClassIconBoundingBox.height -
                    12 -
                    (Math.round(lfm.adventure_active_time / 60) > 0
                        ? commentLineHeight
                        : 0),
            }
            const questNameLines = wrapText(
                lfm.quest?.name || "",
                questPanelBoundingBox.width - 8,
                2,
                fonts.QUEST_NAME,
                context
            )
            const questNameMetrics = getTextSize(
                questNameLines.join(""),
                fonts.QUEST_NAME,
                context
            )
            const questNameWidth = Math.min(
                questNameMetrics.width,
                questPanelBoundingBox.width - 8
            )
            const questNameLineHeight =
                getTextSize("Mj", fonts.QUEST_NAME, context).height * 1.33
            const difficultyMetrics = getTextSize(
                lfm.difficulty || "",
                fonts.COMMENT,
                context
            )
            const difficultyWidth = Math.min(
                difficultyMetrics.width,
                questPanelBoundingBox.width - 8
            )
            const difficultyLineHeight =
                getTextSize("Mj", fonts.COMMENT, context).height * 1.33
            const questNameBoundingBox = {
                x:
                    questPanelBoundingBox.x +
                    questPanelBoundingBox.width / 2 -
                    questNameWidth / 2,
                y:
                    questPanelBoundingBox.y +
                    questPanelBoundingBox.height / 2 -
                    (questNameLineHeight * questNameLines.length) / 2 -
                    difficultyLineHeight / 2,
                width: questNameWidth,
                height: questNameLineHeight * questNameLines.length,
            }
            const difficultyBoundingBox = {
                x:
                    questPanelBoundingBox.x +
                    questPanelBoundingBox.width / 2 -
                    difficultyWidth / 2,
                y: questNameBoundingBox.y + questNameBoundingBox.height,
                width: difficultyWidth,
                height: difficultyLineHeight,
            }

            // background and edges
            // context.clearRect(0, 0, panelWidth, LFM_HEIGHT)
            context.fillStyle = GROUPING_COLORS.BLACK_BACKGROUND
            context.fillRect(0, 0, panelWidth, LFM_HEIGHT)

            // gradient fill
            if (lfm.is_eligible) {
                const gradient = context.createLinearGradient(
                    0,
                    0,
                    0,
                    lfmBoundingBox.height
                )
                gradient.addColorStop(0, GROUPING_COLORS.ELIGIBLE_GRADIENT_EDGE)
                gradient.addColorStop(
                    0.25,
                    GROUPING_COLORS.ELIGIBLE_GRADIENT_CENTER
                )
                gradient.addColorStop(
                    0.75,
                    GROUPING_COLORS.ELIGIBLE_GRADIENT_CENTER
                )
                gradient.addColorStop(1, GROUPING_COLORS.ELIGIBLE_GRADIENT_EDGE)
                context.fillStyle = gradient
                context.fillRect(
                    lfmBoundingBox.x,
                    lfmBoundingBox.y,
                    lfmBoundingBox.width,
                    lfmBoundingBox.height
                )
            }

            // dividers
            context.strokeStyle = GROUPING_COLORS.LFM_BORDER
            context.lineWidth = 1
            context.strokeRect(
                mainPanelBoundingBox.x,
                mainPanelBoundingBox.y,
                mainPanelBoundingBox.width,
                mainPanelBoundingBox.height
            )
            context.strokeRect(
                questPanelBoundingBox.x,
                questPanelBoundingBox.y,
                questPanelBoundingBox.width,
                questPanelBoundingBox.height
            )
            context.strokeRect(
                classPanelBoundingBox.x,
                classPanelBoundingBox.y,
                classPanelBoundingBox.width,
                classPanelBoundingBox.height
            )
            context.strokeRect(
                levelPanelBoundingBox.x,
                levelPanelBoundingBox.y,
                levelPanelBoundingBox.width,
                levelPanelBoundingBox.height
            )

            // ===== MAIN PANEL =====
            // leader class icon
            // leader name
            context.fillStyle = GROUPING_COLORS.LEADER_NAME
            context.font = fonts.LEADER_NAME
            context.textBaseline = "middle"
            context.textAlign = "left"
            context.fillText(
                lfm.leader?.name || "Anonymous",
                leaderNameBoundingBox.x,
                leaderNameBoundingBox.y + leaderNameBoundingBox.height / 2
            )
            // member count
            if (memberCount > 1) {
                const shouldAbbreviate =
                    getTextSize(
                        memberCountText({ abbreviated: false }),
                        fonts.MEMBER_COUNT,
                        context
                    ).width > memberCountBoundingBox.width
                context.fillStyle = GROUPING_COLORS.SECONDARY_TEXT
                context.font = fonts.MEMBER_COUNT
                context.fillText(
                    memberCountText({ abbreviated: shouldAbbreviate }),
                    leaderNameBoundingBox.x + leaderNameBoundingBox.width + 6,
                    leaderNameBoundingBox.y + leaderNameBoundingBox.height / 2
                )
            }
            // comment
            context.fillStyle = GROUPING_COLORS.STANDARD_TEXT
            context.font = fonts.COMMENT
            context.textBaseline = "top"
            context.textAlign = "left"
            const wrappedComment = wrapText(
                lfm.comment,
                commentBoundingBox.width,
                Math.floor(commentBoundingBox.height / commentLineHeight),
                fonts.COMMENT,
                context
            )
            wrappedComment.forEach((line, index) => {
                context.fillText(
                    line,
                    commentBoundingBox.x,
                    commentBoundingBox.y + index * commentLineHeight
                )
            })
            // adventure active time
            if (Math.round(lfm.adventure_active_time / 60) > 0) {
                context.fillStyle = GROUPING_COLORS.ADVENTURE_ACTIVE
                context.font = fonts.COMMENT
                context.textBaseline = "top"
                context.textAlign = "center"
                const minutes = Math.round(lfm.adventure_active_time / 60)
                const text = ({ abbreviated = false }) =>
                    `${abbreviated ? "" : "Adventure "}Active: ${minutes} minute${
                        minutes === 1 ? "" : "s"
                    }`
                const textBounds = getTextSize(
                    text({ abbreviated: false }),
                    fonts.COMMENT,
                    context
                )
                const shouldAbbreviate =
                    textBounds.width > commentBoundingBox.width
                context.fillText(
                    text({
                        abbreviated: shouldAbbreviate,
                    }),
                    commentBoundingBox.x + commentBoundingBox.width / 2,
                    commentBoundingBox.y + commentBoundingBox.height + 4
                )
            }

            // ===== QUEST PANEL =====
            if (lfm.quest) {
                // quest name
                context.fillStyle = GROUPING_COLORS.STANDARD_TEXT
                context.font = fonts.QUEST_NAME
                context.textBaseline = "top"
                context.textAlign = "center"
                questNameLines.forEach((line, index) => {
                    context.fillText(
                        line,
                        questNameBoundingBox.x + questNameBoundingBox.width / 2,
                        questNameBoundingBox.y + index * questNameLineHeight
                    )
                })
                // quest difficulty
                context.fillStyle = GROUPING_COLORS.SECONDARY_TEXT
                context.font = fonts.COMMENT
                context.textBaseline = "top"
                context.textAlign = "center"
                context.fillText(
                    lfm.difficulty || "",
                    difficultyBoundingBox.x + difficultyBoundingBox.width / 2,
                    difficultyBoundingBox.y
                )
            }

            // left
            context.drawImage(
                lfmSprite,
                GROUPING_SPRITE_MAP.CONTENT_LEFT.x,
                GROUPING_SPRITE_MAP.CONTENT_LEFT.y,
                GROUPING_SPRITE_MAP.CONTENT_LEFT.width,
                GROUPING_SPRITE_MAP.CONTENT_LEFT.height,
                0,
                0,
                GROUPING_SPRITE_MAP.CONTENT_LEFT.width,
                LFM_HEIGHT
            )

            // right
            context.drawImage(
                lfmSprite,
                GROUPING_SPRITE_MAP.CONTENT_RIGHT.x,
                GROUPING_SPRITE_MAP.CONTENT_RIGHT.y,
                GROUPING_SPRITE_MAP.CONTENT_RIGHT.width,
                GROUPING_SPRITE_MAP.CONTENT_RIGHT.height,
                panelWidth - GROUPING_SPRITE_MAP.CONTENT_RIGHT.width,
                0,
                GROUPING_SPRITE_MAP.CONTENT_RIGHT.width,
                LFM_HEIGHT
            )

            if (showBoundingBoxes) {
                context.strokeStyle = "red"
                context.lineWidth = 1
                context.strokeRect(
                    lfmBoundingBox.x,
                    lfmBoundingBox.y,
                    lfmBoundingBox.width,
                    lfmBoundingBox.height
                )
                context.strokeRect(
                    mainPanelBoundingBox.x,
                    mainPanelBoundingBox.y,
                    mainPanelBoundingBox.width,
                    mainPanelBoundingBox.height
                )
                context.strokeRect(
                    questPanelBoundingBox.x,
                    questPanelBoundingBox.y,
                    questPanelBoundingBox.width,
                    questPanelBoundingBox.height
                )
                context.strokeRect(
                    classPanelBoundingBox.x,
                    classPanelBoundingBox.y,
                    classPanelBoundingBox.width,
                    classPanelBoundingBox.height
                )
                context.strokeRect(
                    levelPanelBoundingBox.x,
                    levelPanelBoundingBox.y,
                    levelPanelBoundingBox.width,
                    levelPanelBoundingBox.height
                )
                context.strokeRect(
                    leaderClassIconBoundingBox.x,
                    leaderClassIconBoundingBox.y,
                    leaderClassIconBoundingBox.width,
                    leaderClassIconBoundingBox.height
                )
                context.strokeRect(
                    leaderNameBoundingBox.x,
                    leaderNameBoundingBox.y,
                    leaderNameBoundingBox.width,
                    leaderNameBoundingBox.height
                )
                context.strokeRect(
                    memberCountBoundingBox.x,
                    memberCountBoundingBox.y,
                    memberCountBoundingBox.width,
                    memberCountBoundingBox.height
                )
                context.strokeRect(
                    commentBoundingBox.x,
                    commentBoundingBox.y,
                    commentBoundingBox.width,
                    commentBoundingBox.height
                )
                context.strokeRect(
                    questNameBoundingBox.x,
                    questNameBoundingBox.y,
                    questNameBoundingBox.width,
                    questNameBoundingBox.height
                )
                context.strokeRect(
                    difficultyBoundingBox.x,
                    difficultyBoundingBox.y,
                    difficultyBoundingBox.width,
                    difficultyBoundingBox.height
                )
            }
        },
        [lfmSprite, context, panelWidth, showBoundingBoxes]
    )

    return { renderLfmToCanvas }
}

export default useRenderLfms
