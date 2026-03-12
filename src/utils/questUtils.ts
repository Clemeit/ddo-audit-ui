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

export const sortQuestsByField = (
    quests: Quest[],
    sortField: string,
    sortDirection: "asc" | "desc"
): Quest[] => {
    return [...quests].sort((a, b) => {
        let aValue: string | number | null | undefined
        let bValue: string | number | null | undefined
        switch (sortField) {
            case "name":
                aValue = a.name
                bValue = b.name
                break
            case "heroic_normal_cr":
                aValue = a.heroic_normal_cr
                bValue = b.heroic_normal_cr
                break
            case "epic_normal_cr":
                aValue = a.epic_normal_cr
                bValue = b.epic_normal_cr
                break
            case "required_adventure_pack":
                aValue = a.required_adventure_pack
                bValue = b.required_adventure_pack
                break
            case "length":
                aValue = a.length
                bValue = b.length
                break
            case "heroic_xp_per_minute":
                aValue = a.heroic_xp_per_minute_relative
                bValue = b.heroic_xp_per_minute_relative
                break
            case "epic_xp_per_minute":
                aValue = a.epic_xp_per_minute_relative
                bValue = b.epic_xp_per_minute_relative
                break
            case "popularity":
                aValue = a.heroic_popularity_relative
                bValue = b.heroic_popularity_relative
                break
            default:
                aValue = a.name
                bValue = b.name
                break
        }

        const aIsEmpty = aValue == null || aValue === ""
        const bIsEmpty = bValue == null || bValue === ""

        if (aIsEmpty && bIsEmpty) {
            return (a.id - b.id) * (sortDirection === "asc" ? 1 : -1)
        }
        if (aIsEmpty) return 1
        if (bIsEmpty) return -1

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1

        return (a.id - b.id) * (sortDirection === "asc" ? 1 : -1)
    })
}

export const calculateQuestXpPerMinute = (
    quest: Quest | null,
    type: "heroic" | "epic"
): number | null => {
    if (!quest?.length || !quest.xp) return null
    const xpValue = getBestXpValue(quest.xp, type)
    if (!xpValue) return null
    return Math.round(xpValue / (quest.length / 60))
}

export const getBestXpValue = (
    xp: Quest["xp"],
    type: "heroic" | "epic"
): number | null => {
    if (!xp) return null

    const prefix = type === "heroic" ? "heroic" : "epic"

    const elite = xp[`${prefix}_elite` as keyof typeof xp]
    if (elite && elite > 0) return elite

    const hard = xp[`${prefix}_hard` as keyof typeof xp]
    if (hard && hard > 0) return hard

    const normal = xp[`${prefix}_normal` as keyof typeof xp]
    if (normal && normal > 0) return normal

    const casual = xp[`${prefix}_casual` as keyof typeof xp]
    if (casual && casual > 0) return casual

    return null
}
