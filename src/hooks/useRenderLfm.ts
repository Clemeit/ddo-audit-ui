import { useCallback, useMemo } from "react"
import { Lfm } from "../models/Lfm.ts"
import {
    LFM_HEIGHT,
    LFM_SPRITE_MAP,
    LFM_COLORS,
    FONTS,
    QUEST_INFO_GAP,
} from "../constants/lfmPanel.ts"
import { useLfmContext } from "../contexts/LfmContext.tsx"
import { CLASS_LIST } from "../constants/game.ts"
import { BoundingBox } from "../models/Geometry.ts"
import useTextRenderer from "./useTextRenderer.ts"
import {
    calculateCommonBoundingBoxes,
    getLfmPostedTimestamp,
    mapRaceAndGenderToRaceIconBoundingBox,
} from "../utils/lfmUtils.ts"
import { convertMillisecondsToPrettyString } from "../utils/stringUtils.ts"

interface Props {
    lfmSprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
}

const useRenderLfm = ({ lfmSprite, context }: Props) => {
    const {
        panelWidth,
        showBoundingBoxes,
        fontSize,
        // showRaidTimerIndicator,
        showMemberCount,
        showQuestGuesses,
        showQuestTips,
        showLfmPostedTime,
    } = useLfmContext()
    const { confineTextToBoundingBox } = useTextRenderer(context)
    const commonBoundingBoxes = useMemo(
        () => calculateCommonBoundingBoxes(panelWidth),
        [panelWidth]
    )

    function getTextWidthAndHeight(
        text: string,
        font: string,
        context: CanvasRenderingContext2D
    ) {
        const initialFont = context.font
        context.font = font
        const measuredText = context.measureText(text)
        const height =
            measuredText.fontBoundingBoxAscent +
            measuredText.fontBoundingBoxDescent
        const width = measuredText.width
        context.font = initialFont
        return {
            width,
            height,
        }
    }

    const calculateQuestInfoYPositions = useCallback(
        ({
            questNameBoundingBox,
            questTipBoundingBox,
            questDifficultyBoundingBox,
            questPanelBoundingBox,
            hasTip,
        }: {
            questNameBoundingBox: BoundingBox
            questTipBoundingBox: BoundingBox
            questDifficultyBoundingBox: BoundingBox
            questPanelBoundingBox: BoundingBox
            hasTip: boolean
        }) => {
            let totalQuestInfoHeight =
                questNameBoundingBox.height +
                QUEST_INFO_GAP +
                (hasTip && showQuestTips
                    ? questTipBoundingBox.height + QUEST_INFO_GAP
                    : 0) +
                questDifficultyBoundingBox.height
            let topPadding = Math.max(
                0,
                (questPanelBoundingBox.height - totalQuestInfoHeight) / 2
            )
            const hasEnoughSpaceForTip =
                hasTip &&
                showQuestTips &&
                totalQuestInfoHeight < questPanelBoundingBox.height
            if (!hasEnoughSpaceForTip) {
                totalQuestInfoHeight =
                    questNameBoundingBox.height +
                    QUEST_INFO_GAP +
                    questDifficultyBoundingBox.height
                topPadding = Math.max(
                    0,
                    (questPanelBoundingBox.height - totalQuestInfoHeight) / 2
                )
            }
            const questNameBoundingBoxY = topPadding
            const questDifficultyBoundingBoxY =
                questPanelBoundingBox.bottom() -
                topPadding -
                questDifficultyBoundingBox.height
            const questTipBoundingBoxY =
                questNameBoundingBoxY +
                questNameBoundingBox.height +
                (questDifficultyBoundingBoxY -
                    (questNameBoundingBoxY + questNameBoundingBox.height)) /
                    2 -
                questTipBoundingBox.height / 2

            return {
                questNameBoundingBoxY,
                questTipBoundingBoxY,
                questDifficultyBoundingBoxY,
                hasEnoughSpaceForTip,
            }
        },
        [showQuestTips]
    )

    const renderLfmToCanvas = useCallback(
        (lfm: Lfm) => {
            if (!context || !lfmSprite) return
            const fonts = FONTS(fontSize)

            // set up this lfm's bounds
            const {
                lfmBoundingBox,
                mainPanelBoundingBox,
                questPanelBoundingBox,
                classPanelBoundingBox,
                levelPanelBoundingBox,
                leaderClassIconBoundingBox,
                classesBoundingBox,
                questPanelBoundingBoxWithPadding,
                levelPanelBoundingBoxWithPadding,
            } = commonBoundingBoxes
            const {
                textLines: leaderNameTextLines,
                boundingBox: leaderNameBoundingBox,
            } = confineTextToBoundingBox({
                text: lfm.leader.name,
                boundingBox: new BoundingBox(
                    leaderClassIconBoundingBox.x +
                        leaderClassIconBoundingBox.width +
                        6,
                    mainPanelBoundingBox.y,
                    mainPanelBoundingBox.width,
                    mainPanelBoundingBox.height
                ),
                font: fonts.LEADER_NAME,
            })
            leaderNameBoundingBox.y =
                leaderClassIconBoundingBox.centerY() -
                leaderNameBoundingBox.height / 2

            const localShowMemberCount = lfm.members.length > 0
            const memberCountTextOptions = (abbreviated) =>
                `(${lfm.members.length + 1}${abbreviated ? "" : " members"})`
            let memberCountText = ""
            let memberCountTextBounds = getTextWidthAndHeight(
                memberCountTextOptions(false),
                fonts.COMMENT,
                context
            )
            if (
                memberCountTextBounds.width >
                mainPanelBoundingBox.width - leaderNameBoundingBox.right() - 8
            ) {
                memberCountText = memberCountTextOptions(true)
                memberCountTextBounds = getTextWidthAndHeight(
                    memberCountTextOptions(true),
                    fonts.COMMENT,
                    context
                )
            } else {
                memberCountText = memberCountTextOptions(false)
            }

            const {
                textLines: memberCountTextLines,
                boundingBox: memberCountBoundingBox,
            } = confineTextToBoundingBox({
                text: showMemberCount ? memberCountText : "",
                boundingBox: mainPanelBoundingBox,
                font: fonts.MEMBER_COUNT,
            })
            memberCountBoundingBox.x = leaderNameBoundingBox.right() + 6
            memberCountBoundingBox.y =
                leaderNameBoundingBox.centerY() -
                memberCountBoundingBox.height / 2

            const lfmPostedTimestamp = getLfmPostedTimestamp(lfm)
            const postedTimeDifference =
                new Date().getTime() - lfmPostedTimestamp.getTime()
            const postedTimeDifferenceString =
                postedTimeDifference < 60000
                    ? "Just now"
                    : `${convertMillisecondsToPrettyString(Math.round(postedTimeDifference), false, true, true)} ago`
            const isAdventureActive = lfm.adventure_active_time > 0
            const adventureActiveMinutes = Math.round(
                lfm.adventure_active_time / 60
            )
            // TODO: the LFM doesn't re-render when the time since posted changes,
            // so the timer note doesn't update unless something else about the LFM
            // changes. Find a way to force a re-render when the time since posted changes.
            // Maybe force re-render every minute?
            const showTimerNote =
                isAdventureActive || (!!lfmPostedTimestamp && showLfmPostedTime)
            const timerNoteTextOptions = (abbreviated: boolean) =>
                isAdventureActive
                    ? `${abbreviated ? "" : "Adventure "}Active: ${adventureActiveMinutes === 0 ? "<1 minute" : `${adventureActiveMinutes} minute${adventureActiveMinutes === 1 ? "" : "s"}`}`
                    : `Posted: ${postedTimeDifferenceString}`
            const timerNoteTextWidth = getTextWidthAndHeight(
                timerNoteTextOptions(false),
                fonts.COMMENT,
                context
            ).width
            let timerNoteText = ""
            if (timerNoteTextWidth > mainPanelBoundingBox.width - 8) {
                timerNoteText = timerNoteTextOptions(true)
            } else {
                timerNoteText = timerNoteTextOptions(false)
            }
            const { boundingBox: timerNoteTextBoundingBox } =
                confineTextToBoundingBox({
                    text: showTimerNote ? timerNoteText : "",
                    boundingBox: mainPanelBoundingBox,
                    font: fonts.COMMENT,
                    centered: true,
                })
            timerNoteTextBoundingBox.y =
                mainPanelBoundingBox.bottom() -
                timerNoteTextBoundingBox.height -
                4

            const {
                textLines: commentLines,
                lineHeight: commentLineHeight,
                boundingBox: commentBoundingBox,
            } = confineTextToBoundingBox({
                text: lfm.comment,
                boundingBox: new BoundingBox(
                    mainPanelBoundingBox.x + 4,
                    leaderClassIconBoundingBox.y +
                        leaderClassIconBoundingBox.height +
                        4,
                    mainPanelBoundingBox.width - 8,
                    mainPanelBoundingBox.height -
                        leaderClassIconBoundingBox.bottom() -
                        (showTimerNote
                            ? mainPanelBoundingBox.bottom() -
                              timerNoteTextBoundingBox.top() +
                              6
                            : 0)
                ),
                font: fonts.COMMENT,
            })
            const {
                textLines: questNameTextLines,
                lineHeight: questNameLineHeight,
                boundingBox: questNameBoundingBox,
            } = confineTextToBoundingBox({
                text: lfm.quest?.name,
                boundingBox: questPanelBoundingBoxWithPadding,
                font: fonts.QUEST_NAME,
                maxLines: 2,
                centered: true,
            })
            const {
                textLines: questTipTextLines,
                boundingBox: questTipBoundingBox,
            } = confineTextToBoundingBox({
                text: lfm.quest?.tip,
                boundingBox: questPanelBoundingBoxWithPadding,
                font: fonts.COMMENT,
                maxLines: 1,
                centered: true,
            })
            const {
                textLines: questDifficultyTextLines,
                boundingBox: questDifficultyBoundingBox,
            } = confineTextToBoundingBox({
                text: lfm.difficulty,
                boundingBox: questPanelBoundingBoxWithPadding,
                font: fonts.COMMENT,
                maxLines: 1,
                centered: true,
            })

            const {
                questNameBoundingBoxY,
                questTipBoundingBoxY,
                questDifficultyBoundingBoxY,
                hasEnoughSpaceForTip: showQuestTip,
            } = calculateQuestInfoYPositions({
                questNameBoundingBox,
                questTipBoundingBox,
                questDifficultyBoundingBox,
                questPanelBoundingBox,
                hasTip: !!lfm.quest?.tip,
            })
            questNameBoundingBox.y = questNameBoundingBoxY
            questTipBoundingBox.y = questTipBoundingBoxY
            questDifficultyBoundingBox.y = questDifficultyBoundingBoxY

            const levelRangeText = `${lfm.minimum_level} - ${lfm.maximum_level}`
            const {
                textLines: levelRangeTextLines,
                boundingBox: levelRangeBoundingBox,
            } = confineTextToBoundingBox({
                text: levelRangeText,
                boundingBox: levelPanelBoundingBoxWithPadding,
                font: fonts.LEVEL_RANGE,
                centered: true,
            })

            // background and edges
            context.fillStyle = lfm.is_eligible
                ? LFM_COLORS.BLACK_BACKGROUND
                : LFM_COLORS.INELIGIBLE_FILL
            context.fillRect(0, 0, lfmBoundingBox.width, LFM_HEIGHT)

            // gradient fill
            if (lfm.is_eligible) {
                const gradient = context.createLinearGradient(
                    0,
                    0,
                    0,
                    lfmBoundingBox.height
                )
                gradient.addColorStop(0, LFM_COLORS.ELIGIBLE_GRADIENT_EDGE)
                gradient.addColorStop(0.25, LFM_COLORS.ELIGIBLE_GRADIENT_CENTER)
                gradient.addColorStop(0.75, LFM_COLORS.ELIGIBLE_GRADIENT_CENTER)
                gradient.addColorStop(1, LFM_COLORS.ELIGIBLE_GRADIENT_EDGE)
                context.fillStyle = gradient
                context.fillRect(
                    lfmBoundingBox.x,
                    lfmBoundingBox.y,
                    lfmBoundingBox.width,
                    lfmBoundingBox.height
                )
            }

            // dividers
            context.strokeStyle = LFM_COLORS.LFM_BORDER
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

            if (!lfm.is_eligible) {
                context.globalAlpha = 0.5
            }

            // ===== MAIN PANEL =====
            // leader class icon
            const leaderClassIcon = mapRaceAndGenderToRaceIconBoundingBox(
                lfm.leader.race || "human",
                lfm.leader.gender || "male"
            )
            context.drawImage(
                lfmSprite,
                leaderClassIcon.x,
                leaderClassIcon.y,
                leaderClassIcon.width,
                leaderClassIcon.height,
                leaderClassIconBoundingBox.x,
                leaderClassIconBoundingBox.y,
                leaderClassIcon.width,
                leaderClassIcon.height
            )

            // leader name
            context.fillStyle = LFM_COLORS.LEADER_NAME
            context.font = fonts.LEADER_NAME
            context.textBaseline = "middle"
            context.textAlign = "left"
            context.fillText(
                leaderNameTextLines[0] || "Anonymous",
                leaderNameBoundingBox.x,
                leaderNameBoundingBox.y + leaderNameBoundingBox.height / 2
            )
            // member count
            if (localShowMemberCount && showMemberCount) {
                context.textAlign = "center"
                context.fillStyle = LFM_COLORS.SECONDARY_TEXT
                context.font = fonts.MEMBER_COUNT
                context.fillText(
                    memberCountTextLines[0],
                    memberCountBoundingBox.centerX(),
                    memberCountBoundingBox.centerY()
                )
            }
            // comment
            context.fillStyle = LFM_COLORS.COMMENT_TEXT
            context.font = fonts.COMMENT
            context.textBaseline = "top"
            context.textAlign = "left"
            commentLines.forEach((line, index) => {
                context.fillText(
                    line,
                    commentBoundingBox.x,
                    commentBoundingBox.y + index * commentLineHeight
                )
            })
            // adventure active time
            if (showTimerNote) {
                context.fillStyle = isAdventureActive
                    ? LFM_COLORS.ADVENTURE_ACTIVE
                    : LFM_COLORS.LFM_POSTED
                context.font = fonts.COMMENT
                context.textBaseline = "middle"
                context.textAlign = "center"
                context.fillText(
                    timerNoteText,
                    timerNoteTextBoundingBox.x +
                        timerNoteTextBoundingBox.width / 2,
                    timerNoteTextBoundingBox.y +
                        timerNoteTextBoundingBox.height / 2
                )
            }

            // ===== QUEST PANEL =====
            if (lfm.quest && (lfm.is_quest_guess ? showQuestGuesses : true)) {
                // quest name
                context.fillStyle =
                    lfm.is_quest_guess && lfm.is_eligible
                        ? LFM_COLORS.GUESS_TEXT
                        : LFM_COLORS.STANDARD_TEXT
                context.font = lfm.is_quest_guess
                    ? fonts.QUEST_GUESS_NAME
                    : fonts.QUEST_NAME
                context.textBaseline = "middle"
                context.textAlign = "center"
                questNameTextLines.forEach((line, index) => {
                    context.fillText(
                        line,
                        questNameBoundingBox.centerX(),
                        questNameBoundingBox.top() +
                            index * questNameLineHeight +
                            questNameLineHeight / 2
                    )
                })
                // quest tip
                if (lfm.quest.tip && showQuestTip) {
                    context.font = fonts.TIP
                    questTipTextLines.forEach((line) => {
                        context.fillText(
                            line,
                            questTipBoundingBox.centerX(),
                            questTipBoundingBox.centerY()
                        )
                    })
                }
                // quest difficulty
                context.font = fonts.COMMENT
                context.fillText(
                    questDifficultyTextLines[0] || "",
                    questDifficultyBoundingBox.centerX(),
                    questDifficultyBoundingBox.centerY()
                )
            }

            // ===== CLASS PANEL =====
            if (
                lfm.accepted_classes_count === CLASS_LIST.length ||
                lfm.accepted_classes == null
            ) {
                context.drawImage(
                    lfmSprite,
                    LFM_SPRITE_MAP.CLASSES.ALL.x,
                    LFM_SPRITE_MAP.CLASSES.ALL.y,
                    LFM_SPRITE_MAP.CLASSES.ALL.width,
                    LFM_SPRITE_MAP.CLASSES.ALL.height,
                    classesBoundingBox.x,
                    classesBoundingBox.y,
                    LFM_SPRITE_MAP.CLASSES.ALL.width,
                    LFM_SPRITE_MAP.CLASSES.ALL.height
                )
            }

            // ===== LEVEL PANEL =====
            context.fillStyle = LFM_COLORS.STANDARD_TEXT
            context.font = fonts.LEVEL_RANGE
            context.textBaseline = "middle"
            context.textAlign = "center"
            context.fillText(
                levelRangeTextLines[0],
                levelRangeBoundingBox.centerX(),
                levelRangeBoundingBox.centerY()
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
                    timerNoteTextBoundingBox.x,
                    timerNoteTextBoundingBox.y,
                    timerNoteTextBoundingBox.width,
                    timerNoteTextBoundingBox.height
                )
                context.strokeRect(
                    questNameBoundingBox.x,
                    questNameBoundingBox.y,
                    questNameBoundingBox.width,
                    questNameBoundingBox.height
                )
                context.strokeRect(
                    classesBoundingBox.x,
                    classesBoundingBox.y,
                    classesBoundingBox.width,
                    classesBoundingBox.height
                )
                context.strokeRect(
                    levelRangeBoundingBox.x,
                    levelRangeBoundingBox.y,
                    levelRangeBoundingBox.width,
                    levelRangeBoundingBox.height
                )
                context.strokeRect(
                    questTipBoundingBox.x,
                    questTipBoundingBox.y,
                    questTipBoundingBox.width,
                    questTipBoundingBox.height
                )
                context.strokeRect(
                    questDifficultyBoundingBox.x,
                    questDifficultyBoundingBox.y,
                    questDifficultyBoundingBox.width,
                    questDifficultyBoundingBox.height
                )
            }

            context.globalAlpha = 1
        },
        [
            lfmSprite,
            context,
            showBoundingBoxes,
            commonBoundingBoxes,
            fontSize,
            // showRaidTimerIndicator,
            showLfmPostedTime,
            showMemberCount,
            showQuestGuesses,
            confineTextToBoundingBox,
            calculateQuestInfoYPositions,
        ]
    )

    return { renderLfmToCanvas }
}

export default useRenderLfm
