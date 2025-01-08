import { useCallback, useMemo } from "react"
import { Lfm } from "../models/Lfm"
import {
    LFM_HEIGHT,
    LFM_PADDING,
    GROUPING_SPRITE_MAP,
    GROUPING_COLORS,
    FONTS,
} from "../constants/grouping.ts"
import { useGroupingContext } from "../components/grouping/GroupingContext.tsx"
import { CLASS_LIST } from "../constants/game.ts"
import { BoundingBox } from "../models/Geometry.ts"
import useTextRenderer from "./useTextRenderer.ts"

interface UseRenderLfmsProps {
    lfmSprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
}

const useRenderLfms = ({ lfmSprite, context }: UseRenderLfmsProps) => {
    const { panelWidth, showBoundingBoxes, fontSize } = useGroupingContext()
    const { confineTextToBoundingBox } = useTextRenderer(context)

    function getTextWidthAndHeight(
        text: string,
        font: string,
        context: CanvasRenderingContext2D
    ) {
        const initialFont = context.font
        context.font = font
        const measuredText = context.measureText(text)
        const height =
            measuredText.actualBoundingBoxAscent +
            measuredText.actualBoundingBoxDescent
        const width = measuredText.width
        context.font = initialFont
        return {
            width,
            height,
        }
    }

    const commonBoundingBoxes = useMemo(() => {
        const lfmBoundingBox = new BoundingBox(
            LFM_PADDING.left + GROUPING_SPRITE_MAP.CONTENT_LEFT.width,
            LFM_PADDING.top,
            panelWidth -
                LFM_PADDING.right -
                LFM_PADDING.left -
                GROUPING_SPRITE_MAP.CONTENT_LEFT.width -
                GROUPING_SPRITE_MAP.CONTENT_RIGHT.width,
            LFM_HEIGHT - LFM_PADDING.top - LFM_PADDING.bottom
        )
        const mainPanelBoundingBox = new BoundingBox(
            lfmBoundingBox.x,
            lfmBoundingBox.y,
            lfmBoundingBox.width * 0.4,
            lfmBoundingBox.height
        )
        const questPanelBoundingBox = new BoundingBox(
            mainPanelBoundingBox.x + mainPanelBoundingBox.width,
            lfmBoundingBox.y,
            lfmBoundingBox.width * 0.25,
            lfmBoundingBox.height
        )
        const classPanelBoundingBox = new BoundingBox(
            questPanelBoundingBox.x + questPanelBoundingBox.width,
            lfmBoundingBox.y,
            lfmBoundingBox.width * 0.2,
            lfmBoundingBox.height
        )
        const levelPanelBoundingBox = new BoundingBox(
            classPanelBoundingBox.x + classPanelBoundingBox.width,
            lfmBoundingBox.y,
            lfmBoundingBox.width * 0.15,
            lfmBoundingBox.height
        )
        const leaderClassIconBoundingBox = new BoundingBox(
            mainPanelBoundingBox.x + 4,
            mainPanelBoundingBox.y + 4,
            18,
            18
        )
        const classesBoundingBox = new BoundingBox(
            classPanelBoundingBox.x + 4,
            classPanelBoundingBox.y + 4,
            GROUPING_SPRITE_MAP.CLASSES.ALL.width,
            GROUPING_SPRITE_MAP.CLASSES.ALL.height
        )
        const questPanelBoundingBoxWithPadding = new BoundingBox(
            questPanelBoundingBox.x + 4,
            questPanelBoundingBox.y + 4,
            questPanelBoundingBox.width - 8,
            questPanelBoundingBox.height - 8
        )
        const levelPanelBoundingBoxWithPadding = new BoundingBox(
            levelPanelBoundingBox.x + 4,
            levelPanelBoundingBox.y + 4,
            levelPanelBoundingBox.width - 8,
            levelPanelBoundingBox.height - 8
        )

        return {
            lfmBoundingBox,
            mainPanelBoundingBox,
            questPanelBoundingBox,
            classPanelBoundingBox,
            levelPanelBoundingBox,
            leaderClassIconBoundingBox,
            classesBoundingBox,
            questPanelBoundingBoxWithPadding,
            levelPanelBoundingBoxWithPadding,
        }
    }, [panelWidth])

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

            const showMemberCount = lfm.members.length > 0
            const memberCountTextOptions = (abbreviated) =>
                `(${lfm.members.length + 1}${abbreviated ? "" : " members"})`
            let memberCountText = ""
            let memberCountTextBounds = getTextWidthAndHeight(
                memberCountTextOptions(false),
                fonts.COMMENT,
                context
            )
            if (memberCountTextBounds.width > mainPanelBoundingBox.width - 8) {
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

            const showAdventureActiveTime =
                Math.round(lfm.adventure_active_time / 60) > 0
            const adventureActiveTextOptions = (abbreviated: boolean) =>
                `${abbreviated ? "" : "Adventure "}Active: ${Math.round(lfm.adventure_active_time / 60)} minute${Math.round(lfm.adventure_active_time / 60) === 1 ? "" : "s"}`
            let adventureActiveText = ""
            let adventureActiveTextBounds = getTextWidthAndHeight(
                adventureActiveTextOptions(false),
                fonts.COMMENT,
                context
            )
            if (
                adventureActiveTextBounds.width >
                mainPanelBoundingBox.width - 8
            ) {
                adventureActiveText = adventureActiveTextOptions(true)
                adventureActiveTextBounds = getTextWidthAndHeight(
                    adventureActiveTextOptions(true),
                    fonts.COMMENT,
                    context
                )
            } else {
                adventureActiveText = adventureActiveTextOptions(false)
            }
            const { boundingBox: adventureActiveBoundingBox } =
                confineTextToBoundingBox({
                    text: showAdventureActiveTime ? adventureActiveText : "",
                    boundingBox: mainPanelBoundingBox,
                    font: fonts.COMMENT,
                    centered: true,
                })
            adventureActiveBoundingBox.y =
                mainPanelBoundingBox.bottom() -
                adventureActiveBoundingBox.height -
                4
            // lfm.comment =
            //     "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc ultricies aliquam. Nullam nec purus nec nunc ultricies aliquam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc ultricies aliquam. Nullam nec purus nec nunc ultricies aliquam. END"
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
                        leaderClassIconBoundingBox.height -
                        8 -
                        (mainPanelBoundingBox.bottom() -
                            adventureActiveBoundingBox.top() +
                            2)
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
                maxLines: lfm.quest?.tip ? 1 : 2,
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
            const questInfoGap = 5
            let totalQuestInfoHeight =
                questNameBoundingBox.height +
                questTipBoundingBox.height +
                questDifficultyBoundingBox.height +
                questInfoGap
            if (lfm.quest?.tip) {
                totalQuestInfoHeight += questInfoGap
            }
            const topPadding = Math.max(
                0,
                (questPanelBoundingBox.height - totalQuestInfoHeight) / 2
            )
            questNameBoundingBox.y = topPadding
            questDifficultyBoundingBox.y =
                questPanelBoundingBox.bottom() -
                topPadding -
                questDifficultyBoundingBox.height
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
                leaderNameTextLines[0] || "Anonymous",
                leaderNameBoundingBox.x,
                leaderNameBoundingBox.y + leaderNameBoundingBox.height / 2
            )
            // member count
            if (showMemberCount) {
                context.textAlign = "center"
                context.fillStyle = GROUPING_COLORS.SECONDARY_TEXT
                context.font = fonts.MEMBER_COUNT
                context.fillText(
                    memberCountTextLines[0],
                    memberCountBoundingBox.centerX(),
                    memberCountBoundingBox.centerY()
                )
            }
            // comment
            context.fillStyle = GROUPING_COLORS.COMMENT_TEXT
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
            if (showAdventureActiveTime) {
                context.fillStyle = GROUPING_COLORS.ADVENTURE_ACTIVE
                context.font = fonts.COMMENT
                context.textBaseline = "middle"
                context.textAlign = "center"
                context.fillText(
                    adventureActiveText,
                    adventureActiveBoundingBox.x +
                        adventureActiveBoundingBox.width / 2,
                    adventureActiveBoundingBox.y +
                        adventureActiveBoundingBox.height / 2
                )
            }

            // ===== QUEST PANEL =====
            if (lfm.quest) {
                // quest name
                context.fillStyle = lfm.is_quest_guess
                    ? GROUPING_COLORS.GUESS_TEXT
                    : GROUPING_COLORS.STANDARD_TEXT
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
                if (lfm.quest.tip) {
                    context.fillStyle = lfm.is_quest_guess
                        ? GROUPING_COLORS.GUESS_TEXT
                        : GROUPING_COLORS.STANDARD_TEXT
                    context.font = fonts.TIP
                    context.textBaseline = "middle"
                    context.textAlign = "center"
                    questTipTextLines.forEach((line) => {
                        context.fillText(
                            line,
                            questTipBoundingBox.centerX(),
                            questTipBoundingBox.centerY()
                        )
                    })
                }
                // quest difficulty
                context.fillStyle = lfm.is_quest_guess
                    ? GROUPING_COLORS.GUESS_TEXT
                    : GROUPING_COLORS.SECONDARY_TEXT
                context.font = fonts.COMMENT
                context.textBaseline = "middle"
                context.textAlign = "center"
                context.fillText(
                    questDifficultyTextLines[0] || "",
                    questDifficultyBoundingBox.centerX(),
                    questDifficultyBoundingBox.centerY()
                )
            }

            // ===== CLASS PANEL =====
            if (
                lfm.accepted_classes_count === CLASS_LIST.length ||
                lfm.accepted_classes === null
            ) {
                context.drawImage(
                    lfmSprite,
                    GROUPING_SPRITE_MAP.CLASSES.ALL.x,
                    GROUPING_SPRITE_MAP.CLASSES.ALL.y,
                    GROUPING_SPRITE_MAP.CLASSES.ALL.width,
                    GROUPING_SPRITE_MAP.CLASSES.ALL.height,
                    classesBoundingBox.x,
                    classesBoundingBox.y,
                    GROUPING_SPRITE_MAP.CLASSES.ALL.width,
                    GROUPING_SPRITE_MAP.CLASSES.ALL.height
                )
            }

            // ===== LEVEL PANEL =====
            context.fillStyle = GROUPING_COLORS.STANDARD_TEXT
            context.font = fonts.LEVEL_RANGE
            context.textBaseline = "middle"
            context.textAlign = "center"
            context.fillText(
                levelRangeTextLines[0],
                levelRangeBoundingBox.centerX(),
                levelRangeBoundingBox.centerY()
            )

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
                    adventureActiveBoundingBox.x,
                    adventureActiveBoundingBox.y,
                    adventureActiveBoundingBox.width,
                    adventureActiveBoundingBox.height
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
        },
        [
            lfmSprite,
            context,
            panelWidth,
            showBoundingBoxes,
            commonBoundingBoxes,
            fontSize,
            confineTextToBoundingBox,
        ]
    )

    return { renderLfmToCanvas }
}

export default useRenderLfms
