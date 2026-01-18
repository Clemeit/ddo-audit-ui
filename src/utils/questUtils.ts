import { OVERLAY_COLORS } from "../constants/lfmPanel"
import { Lfm, Quest } from "../models/Lfm.ts"

export const questXpPerMinuteRelativeString = (
    relativeValue: number | undefined
): string => {
    if (relativeValue == null) return "N/A"
    if (relativeValue < 0.2) return "Very Low"
    if (relativeValue < 0.4) return "Low"
    if (relativeValue < 0.6) return "Average"
    if (relativeValue < 0.8) return "High"
    return "Very High"
}

export const questPopularityRelativeString = (
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
    lfm: Lfm,
    quest: Quest
): {
    xpPerMinuteRelativeString: string
    xpPerMinuteColor: string
    popularityRelativeString: string
    popularityColor: string
} => {
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
                ? questXpPerMinuteRelativeString(xpPerMinuteValue)
                : null,
        xpPerMinuteColor:
            xpPerMinuteValue != null
                ? getRelativeMetricColor(xpPerMinuteValue)
                : null,
        popularityRelativeString:
            popularityValue != null
                ? questPopularityRelativeString(popularityValue)
                : null,
        popularityColor:
            popularityValue != null
                ? getRelativeMetricColor(popularityValue)
                : null,
    }
}
