import { OVERLAY_COLORS } from "../constants/lfmPanel"
import { Lfm, Quest } from "../models/Lfm.ts"

export const getRelativeString = (
    relativeValue: number | undefined
): string => {
    if (relativeValue == null) return "N/A"
    if (relativeValue < 0.2) return "Very Low"
    if (relativeValue < 0.4) return "Low"
    if (relativeValue < 0.6) return "Average"
    if (relativeValue < 0.8) return "High"
    return "Very High"
}

export const getRelativeMetricColor = (
    relativeValue: number | undefined
): string => {
    if (relativeValue == null) return OVERLAY_COLORS.QUEST_INFO
    if (relativeValue < 0.2) return OVERLAY_COLORS.METRIC_VERY_LOW
    if (relativeValue < 0.4) return OVERLAY_COLORS.METRIC_LOW
    if (relativeValue < 0.6) return OVERLAY_COLORS.METRIC_MEDIUM
    if (relativeValue < 0.8) return OVERLAY_COLORS.METRIC_HIGH
    return OVERLAY_COLORS.METRIC_VERY_HIGH
}

export const getMetricOverlayDisplayData = (
    lfm: Lfm | null,
    quest: Quest | null
): {
    xpPerMinuteRelativeString: string | null
    xpPerMinuteColor: string | null
    popularityRelativeString: string | null
    popularityColor: string | null
} => {
    const defaultResult = {
        xpPerMinuteRelativeString: null,
        xpPerMinuteColor: null,
        popularityRelativeString: null,
        popularityColor: null,
    }
    if (lfm == null || quest == null) return defaultResult

    const averageAcceptedLevel = (lfm.minimum_level + lfm.maximum_level) / 2
    const diffToHeroicLevel = Math.abs(
        (quest.heroic_normal_cr || 0) - averageAcceptedLevel
    )
    const diffToEpicLevel = Math.abs(
        (quest.epic_normal_cr || 0) - averageAcceptedLevel
    )
    const isHeroicGroup = diffToHeroicLevel <= diffToEpicLevel

    let xpPerMinuteValue: number | undefined
    let popularityValue: number | undefined
    // TODO: Once epic popularity tracking is implemented, use that value instead
    if (isHeroicGroup) {
        xpPerMinuteValue = quest.heroic_xp_per_minute_relative
        // popularityValue = quest.heroic_popularity_relative // TODO: fix
    } else {
        xpPerMinuteValue = quest.epic_xp_per_minute_relative
        // popularityValue = quest.epic_popularity_relative // TODO: fix
    }
    popularityValue = quest.heroic_popularity_relative // TODO: remove

    return {
        xpPerMinuteRelativeString:
            xpPerMinuteValue != null
                ? getRelativeString(xpPerMinuteValue)
                : null,
        xpPerMinuteColor:
            xpPerMinuteValue != null
                ? getRelativeMetricColor(xpPerMinuteValue)
                : null,
        popularityRelativeString:
            popularityValue != null ? getRelativeString(popularityValue) : null,
        popularityColor:
            popularityValue != null
                ? getRelativeMetricColor(popularityValue)
                : null,
    }
}

const hasQuestLevel = (value: number | undefined): value is number => {
    return value != null
}

export const isQuestWithinLevelTolerance = (
    targetQuest: Quest | null | undefined,
    candidateQuest: Quest | null | undefined,
    tolerance: number = 1
): boolean => {
    if (!targetQuest || !candidateQuest) return false

    const heroicMatch =
        hasQuestLevel(targetQuest.heroic_normal_cr) &&
        hasQuestLevel(candidateQuest.heroic_normal_cr) &&
        Math.abs(
            targetQuest.heroic_normal_cr - candidateQuest.heroic_normal_cr
        ) <= tolerance

    const epicMatch =
        hasQuestLevel(targetQuest.epic_normal_cr) &&
        hasQuestLevel(candidateQuest.epic_normal_cr) &&
        Math.abs(targetQuest.epic_normal_cr - candidateQuest.epic_normal_cr) <=
            tolerance

    return heroicMatch || epicMatch
}

export const getQuestLevelDeltaFromTarget = (
    targetQuest: Quest | null | undefined,
    candidateQuest: Quest | null | undefined
): number | null => {
    if (!targetQuest || !candidateQuest) return null

    const deltas: number[] = []

    if (
        hasQuestLevel(targetQuest.heroic_normal_cr) &&
        hasQuestLevel(candidateQuest.heroic_normal_cr)
    ) {
        deltas.push(
            Math.abs(
                targetQuest.heroic_normal_cr - candidateQuest.heroic_normal_cr
            )
        )
    }

    if (
        hasQuestLevel(targetQuest.epic_normal_cr) &&
        hasQuestLevel(candidateQuest.epic_normal_cr)
    ) {
        deltas.push(
            Math.abs(targetQuest.epic_normal_cr - candidateQuest.epic_normal_cr)
        )
    }

    if (deltas.length === 0) return null
    return Math.min(...deltas)
}

export const sortQuestsByPeerProximity = (
    quests: Quest[],
    targetQuest: Quest | null | undefined
): Quest[] => {
    return [...quests].sort((a, b) => {
        const aDelta = getQuestLevelDeltaFromTarget(targetQuest, a)
        const bDelta = getQuestLevelDeltaFromTarget(targetQuest, b)

        if (aDelta == null && bDelta == null) {
            return (a.name || "").localeCompare(b.name || "")
        }
        if (aDelta == null) return 1
        if (bDelta == null) return -1

        if (aDelta !== bDelta) return aDelta - bDelta

        return (a.name || "").localeCompare(b.name || "")
    })
}
