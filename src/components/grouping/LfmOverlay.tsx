import React, { useLayoutEffect, useMemo, useRef, useState } from "react"
import { FlatActivityEvent, Lfm, LfmActivityType } from "../../models/Lfm.ts"
import { useLfmContext } from "../../contexts/LfmContext.tsx"
import {
    MAXIMUM_ACTIVITY_EVENTS,
    OVERLAY_COLORS,
    OVERLAY_SIDE_BAR_WIDTH,
    OVERLAY_WIDTH,
    OVERLAY_MAX_WIDTH,
    OVERLAY_CHARACTER_WIDTH,
} from "../../constants/lfmPanel.ts"
import { getLfmActivityEventsFlatMap } from "../../utils/lfmUtils.ts"
import { CLASS_LIST_LOWER, RAID_TIMER_MILLIS } from "../../constants/game.ts"
import {
    convertMillisecondsToPrettyString,
    pluralize,
} from "../../utils/stringUtils.ts"
import { CHARACTER_IDS } from "../../constants/characterIds.ts"
import { SPRITE_MAP } from "../../constants/spriteMap.ts"
import {
    mapClassToIconBoundingBox,
    mapRaceAndGenderToRaceIconBoundingBox,
} from "../../utils/socialUtils.ts"
import { useAreaContext } from "../../contexts/AreaContext.tsx"
import { useQuestContext } from "../../contexts/QuestContext.tsx"
import useGetFriends from "../../hooks/useGetFriends.ts"
import { getMetricOverlayDisplayData } from "../../utils/questUtils.ts"
import LfmSpriteUrl from "../../assets/png/lfm_sprite_6.webp"
import { Character } from "../../models/Character.ts"

export enum RenderType {
    LFM,
    QUEST,
}

interface Props {
    lfm: Lfm
    renderType: RenderType
    position: { x: number; y: number }
    containerWidth: number
    containerHeight: number
    scaleFactor: number
}

// Styles matching the canvas overlay appearance
const baseFont = "'Trebuchet MS', sans-serif"

const SpriteIcon: React.FC<{
    sprite: { x: number; y: number; width: number; height: number }
    style?: React.CSSProperties
}> = ({ sprite, style }) => (
    <div
        style={{
            width: sprite.width,
            height: sprite.height,
            backgroundImage: `url(${LfmSpriteUrl})`,
            backgroundPosition: `-${sprite.x}px -${sprite.y}px`,
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
            flexShrink: 0,
            ...style,
        }}
    />
)

const OverlaySection: React.FC<{
    width: number
    maxWidth?: number
    children: React.ReactNode
}> = ({ width, maxWidth, children }) => (
    <div
        style={{
            position: "relative",
            minWidth: width,
            maxWidth: maxWidth ?? width + (OVERLAY_MAX_WIDTH - OVERLAY_WIDTH),
            border: `1px solid ${OVERLAY_COLORS.OUTER_BORDER}`,
            overflow: "hidden",
        }}
    >
        {/* Side bar */}
        <div
            style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: OVERLAY_SIDE_BAR_WIDTH + 2,
                background: OVERLAY_COLORS.SIDE_BAR,
                zIndex: 1,
            }}
        />
        {/* Inner border */}
        <div
            style={{
                position: "absolute",
                left: 1,
                top: 1,
                right: OVERLAY_SIDE_BAR_WIDTH + 2,
                bottom: 1,
                border: `1px solid ${OVERLAY_COLORS.INNER_BORDER}`,
                pointerEvents: "none",
            }}
        />
        {/* Content with semi-transparent background */}
        <div
            style={{
                background: `${OVERLAY_COLORS.BLACK_BACKGROUND}cc`,
                position: "relative",
                paddingRight: OVERLAY_SIDE_BAR_WIDTH + 2,
            }}
        >
            {children}
        </div>
    </div>
)

const CharacterRow: React.FC<{
    character: Character
    isFriend: boolean
    showGuildName: boolean
    questArea?: string
    isLeader?: boolean
    width?: number
}> = ({
    character,
    isFriend,
    showGuildName,
    questArea,
    width = OVERLAY_CHARACTER_WIDTH,
}) => {
    const raceIcon = mapRaceAndGenderToRaceIconBoundingBox(
        character.race || "Human",
        character.gender || "Male"
    )
    const isCrown = CHARACTER_IDS.includes(character.id)
    const area = useAreaContext().areas[character.location_id || 0]
    const isInQuestArea = questArea && area?.name === questArea

    const height = showGuildName ? 58 : 41

    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-start",
                width: width,
                height,
                padding: "0 0 2px 0",
                background: isFriend
                    ? `linear-gradient(to bottom, ${OVERLAY_COLORS.FRIEND_GRADIENT_EDGE}, ${OVERLAY_COLORS.FRIEND_GRADIENT_CENTER} 25%, ${OVERLAY_COLORS.FRIEND_GRADIENT_CENTER} 75%, ${OVERLAY_COLORS.FRIEND_GRADIENT_EDGE})`
                    : `linear-gradient(to bottom, ${OVERLAY_COLORS.CHARACTER_GRADIENT_EDGE}, ${OVERLAY_COLORS.CHARACTER_GRADIENT_CENTER} 25%, ${OVERLAY_COLORS.CHARACTER_GRADIENT_CENTER} 75%, ${OVERLAY_COLORS.CHARACTER_GRADIENT_EDGE})`,
                position: "relative",
            }}
        >
            {/* Race icon */}
            <SpriteIcon
                sprite={raceIcon}
                style={{ marginTop: -1, position: "relative", zIndex: 1 }}
            />

            {/* Character info */}
            <div
                style={{
                    flex: 1,
                    marginLeft: 4,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                }}
            >
                {/* Name row */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span
                        style={{
                            color: OVERLAY_COLORS.MEMBER_NAME,
                            fontFamily: baseFont,
                            fontSize: 16,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {character.name || "Anonymous"}
                    </span>
                    {isCrown && <SpriteIcon sprite={SPRITE_MAP.CROWN} />}
                </div>

                {/* Guild name */}
                {showGuildName && (
                    <span
                        style={{
                            color: OVERLAY_COLORS.MEMBER_NAME,
                            fontFamily: baseFont,
                            fontSize: 14,
                            fontStyle: "italic",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {character.guild_name || "No Guild"}
                    </span>
                )}

                {/* Location */}
                <span
                    style={{
                        color: OVERLAY_COLORS.MEMBER_LOCATION,
                        fontFamily: baseFont,
                        fontSize: 13,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {isInQuestArea ? "✓ " : ""}
                    {area?.name || "Somewhere in the aether"}
                </span>
            </div>

            {/* Classes */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    position: "absolute",
                    top: 1,
                    left: 165,
                }}
            >
                {character.classes
                    ?.filter((c) =>
                        CLASS_LIST_LOWER.includes(c.name.toLowerCase())
                    )
                    .sort((a, b) => b.level - a.level)
                    .map((classData, idx) => {
                        const icon = mapClassToIconBoundingBox(classData.name)
                        return (
                            <div
                                key={idx}
                                style={{ position: "relative", marginRight: 1 }}
                            >
                                <SpriteIcon sprite={icon} />
                                <span
                                    style={{
                                        position: "absolute",
                                        bottom: 0,
                                        right: 0,
                                        color: OVERLAY_COLORS.MEMBER_CLASS_LEVEL,
                                        fontFamily: baseFont,
                                        fontSize: 14,
                                        textShadow:
                                            "0 0 1px black, 0 0 1px black",
                                        lineHeight: 1,
                                    }}
                                >
                                    {classData.level}
                                </span>
                            </div>
                        )
                    })}
            </div>

            {/* Total level */}
            <span
                style={{
                    position: "absolute",
                    top: 2,
                    right: 10,
                    color: OVERLAY_COLORS.MEMBER_TOTAL_LEVEL,
                    fontFamily: baseFont,
                    fontSize: 16,
                }}
            >
                {character.total_level?.toString() || "???"}
            </span>
        </div>
    )
}

const MemoizedCharacterRow = React.memo(CharacterRow)

const lengthToLengthString = (lengthInSeconds: number) => {
    if (lengthInSeconds <= 0) return "Unknown"
    return convertMillisecondsToPrettyString({
        millis: lengthInSeconds * 1000,
        commaSeparated: true,
        useFullWords: true,
        onlyIncludeLargest: true,
    })
}

const LfmOverlay: React.FC<Props> = ({
    lfm,
    renderType,
    position,
    containerWidth,
    containerHeight,
    scaleFactor,
}) => {
    const {
        showLfmActivity,
        showCharacterGuildNames,
        showEligibleCharacters,
        isMultiColumn,
        showQuestMetrics,
    } = useLfmContext()
    const areaContext = useAreaContext()
    const { quests } = useQuestContext()
    const { friends } = useGetFriends()

    const quest = lfm.quest
    const raidActivities = lfm.metadata?.raidActivity || []

    const willWrap =
        renderType === RenderType.LFM && isMultiColumn && lfm.members.length > 5

    const totalOverlayWidth = willWrap
        ? OVERLAY_CHARACTER_WIDTH * 2 + 18
        : OVERLAY_WIDTH

    const overlayMaxWidth = willWrap ? totalOverlayWidth : OVERLAY_MAX_WIDTH

    // Activity events processing
    const activityEvents = useMemo(() => {
        const raw = getLfmActivityEventsFlatMap(lfm).filter(
            (event) => event.tag !== LfmActivityType.COMMENT
        )
        const truncated: FlatActivityEvent[] = []
        if (raw.length > MAXIMUM_ACTIVITY_EVENTS) {
            truncated.push(raw[0])
            truncated.push({
                tag: LfmActivityType.SPACER,
                data: "",
                timestamp: "",
            })
            truncated.push(...raw.slice(-(MAXIMUM_ACTIVITY_EVENTS - 1)))
        } else {
            truncated.push(...raw)
        }
        return truncated
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
    }, [lfm])

    const metricData = useMemo(
        () => getMetricOverlayDisplayData(lfm, quest),
        [lfm, quest]
    )

    // Position clamping (in CSS pixels)
    const overlayRef = useRef<HTMLDivElement>(null)
    const [clampedPos, setClampedPos] = useState<{
        x: number | null
        y: number | null
    }>({ x: null, y: null })

    const rawPosX = Math.max(0, position.x * scaleFactor)
    const rawPosY = Math.max(0, position.y * scaleFactor)

    // No dependency array: we read DOM measurements (offsetWidth/offsetHeight)
    // that can change when overlay content changes, which isn't trackable as deps.
    // The setClampedPos bailout prevents unnecessary re-renders.
    useLayoutEffect(() => {
        if (!overlayRef.current) return
        const overlayWidth = overlayRef.current.offsetWidth
        const overlayHeight = overlayRef.current.offsetHeight

        const newClampedX =
            rawPosX + overlayWidth > containerWidth
                ? Math.max(0, containerWidth - overlayWidth)
                : null
        const newClampedY =
            rawPosY + overlayHeight > containerHeight
                ? Math.max(0, containerHeight - overlayHeight)
                : null

        setClampedPos((prev) => {
            if (prev.x === newClampedX && prev.y === newClampedY) return prev
            return { x: newClampedX, y: newClampedY }
        })
    })

    const posX = clampedPos.x ?? rawPosX
    const posY = clampedPos.y ?? rawPosY

    return (
        <div
            ref={overlayRef}
            style={{
                position: "absolute",
                left: posX,
                top: posY,
                zIndex: 10,
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                gap: 10,
            }}
        >
            {renderType === RenderType.LFM
                ? renderLfmContent()
                : renderQuestContent()}
        </div>
    )

    function renderLfmContent() {
        const characters = [lfm.leader, ...lfm.members]
        const maxColumnCount = Math.ceil(characters.length / 2)

        return (
            <>
                <OverlaySection
                    width={totalOverlayWidth}
                    maxWidth={totalOverlayWidth}
                >
                    <div
                        style={{
                            padding: "3px 4px",
                            display: "flex",
                            flexDirection: willWrap ? "row" : "column",
                            flexWrap: willWrap ? "wrap" : "nowrap",
                            gap: 2,
                            maxHeight: willWrap
                                ? (showCharacterGuildNames ? 60 : 43) *
                                      maxColumnCount +
                                  10
                                : undefined,
                        }}
                    >
                        {characters.map((member, index) => {
                            const isFriend = friends.some(
                                (f) => f.id === member.id
                            )
                            return (
                                <MemoizedCharacterRow
                                    key={`${member.id}-${index}`}
                                    character={member}
                                    isFriend={isFriend}
                                    showGuildName={showCharacterGuildNames}
                                    questArea={quest?.adventure_area}
                                />
                            )
                        })}
                    </div>
                    {/* Comment */}
                    {lfm.comment && (
                        <div
                            style={{
                                padding: "4px 8px 6px",
                                color: OVERLAY_COLORS.COMMENT,
                                fontFamily: baseFont,
                                fontSize: 14,
                                wordBreak: "break-word",
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: "vertical",
                                display: "-webkit-box",
                                overflow: "hidden",
                            }}
                        >
                            {lfm.comment}
                        </div>
                    )}
                </OverlaySection>

                {/* Activity History */}
                {showLfmActivity && activityEvents.length > 0 && (
                    <OverlaySection
                        width={totalOverlayWidth}
                        maxWidth={overlayMaxWidth}
                    >
                        <div style={{ padding: "4px 8px" }}>
                            <div
                                style={{
                                    color: "white",
                                    fontFamily: baseFont,
                                    fontSize: 14,
                                    marginBottom: 8,
                                }}
                            >
                                Activity History
                            </div>
                            <div
                                style={{
                                    paddingLeft: 50,
                                    position: "relative",
                                }}
                            >
                                {activityEvents.map((event, idx) =>
                                    renderActivityEvent(event, idx)
                                )}
                            </div>
                        </div>
                    </OverlaySection>
                )}

                {/* Eligible Characters */}
                {showEligibleCharacters &&
                    lfm.metadata?.eligibleCharacters?.length > 0 &&
                    renderEligibleCharacters()}
            </>
        )
    }

    function renderActivityEvent(event: FlatActivityEvent, idx: number) {
        let color: string
        let text: string
        switch (event.tag) {
            case LfmActivityType.POSTED:
                color = OVERLAY_COLORS.ACTIVITY_POSTED
                text = "Posted"
                break
            case LfmActivityType.MEMBER_JOINED:
                color = OVERLAY_COLORS.ACTIVITY_MEMBER_JOINED
                text = `${event.data || "Anonymous"} joined`
                break
            case LfmActivityType.MEMBER_LEFT:
                color = OVERLAY_COLORS.ACTIVITY_MEMBER_LEFT
                text = `${event.data || "Anonymous"} left`
                break
            case LfmActivityType.QUEST: {
                color = OVERLAY_COLORS.ACTIVITY_QUEST
                const eq = quests[event.data || 0]
                text =
                    event.data === "0"
                        ? "No quest"
                        : eq?.name || "Unknown quest"
                break
            }
            case LfmActivityType.COMMENT:
                color = OVERLAY_COLORS.ACTIVITY_COMMENT
                text = event.data || "No comment"
                break
            default:
                color = OVERLAY_COLORS.ACTIVITY_COMMENT
                text = ""
                break
        }

        const isSpacer = event.tag === LfmActivityType.SPACER
        let elapsedString = ""
        if (!isSpacer && event.timestamp) {
            const elapsed = Math.floor(
                (Date.now() - new Date(event.timestamp).getTime()) / 60000
            )
            elapsedString =
                elapsed === 0
                    ? "Now"
                    : elapsed < 60
                      ? `${elapsed}m`
                      : `${Math.floor(elapsed / 60)}h+`
        }

        return (
            <div
                key={idx}
                style={{
                    display: "flex",
                    alignItems: "center",
                    height: 20,
                    position: "relative",
                }}
            >
                {/* Timeline line */}
                <div
                    style={{
                        position: "absolute",
                        left: -10,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        borderLeft: isSpacer
                            ? "1px dashed white"
                            : "1px solid white",
                    }}
                />
                {/* Dot + elapsed time */}
                {!isSpacer && (
                    <>
                        <div
                            style={{
                                position: "absolute",
                                left: -15,
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: OVERLAY_COLORS.ACTIVITY_COMMENT,
                            }}
                        />
                        <span
                            style={{
                                position: "absolute",
                                right: "100%",
                                marginRight: 20,
                                color: OVERLAY_COLORS.ACTIVITY_COMMENT,
                                fontFamily: baseFont,
                                fontSize: 14,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {elapsedString}
                        </span>
                    </>
                )}
                {/* Event text */}
                <span
                    style={{
                        color,
                        fontFamily: baseFont,
                        fontSize: 14,
                        wordBreak: "break-word",
                    }}
                >
                    {text}
                </span>
            </div>
        )
    }

    function renderEligibleCharacters() {
        const maxDisplay = 5
        const chars = [...(lfm.metadata?.eligibleCharacters || [])]
            .sort((a, b) => a.id - b.id)
            .sort((a, b) => {
                const aOnTimer = raidActivities?.some(
                    (e) => e.character?.id === a.id
                )
                const bOnTimer = raidActivities?.some(
                    (e) => e.character?.id === b.id
                )
                if (aOnTimer && !bOnTimer) return -1
                if (bOnTimer && !aOnTimer) return 1
                return 0
            })
        const displayed = chars.slice(0, maxDisplay)
        const hiddenCount = chars.length - maxDisplay

        return (
            <OverlaySection
                width={totalOverlayWidth}
                maxWidth={overlayMaxWidth}
            >
                <div style={{ padding: "4px 8px" }}>
                    <div
                        style={{
                            color: "white",
                            fontFamily: baseFont,
                            fontSize: 14,
                            marginBottom: 8,
                        }}
                    >
                        Eligible Characters
                    </div>
                    {displayed.map((character) => {
                        const hasActiveTimer = raidActivities.some(
                            (e) => e.character?.id === character.id
                        )
                        const raceIcon = mapRaceAndGenderToRaceIconBoundingBox(
                            character.race || "Human",
                            character.gender || "Male"
                        )
                        const mostRecentTimer = hasActiveTimer
                            ? raidActivities
                                  .filter(
                                      (a) => a.character?.id === character.id
                                  )
                                  .sort(
                                      (a, b) =>
                                          new Date(b.timestamp).getTime() -
                                          new Date(a.timestamp).getTime()
                                  )[0]
                            : null
                        const remainingTime = mostRecentTimer
                            ? RAID_TIMER_MILLIS -
                              (Date.now() -
                                  new Date(mostRecentTimer.timestamp).getTime())
                            : 0

                        return (
                            <div key={character.id}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        height: 20,
                                        position: "relative",
                                        background: hasActiveTimer
                                            ? "linear-gradient(to right, rgba(255,0,0,0.2) 0%, rgba(255,0,0,0.2) 95%, transparent)"
                                            : undefined,
                                        padding: "0 4px",
                                    }}
                                >
                                    <SpriteIcon
                                        sprite={raceIcon}
                                        style={{
                                            transform: `scale(${raceIcon.height > 20 ? 20 / raceIcon.height : 1})`,
                                            transformOrigin: "left center",
                                        }}
                                    />
                                    <span
                                        style={{
                                            color: OVERLAY_COLORS.ACTIVITY_COMMENT,
                                            fontFamily: baseFont,
                                            fontSize: 14,
                                            marginLeft: 6,
                                            flex: 1,
                                        }}
                                    >
                                        {character.name || "Anonymous"}
                                    </span>
                                    {/* Class icons */}
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 1,
                                        }}
                                    >
                                        {character.classes
                                            ?.filter((c) =>
                                                CLASS_LIST_LOWER.includes(
                                                    c.name.toLowerCase()
                                                )
                                            )
                                            .sort((a, b) => b.level - a.level)
                                            .map((classData, idx) => {
                                                const icon =
                                                    mapClassToIconBoundingBox(
                                                        classData.name
                                                    )
                                                return (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            position:
                                                                "relative",
                                                        }}
                                                    >
                                                        <SpriteIcon
                                                            sprite={icon}
                                                        />
                                                        <span
                                                            style={{
                                                                position:
                                                                    "absolute",
                                                                bottom: 0,
                                                                right: 0,
                                                                color: OVERLAY_COLORS.MEMBER_CLASS_LEVEL,
                                                                fontFamily:
                                                                    baseFont,
                                                                fontSize: 14,
                                                                textShadow:
                                                                    "0 0 1px black",
                                                                lineHeight: 1,
                                                            }}
                                                        >
                                                            {classData.level}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                    <span
                                        style={{
                                            color: OVERLAY_COLORS.MEMBER_TOTAL_LEVEL,
                                            fontFamily: baseFont,
                                            fontSize: 16,
                                            marginLeft: 8,
                                            minWidth: 30,
                                            textAlign: "right",
                                        }}
                                    >
                                        {character.total_level?.toString() ||
                                            "???"}
                                    </span>
                                </div>
                                {hasActiveTimer && remainingTime > 0 && (
                                    <div
                                        style={{
                                            paddingLeft: raceIcon.width + 10,
                                            height: 20,
                                            color: OVERLAY_COLORS.ACTIVITY_COMMENT,
                                            fontFamily: baseFont,
                                            fontSize: 14,
                                        }}
                                    >
                                        Raid timer:{" "}
                                        {convertMillisecondsToPrettyString({
                                            millis: remainingTime,
                                            commaSeparated: true,
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    {hiddenCount > 0 && (
                        <div
                            style={{
                                color: OVERLAY_COLORS.SECONDARY_TEXT,
                                fontFamily: baseFont,
                                fontSize: 14,
                                textAlign: "center",
                                padding: "4px 0",
                            }}
                        >
                            +{hiddenCount} more eligible{" "}
                            {pluralize("character", hiddenCount)}...
                        </div>
                    )}
                </div>
            </OverlaySection>
        )
    }

    function renderQuestContent() {
        if (!quest) return null

        const isUnknown = quest.metadata?.isUnknown
        const isWilderness =
            quest.area_id != null &&
            areaContext.areas[quest.area_id]?.is_wilderness

        return (
            <OverlaySection
                width={totalOverlayWidth}
                maxWidth={overlayMaxWidth}
            >
                <div style={{ padding: "8px 12px" }}>
                    {isUnknown ? (
                        <>
                            <QuestInfoRow label="Quest:" value={quest.name} />
                            <QuestInfoRow
                                label="Quest ID:"
                                value={lfm.quest_id?.toString() || "N/A"}
                            />
                        </>
                    ) : (
                        <>
                            {quest.name && (
                                <QuestInfoRow
                                    label="Quest:"
                                    value={quest.name}
                                />
                            )}
                            {quest.adventure_area && (
                                <QuestInfoRow
                                    label="Area:"
                                    value={quest.adventure_area}
                                />
                            )}
                            {quest.quest_journal_group && (
                                <QuestInfoRow
                                    label="Nearest hub:"
                                    value={quest.quest_journal_group}
                                />
                            )}
                            {quest.required_adventure_pack && (
                                <QuestInfoRow
                                    label="Pack:"
                                    value={quest.required_adventure_pack}
                                />
                            )}
                            {quest.patron && (
                                <QuestInfoRow
                                    label="Patron:"
                                    value={quest.patron}
                                />
                            )}
                            {quest.average_time != null && (
                                <QuestInfoRow
                                    label="Average time:"
                                    value={convertMillisecondsToPrettyString({
                                        millis: quest.average_time * 1000,
                                        commaSeparated: true,
                                    })}
                                />
                            )}
                            {quest.group_size && (
                                <QuestInfoRow
                                    label="Group size:"
                                    value={quest.group_size}
                                />
                            )}
                            {quest.heroic_normal_cr != null && (
                                <QuestInfoRow
                                    label="Heroic level:"
                                    value={quest.heroic_normal_cr.toString()}
                                />
                            )}
                            {quest.epic_normal_cr != null && (
                                <QuestInfoRow
                                    label="Epic level:"
                                    value={quest.epic_normal_cr.toString()}
                                />
                            )}
                            {lfm.difficulty && (
                                <QuestInfoRow
                                    label="Difficulty:"
                                    value={lfm.difficulty}
                                />
                            )}
                            {showQuestMetrics && !isWilderness && (
                                <>
                                    {quest.length != null &&
                                        quest.length > 0 && (
                                            <QuestInfoRow
                                                label="Length:"
                                                value={lengthToLengthString(
                                                    quest.length
                                                )}
                                                style={{ marginTop: 8 }}
                                            />
                                        )}
                                    {metricData.xpPerMinuteRelativeString !=
                                        null && (
                                        <QuestInfoRow
                                            label="XP/Min:"
                                            value={
                                                metricData.xpPerMinuteRelativeString
                                            }
                                            valueColor={
                                                metricData.xpPerMinuteColor
                                            }
                                        />
                                    )}
                                    {metricData.popularityRelativeString !=
                                        null && (
                                        <QuestInfoRow
                                            label="Popularity:"
                                            value={
                                                metricData.popularityRelativeString
                                            }
                                            valueColor={
                                                metricData.popularityColor
                                            }
                                        />
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* Raid timers */}
                    {raidActivities.length > 0 && (
                        <div style={{ marginTop: 12, textAlign: "center" }}>
                            <div
                                style={{
                                    color: OVERLAY_COLORS.QUEST_INFO,
                                    fontFamily: baseFont,
                                    fontSize: 16,
                                    fontWeight: "bold",
                                    marginBottom: 4,
                                }}
                            >
                                Raid Timers:
                            </div>
                            {raidActivities.map((activityEvent, idx) => {
                                if (!activityEvent.character) return null
                                const elapsed =
                                    Date.now() -
                                    new Date(activityEvent.timestamp).getTime()
                                const remaining = RAID_TIMER_MILLIS - elapsed
                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            color: OVERLAY_COLORS.QUEST_INFO,
                                            fontFamily: baseFont,
                                            fontSize: 16,
                                            marginBottom: 2,
                                        }}
                                    >
                                        {activityEvent.character.name}:{" "}
                                        {convertMillisecondsToPrettyString({
                                            millis: remaining,
                                            commaSeparated: true,
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Double-click hint */}
                    <div
                        style={{
                            color: "white",
                            fontFamily: baseFont,
                            fontSize: 14,
                            fontStyle: "italic",
                            textAlign: "center",
                            marginTop: 8,
                        }}
                    >
                        Double-click to open Wiki
                    </div>
                </div>
            </OverlaySection>
        )
    }
}

const QuestInfoRow: React.FC<{
    label: string
    value: string
    valueColor?: string
    style?: React.CSSProperties
}> = ({ label, value, valueColor = OVERLAY_COLORS.QUEST_INFO, style }) => (
    <div
        style={{
            display: "flex",
            gap: 5,
            minHeight: 20,
            alignItems: "baseline",
            ...style,
        }}
    >
        <span
            style={{
                color: OVERLAY_COLORS.QUEST_INFO,
                fontFamily: baseFont,
                fontSize: 16,
                fontWeight: "bold",
                whiteSpace: "nowrap",
                minWidth: 110,
                textAlign: "right",
            }}
        >
            {label}
        </span>
        <span
            style={{
                color: valueColor,
                fontFamily: baseFont,
                fontSize: 16,
                wordBreak: "break-word",
            }}
        >
            {value}
        </span>
    </div>
)

export default LfmOverlay
