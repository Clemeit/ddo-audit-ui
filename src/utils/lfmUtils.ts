import { FlatActivityEvent, Lfm, LfmActivityType } from "../models/Lfm"
import {
    LFM_HEIGHT,
    LFM_AREA_PADDING,
    SKULL_EXPRESSION,
    REAPER_EXPRESSION,
    ELITE_EXPRESSION,
    HARD_EXPRESSION,
} from "../constants/lfmPanel.ts"
import { BoundingBox } from "../models/Geometry.ts"
import { SPRITE_MAP } from "../constants/spriteMap.ts"
import { MAX_SKULL_COUNT } from "../constants/game.ts"

const calculateCommonBoundingBoxes = (panelWidth: number) => {
    const lfmBoundingBox = new BoundingBox(
        0,
        0,
        panelWidth -
            SPRITE_MAP.CONTENT_LEFT.width -
            SPRITE_MAP.CONTENT_RIGHT.width -
            LFM_AREA_PADDING.left -
            LFM_AREA_PADDING.right,
        LFM_HEIGHT
    )
    const mainPanelBoundingBox = new BoundingBox(
        lfmBoundingBox.x,
        lfmBoundingBox.y,
        lfmBoundingBox.width * 0.42,
        lfmBoundingBox.height
    )
    const questPanelBoundingBox = new BoundingBox(
        mainPanelBoundingBox.x + mainPanelBoundingBox.width,
        lfmBoundingBox.y,
        lfmBoundingBox.width * 0.32,
        lfmBoundingBox.height
    )
    const classPanelBoundingBox = new BoundingBox(
        questPanelBoundingBox.x + questPanelBoundingBox.width,
        lfmBoundingBox.y,
        lfmBoundingBox.width * 0.16,
        lfmBoundingBox.height
    )
    const levelPanelBoundingBox = new BoundingBox(
        classPanelBoundingBox.x + classPanelBoundingBox.width,
        lfmBoundingBox.y,
        lfmBoundingBox.width * 0.1,
        lfmBoundingBox.height
    )
    const leaderRaceIconBoundingBox = new BoundingBox(
        mainPanelBoundingBox.x + 2,
        mainPanelBoundingBox.y + 2,
        18,
        18
    )
    const classesBoundingBox = new BoundingBox(
        classPanelBoundingBox.x + 4,
        classPanelBoundingBox.y + 4,
        SPRITE_MAP.CLASSES.ALL.width,
        SPRITE_MAP.CLASSES.ALL.height
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
        leaderRaceIconBoundingBox,
        classesBoundingBox,
        questPanelBoundingBoxWithPadding,
        levelPanelBoundingBoxWithPadding,
    }
}

function shouldLfmRerender(previous: Lfm, current: Lfm): boolean {
    if (previous == null || current == null) return true
    if (previous.comment !== current.comment) return true
    if (
        Math.round(previous.adventure_active_time / 60) !==
        Math.round(current.adventure_active_time / 60)
    )
        return true
    if (previous.members.length !== current.members.length) return true
    if (previous.quest_id !== current.quest_id) return true
    if (previous.difficulty !== current.difficulty) return true
    if (previous.minimum_level !== current.minimum_level) return true
    if (previous.maximum_level !== current.maximum_level) return true
    if (previous.leader.name !== current.leader.name) return true
    if (previous.metadata?.isEligible !== current.metadata?.isEligible)
        return true
    if (
        previous.metadata?.raidActivity?.length !==
        current.metadata?.raidActivity?.length
    )
        return true

    return false
}

function getLfmPostedTimestamp(lfm: Lfm): Date {
    if (!lfm.activity) return new Date()
    const lfmPostedEvent = getLfmActivityEventsFlatMap(lfm).find(
        (event) => event.tag === "posted"
    )
    if (!lfmPostedEvent) return new Date()
    return new Date(lfmPostedEvent.timestamp)
}

function getLfmActivityEventsFlatMap(lfm: Lfm): FlatActivityEvent[] {
    if (!lfm.activity) return []
    return lfm.activity.flatMap((activity) =>
        activity.events.map((event) => ({
            tag: event.tag as LfmActivityType,
            data: event.data,
            timestamp: activity.timestamp,
        }))
    )
}

function areLfmsEquivalent(previous: Lfm, current: Lfm): boolean {
    if (previous !== undefined && current === undefined) return false
    if (previous === undefined && current !== undefined) return false
    if (previous.comment !== current.comment) return false
    if (
        Math.round(previous.adventure_active_time / 60) !==
        Math.round(current.adventure_active_time / 60)
    )
        return false
    if (previous.members.length !== current.members.length) return false
    if (previous.quest_id !== current.quest_id) return false
    if (previous.difficulty !== current.difficulty) return false
    if (previous.minimum_level !== current.minimum_level) return false
    if (previous.maximum_level !== current.maximum_level) return false
    if (previous.leader.name !== current.leader.name) return false
    if (previous.metadata?.isEligible !== current.metadata?.isEligible)
        return false

    // Deep comparison for raidActivity array
    const prevRaidActivity = previous.metadata?.raidActivity || []
    const currRaidActivity = current.metadata?.raidActivity || []
    if (prevRaidActivity.length !== currRaidActivity.length) return false
    for (let i = 0; i < prevRaidActivity.length; i++) {
        if (
            JSON.stringify(prevRaidActivity[i]) !==
            JSON.stringify(currRaidActivity[i])
        ) {
            return false
        }
    }

    if (previous.accepted_classes_count !== current.accepted_classes_count)
        return false

    return true
}

function areLfmOverlaysEquivalent(previous: Lfm, current: Lfm): boolean {
    // specifically for check if the overlay should be rerendered
    if (previous === undefined && current === undefined) return true
    if (previous === undefined || current === undefined) return false
    if (previous.quest_id !== current.quest_id) return false
    if (previous.difficulty !== current.difficulty) return false
    if (previous.members.length !== current.members.length) return false
    // check members
    const allPreviousMembers = [previous.leader, ...previous.members]
    const allCurrentMembers = [current.leader, ...current.members]
    for (let i = 0; i < allPreviousMembers.length; i++) {
        const member = allPreviousMembers[i]
        const currentMember = allCurrentMembers[i]
        if (!currentMember || member.location_id !== currentMember.location_id)
            return false
        if (member.total_level !== currentMember.total_level) return false
    }
    // check history
    if (previous.activity?.length !== current.activity?.length) return false
    if (
        previous.metadata?.eligibleCharacters?.length !==
        current.metadata?.eligibleCharacters?.length
    )
        return false
    if (
        previous.metadata?.raidActivity.length !==
        current.metadata?.raidActivity.length
    )
        return false

    return true
}

function areLfmArraysEqual(
    previous: Lfm[],
    current: Lfm[],
    compareFunction: (previous: Lfm, current: Lfm) => boolean
): boolean {
    if (previous.length !== current.length) return false
    for (let i = 0; i < previous.length; i++) {
        if (!compareFunction(previous[i], current[i])) return false
    }
    return true
}

function buildDifficultyString(lfm: Lfm): string {
    if (!lfm) return "Normal"

    const comment = lfm.comment ?? ""

    const reaperString = (() => {
        const skullCountMatch = comment.match(SKULL_EXPRESSION)
        if (!skullCountMatch) return "Reaper"

        const rawSkullCount = parseInt(skullCountMatch[2])
        const hasPlusSymbol = !!skullCountMatch[3]

        const clampedSkullCount =
            rawSkullCount <= 0
                ? 0
                : rawSkullCount > MAX_SKULL_COUNT
                  ? 9001
                  : rawSkullCount

        const skullString =
            clampedSkullCount > 0
                ? `${clampedSkullCount}${hasPlusSymbol ? "+" : ""}`
                : null

        return skullString ? `Reaper ${skullString}` : "Reaper"
    })()

    if (!lfm.is_quest_guess) {
        return lfm.difficulty === "Reaper"
            ? reaperString
            : (lfm.difficulty ?? "Normal")
    }

    if (REAPER_EXPRESSION.test(lfm.comment)) {
        return reaperString
    } else if (ELITE_EXPRESSION.test(lfm.comment)) {
        return "Elite"
    } else if (HARD_EXPRESSION.test(lfm.comment)) {
        return "Hard"
    }

    return "Normal"
}

export {
    shouldLfmRerender,
    calculateCommonBoundingBoxes,
    getLfmPostedTimestamp,
    getLfmActivityEventsFlatMap,
    areLfmArraysEqual,
    areLfmsEquivalent,
    areLfmOverlaysEquivalent,
    buildDifficultyString,
}
