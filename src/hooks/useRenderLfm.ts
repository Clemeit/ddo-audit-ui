import { useCallback, useMemo } from "react"
import { Lfm } from "../models/Lfm.ts"
import {
    LFM_HEIGHT,
    LFM_COLORS,
    FONTS,
    QUEST_INFO_GAP,
    REAPER_EXPRESSION,
    ELITE_EXPRESSION,
    HARD_EXPRESSION,
    SKULL_EXPRESSION,
} from "../constants/lfmPanel.ts"
import { useLfmContext } from "../contexts/LfmContext.tsx"
import { BoundingBox } from "../models/Geometry.ts"
import useTextRenderer from "./useTextRenderer.ts"
import {
    calculateCommonBoundingBoxes,
    getLfmPostedTimestamp,
} from "../utils/lfmUtils.ts"
import { convertMillisecondsToPrettyString } from "../utils/stringUtils.ts"
import { SPRITE_MAP } from "../constants/spriteMap.ts"
import { mapRaceAndGenderToRaceIconBoundingBox } from "../utils/socialUtils.ts"
import { useQuestContext } from "../contexts/QuestContext.tsx"

interface Props {
    lfmSprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
    raidView?: boolean
}

const useRenderLfm = ({ lfmSprite, context, raidView = false }: Props) => {
    const {
        panelWidth,
        showBoundingBoxes,
        fontSize,
        // showRaidTimerIndicator,
        showMemberCount,
        showQuestGuesses,
        showQuestTips,
        showLfmPostedTime,
        showIndicationForGroupsPostedByFriends,
        showIndicationForGroupsContainingFriends,
        highlightRaids,
    } = useLfmContext()
    const { confineTextToBoundingBox } = useTextRenderer(context)
    const commonBoundingBoxes = useMemo(
        () => calculateCommonBoundingBoxes(panelWidth),
        [panelWidth]
    )
    const questContext = useQuestContext()
    const { quests } = questContext

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

    const renderLfm = useCallback(
        (lfm: Lfm) => {
            if (!context || !lfmSprite) return
            context.imageSmoothingEnabled = false
            const fonts = FONTS(fontSize)
            const quest = quests[lfm.quest_id || 0] ?? quests[0]

            // set up this lfm's bounds
            const {
                lfmBoundingBox,
                mainPanelBoundingBox,
                questPanelBoundingBox,
                classPanelBoundingBox,
                levelPanelBoundingBox,
                leaderRaceIconBoundingBox,
                classesBoundingBox,
                questPanelBoundingBoxWithPadding,
                levelPanelBoundingBoxWithPadding,
            } = commonBoundingBoxes
            const {
                textLines: leaderNameTextLines,
                boundingBox: leaderNameBoundingBox,
            } = confineTextToBoundingBox({
                text: lfm.leader.name || "Anonymous",
                boundingBox: new BoundingBox(
                    leaderRaceIconBoundingBox.x +
                        leaderRaceIconBoundingBox.width +
                        4,
                    mainPanelBoundingBox.y,
                    mainPanelBoundingBox.width,
                    mainPanelBoundingBox.height
                ),
                font: fonts.LEADER_NAME,
            })
            leaderNameBoundingBox.y =
                leaderRaceIconBoundingBox.centerY() -
                leaderNameBoundingBox.height / 2
            const leaderTotalLevelWidth = getTextWidthAndHeight(
                `${lfm.leader.total_level}`,
                fonts.LEADER_NAME,
                context
            ).width

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
                mainPanelBoundingBox.width -
                    leaderNameBoundingBox.right() -
                    8 -
                    leaderTotalLevelWidth -
                    10
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
                    leaderRaceIconBoundingBox.y +
                        leaderRaceIconBoundingBox.height +
                        4,
                    mainPanelBoundingBox.width - 8,
                    mainPanelBoundingBox.height -
                        leaderRaceIconBoundingBox.bottom() -
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
                text: quest?.name,
                boundingBox: questPanelBoundingBoxWithPadding,
                font: fonts.QUEST_NAME,
                maxLines: showQuestTips && quest?.tip ? 1 : 2,
                centered: true,
            })
            const {
                textLines: questTipTextLines,
                boundingBox: questTipBoundingBox,
            } = confineTextToBoundingBox({
                text: quest?.tip,
                boundingBox: questPanelBoundingBoxWithPadding,
                font: fonts.COMMENT,
                maxLines: 1,
                centered: true,
            })
            const skullCountMatches = lfm.comment.match(SKULL_EXPRESSION)
            let skullCount = 0
            let skullPlus = false
            if (skullCountMatches) {
                skullCount = parseInt(skullCountMatches[2])
                skullPlus = !!skullCountMatches[3]
            }
            let lfmDifficultyString = ""
            if (!lfm.is_quest_guess) {
                lfmDifficultyString = lfm.difficulty
            } else {
                if (REAPER_EXPRESSION.test(lfm.comment) || skullCountMatches) {
                    lfmDifficultyString = "Reaper"
                } else if (ELITE_EXPRESSION.test(lfm.comment)) {
                    lfmDifficultyString = "Elite"
                } else if (HARD_EXPRESSION.test(lfm.comment)) {
                    lfmDifficultyString = "Hard"
                } else {
                    lfmDifficultyString = "Normal"
                }
            }
            if (skullCount > 0) {
                lfmDifficultyString += ` ${skullCount}${skullPlus ? "+" : ""}`
            }
            const {
                textLines: questDifficultyTextLines,
                boundingBox: questDifficultyBoundingBox,
            } = confineTextToBoundingBox({
                text: lfmDifficultyString,
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
                hasTip: !!quest?.tip,
            })
            questNameBoundingBox.y = questNameBoundingBoxY
            questTipBoundingBox.y = questTipBoundingBoxY
            questDifficultyBoundingBox.y = questDifficultyBoundingBoxY

            const levelRangeText = `${lfm.minimum_level} - ${lfm.maximum_level}`
            const {
                textLines: levelRangeTextLines,
                boundingBox: levelRangeBoundingBox,
                lineHeight: levelRangeLineHeight,
            } = confineTextToBoundingBox({
                text: levelRangeText,
                boundingBox: levelPanelBoundingBoxWithPadding,
                font: fonts.LEVEL_RANGE,
                centered: true,
            })

            // background and edges
            context.fillStyle = lfm.metadata?.isEligible
                ? LFM_COLORS.BLACK_BACKGROUND
                : LFM_COLORS.INELIGIBLE_FILL
            context.fillRect(
                0,
                0,
                Math.floor(lfmBoundingBox.width),
                Math.floor(LFM_HEIGHT)
            )

            // gradient fill
            const shouldHighlightForFriends =
                (lfm.metadata?.isPostedByFriend &&
                    showIndicationForGroupsPostedByFriends) ||
                (lfm.metadata?.includesFriend &&
                    showIndicationForGroupsContainingFriends)
            const shouldHighlightRaid =
                !raidView && highlightRaids && quest?.group_size === "Raid"
            if (lfm.metadata?.isEligible || shouldHighlightForFriends) {
                const gradient = context.createLinearGradient(
                    0,
                    0,
                    0,
                    lfmBoundingBox.height
                )
                let edgeColor = LFM_COLORS.ELIGIBLE_GRADIENT_EDGE
                let centerColor = LFM_COLORS.ELIGIBLE_GRADIENT_CENTER
                if (
                    (lfm.metadata?.isPostedByFriend &&
                        showIndicationForGroupsPostedByFriends) ||
                    (lfm.metadata?.includesFriend &&
                        showIndicationForGroupsContainingFriends)
                ) {
                    if (lfm.metadata?.isEligible) {
                        edgeColor = LFM_COLORS.FRIEND_GRADIENT_EDGE
                        centerColor = LFM_COLORS.FRIEND_GRADIENT_CENTER
                    } else {
                        edgeColor = LFM_COLORS.INELIGIBLE_FRIEND_GRADIENT_EDGE
                        centerColor =
                            LFM_COLORS.INELIGIBLE_FRIEND_GRADIENT_CENTER
                    }
                }

                gradient.addColorStop(0, edgeColor)
                gradient.addColorStop(0.25, centerColor)
                gradient.addColorStop(0.75, centerColor)
                gradient.addColorStop(1, edgeColor)
                context.fillStyle = gradient
                context.fillRect(
                    Math.floor(lfmBoundingBox.x),
                    Math.floor(lfmBoundingBox.y),
                    Math.floor(lfmBoundingBox.width),
                    Math.floor(lfmBoundingBox.height)
                )
            }
            if (shouldHighlightRaid) {
                const gradient = context.createLinearGradient(
                    0,
                    0,
                    0,
                    lfmBoundingBox.height
                )
                let edgeColor = LFM_COLORS.ELIGIBLE_GRADIENT_EDGE
                let centerColor = LFM_COLORS.ELIGIBLE_GRADIENT_CENTER
                if (lfm.metadata?.isEligible) {
                    edgeColor = LFM_COLORS.ELIGIBLE_RAID_GRADIENT_EDGE
                    centerColor = LFM_COLORS.ELIGIBLE_RAID_GRADIENT_CENTER
                } else {
                    edgeColor = LFM_COLORS.INELIGIBLE_RAID_GRADIENT_EDGE
                    centerColor = LFM_COLORS.INELIGIBLE_RAID_GRADIENT_CENTER
                }
                gradient.addColorStop(0, edgeColor)
                gradient.addColorStop(0.25, centerColor)
                gradient.addColorStop(0.75, centerColor)
                gradient.addColorStop(1, edgeColor)
                context.strokeStyle = gradient
                context.lineWidth = 3
                context.strokeRect(
                    Math.floor(lfmBoundingBox.x + 3),
                    Math.floor(lfmBoundingBox.y + 3),
                    Math.floor(lfmBoundingBox.width - 6),
                    Math.floor(lfmBoundingBox.height - 6)
                )
            }

            // dividers
            context.globalAlpha = 1
            context.strokeStyle = LFM_COLORS.LFM_BORDER
            context.lineWidth = 1
            context.strokeRect(
                Math.floor(mainPanelBoundingBox.x) + 0.5,
                Math.floor(mainPanelBoundingBox.y) + 0.5,
                Math.floor(mainPanelBoundingBox.width),
                Math.floor(mainPanelBoundingBox.height)
            )
            context.strokeRect(
                Math.floor(questPanelBoundingBox.x) + 0.5,
                Math.floor(questPanelBoundingBox.y) + 0.5,
                Math.floor(questPanelBoundingBox.width),
                Math.floor(questPanelBoundingBox.height)
            )
            context.strokeRect(
                Math.floor(classPanelBoundingBox.x) + 0.5,
                Math.floor(classPanelBoundingBox.y) + 0.5,
                Math.floor(classPanelBoundingBox.width),
                Math.floor(classPanelBoundingBox.height)
            )
            context.strokeRect(
                Math.floor(levelPanelBoundingBox.x) + 0.5,
                Math.floor(levelPanelBoundingBox.y) + 0.5,
                Math.floor(levelPanelBoundingBox.width),
                Math.floor(levelPanelBoundingBox.height)
            )

            if (!lfm.metadata?.isEligible) {
                context.globalAlpha = 0.5
            }

            // ===== MAIN PANEL =====
            // leader race icon
            const leaderRaceIcon = mapRaceAndGenderToRaceIconBoundingBox(
                lfm.leader?.race || "human",
                lfm.leader?.gender || "male"
            )
            context.drawImage(
                lfmSprite,
                leaderRaceIcon.x,
                leaderRaceIcon.y,
                leaderRaceIcon.width,
                leaderRaceIcon.height,
                leaderRaceIconBoundingBox.x,
                leaderRaceIconBoundingBox.y,
                leaderRaceIcon.width,
                leaderRaceIcon.height
            )

            // leader name
            context.fillStyle = LFM_COLORS.LEADER_NAME
            context.font = fonts.LEADER_NAME
            context.textBaseline = "middle"
            context.textAlign = "left"
            context.fillText(
                leaderNameTextLines[0],
                leaderNameBoundingBox.x,
                leaderNameBoundingBox.centerY()
            )
            // leader total level
            context.fillStyle = LFM_COLORS.STANDARD_TEXT
            context.font = fonts.MEMBER_COUNT
            context.textBaseline = "middle"
            context.textAlign = "right"
            context.fillText(
                lfm.leader.total_level?.toString() || "??",
                mainPanelBoundingBox.right() - 5,
                leaderNameBoundingBox.centerY()
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
            if (
                !!lfm.quest_id &&
                (lfm.is_quest_guess ? showQuestGuesses : true)
            ) {
                // quest name
                context.fillStyle =
                    lfm.is_quest_guess && lfm.metadata?.isEligible
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
                if (quest.tip && showQuestTip) {
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
                lfm.accepted_classes == null ||
                lfm.accepted_classes.length === 0
            ) {
                context.drawImage(
                    lfmSprite,
                    SPRITE_MAP.CLASSES.ALL.x,
                    SPRITE_MAP.CLASSES.ALL.y,
                    SPRITE_MAP.CLASSES.ALL.width,
                    SPRITE_MAP.CLASSES.ALL.height,
                    classesBoundingBox.x,
                    classesBoundingBox.y,
                    SPRITE_MAP.CLASSES.ALL.width,
                    SPRITE_MAP.CLASSES.ALL.height
                )
            } else {
                lfm.accepted_classes.forEach((acceptedClass, index) => {
                    const row = Math.floor(index / 5)
                    const col = index % 5
                    const acceptedClassKey = acceptedClass
                        .toUpperCase()
                        .replace(/\s+/g, "_")
                    const classSprite = SPRITE_MAP.CLASSES[acceptedClassKey]
                    if (classSprite) {
                        context.drawImage(
                            lfmSprite,
                            classSprite.x,
                            classSprite.y,
                            classSprite.width,
                            classSprite.height,
                            classesBoundingBox.x +
                                col * (classSprite.width + 1),
                            classesBoundingBox.y +
                                row * (classSprite.height + 1),
                            classSprite.width,
                            classSprite.height
                        )
                    }
                })
            }

            // ===== LEVEL PANEL =====
            context.fillStyle = LFM_COLORS.STANDARD_TEXT
            context.font = fonts.LEVEL_RANGE
            context.textBaseline = "top"
            context.textAlign = "center"
            levelRangeTextLines.forEach((line, index) => {
                context.fillText(
                    line,
                    levelRangeBoundingBox.centerX(),
                    levelRangeBoundingBox.y + index * levelRangeLineHeight * 1.2
                )
            })

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
                    leaderRaceIconBoundingBox.x,
                    leaderRaceIconBoundingBox.y,
                    leaderRaceIconBoundingBox.width,
                    leaderRaceIconBoundingBox.height
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
            highlightRaids,
        ]
    )

    return { renderLfm }
}

export default useRenderLfm
