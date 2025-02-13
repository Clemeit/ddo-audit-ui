import { FlatActivityEvent, Lfm, LfmActivityType } from "../models/Lfm"
import {
    LFM_HEIGHT,
    LFM_SPRITE_MAP,
    LFM_AREA_PADDING,
} from "../constants/lfmPanel.ts"
import { BoundingBox } from "../models/Geometry.ts"

const calculateCommonBoundingBoxes = (panelWidth: number) => {
    const lfmBoundingBox = new BoundingBox(
        0,
        0,
        panelWidth -
            LFM_SPRITE_MAP.CONTENT_LEFT.width -
            LFM_SPRITE_MAP.CONTENT_RIGHT.width -
            LFM_AREA_PADDING.left -
            LFM_AREA_PADDING.right,
        LFM_HEIGHT
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
        lfmBoundingBox.width * 0.3,
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
        LFM_SPRITE_MAP.CLASSES.ALL.width,
        LFM_SPRITE_MAP.CLASSES.ALL.height
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
    if (previous.comment !== current.comment) return true
    if (
        Math.round(previous.adventure_active_time / 60) !==
        Math.round(current.adventure_active_time / 60)
    )
        return true
    if (previous.members.length !== current.members.length) return true
    if (previous.quest?.name !== current.quest?.name) return true
    if (previous.difficulty !== current.difficulty) return true
    if (previous.minimum_level !== current.minimum_level) return true
    if (previous.maximum_level !== current.maximum_level) return true
    if (previous.leader.name !== current.leader.name) return true
    if (previous.is_eligible !== current.is_eligible) return true

    return false
}

function getLfmPostedTimestamp(lfm: Lfm): Date {
    if (!lfm.activity) return new Date()
    const lfmPostedEvent = getLfmActivityEventsFlatMap(lfm).find(
        (event) => event.tag === "posted"
    )
    if (!lfmPostedEvent) return new Date()
    return new Date(lfmPostedEvent.timestamp + "Z")
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

function mapClassToIconBoundingBox(className: string = "fighter") {
    switch (className.toLowerCase()) {
        case "alchemist":
            return LFM_SPRITE_MAP.CLASSES.ALCHEMIST
        case "artificer":
            return LFM_SPRITE_MAP.CLASSES.ARTIFICER
        case "barbarian":
            return LFM_SPRITE_MAP.CLASSES.BARBARIAN
        case "bard":
            return LFM_SPRITE_MAP.CLASSES.BARD
        case "cleric":
            return LFM_SPRITE_MAP.CLASSES.CLERIC
        case "druid":
            return LFM_SPRITE_MAP.CLASSES.DRUID
        case "favored soul":
            return LFM_SPRITE_MAP.CLASSES.FAVORED_SOUL
        case "fighter":
            return LFM_SPRITE_MAP.CLASSES.FIGHTER
        case "monk":
            return LFM_SPRITE_MAP.CLASSES.MONK
        case "paladin":
            return LFM_SPRITE_MAP.CLASSES.PALADIN
        case "ranger":
            return LFM_SPRITE_MAP.CLASSES.RANGER
        case "rogue":
            return LFM_SPRITE_MAP.CLASSES.ROGUE
        case "sorcerer":
            return LFM_SPRITE_MAP.CLASSES.SORCERER
        case "warlock":
            return LFM_SPRITE_MAP.CLASSES.WARLOCK
        case "wizard":
            return LFM_SPRITE_MAP.CLASSES.WIZARD
        default:
            return LFM_SPRITE_MAP.CLASSES.FIGHTER
    }
}

function mapRaceAndGenderToRaceIconBoundingBox(
    race: string = "human",
    gender: string = "male"
) {
    let raceIconBoundingBox: {
        x: number
        y: number
        width: number
        height: number
    }
    switch (race.toLowerCase()) {
        case "dragonborn":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.DRAGONBORN
            break
        case "drow elf":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.DROW
            break
        case "dwarf":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.DWARF
            break
        case "elf":
        case "wood elf":
        case "sun elf":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.ELF
            break
        case "gnome":
        case "deep gnome":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.GNOME
            break
        case "halfling":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.HALFLING
            break
        case "half elf":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.HALF_ELF
            break
        case "half orc":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.HALF_ORC
            break
        case "human":
        case "shadar-kai":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.HUMAN
            break
        case "tiefling":
        case "tiefling scoundrel":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.TIEFLING
            break
        case "warforged":
        case "bladeforged":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.WARFORGED
            break
        case "aasimar":
        case "aasimar scourge":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.AASIMAR
            break
        case "eladrin":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.ELADRIN
            break
        case "shifter":
        case "razorclaw shifter":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.SHIFTER
            break
        case "tabaxi":
        case "tabaxi trailblazer":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.TABAXI
            break
        case "eladrin chaosmancer":
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.CHAOSMANCER
            break
        default:
            raceIconBoundingBox = LFM_SPRITE_MAP.RACES.HUMAN
    }

    return {
        x:
            raceIconBoundingBox.x +
            (gender.toLowerCase() === "female" ? 108 : 0),
        y: raceIconBoundingBox.y,
        width: raceIconBoundingBox.width,
        height: raceIconBoundingBox.height,
    }
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
    if (previous.quest?.name !== current.quest?.name) return false
    if (previous.difficulty !== current.difficulty) return false
    if (previous.minimum_level !== current.minimum_level) return false
    if (previous.maximum_level !== current.maximum_level) return false
    if (previous.leader.name !== current.leader.name) return false
    if (previous.is_eligible !== current.is_eligible) return false

    return true
}

function areLfmOverlaysEquivalent(previous: Lfm, current: Lfm): boolean {
    // specifically for check if the overlay should be rerendered
    if (previous === undefined && current === undefined) return true
    if (previous === undefined || current === undefined) return false
    if (previous.quest?.name !== current.quest?.name) return false
    if (previous.difficulty !== current.difficulty) return false
    if (previous.members.length !== current.members.length) return false
    // check members
    const allPreviousMembers = [previous.leader, ...previous.members]
    const allCurrentMembers = [current.leader, ...current.members]
    for (let i = 0; i < allPreviousMembers.length; i++) {
        const member = allPreviousMembers[i]
        const currentMember = allCurrentMembers[i]
        if (
            !currentMember ||
            member.location?.name !== currentMember.location?.name
        )
            return false
        if (member.total_level !== currentMember.total_level) return false
    }
    // check history
    if (previous.activity?.length !== current.activity?.length) return false

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

export {
    shouldLfmRerender,
    calculateCommonBoundingBoxes,
    getLfmPostedTimestamp,
    mapRaceAndGenderToRaceIconBoundingBox,
    mapClassToIconBoundingBox,
    getLfmActivityEventsFlatMap,
    areLfmArraysEqual,
    areLfmsEquivalent,
    areLfmOverlaysEquivalent,
}
