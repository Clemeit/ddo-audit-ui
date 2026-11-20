import { LfmPostedCriteria } from "../../../../models/Alert"

const MAX_QUESTS_LISTED = 3

function listQuests(
    questIds: number[],
    questName: (id: number) => string | undefined
): string {
    const names = questIds.map((id) => questName(id) ?? `Quest #${id}`)
    if (names.length <= MAX_QUESTS_LISTED) return names.join(", ")
    const rest = names.length - MAX_QUESTS_LISTED
    return `${names.slice(0, MAX_QUESTS_LISTED).join(", ")} and ${rest} more`
}

function levelText(min: number | null, max: number | null): string | null {
    if (min != null && max != null) return `levels ${min}-${max}`
    if (min != null) return `level ${min}+`
    if (max != null) return `up to level ${max}`
    return null
}

/** One-line description of an lfm_posted rule, e.g. "The Pit on Argonnessen · levels 20-24 · Elite". */
function summarizeLfmPosted(
    criteria: LfmPostedCriteria,
    questName: (id: number) => string | undefined
): string {
    const parts = [listQuests(criteria.quest_ids ?? [], questName)]
    const servers = criteria.server_names ?? []
    parts[0] += servers.length ? ` on ${servers.join(", ")}` : " on any server"
    const levels = levelText(criteria.min_level, criteria.max_level)
    if (levels) parts.push(levels)
    if (criteria.difficulties?.length)
        parts.push(criteria.difficulties.join(", "))
    return parts.join(" · ")
}

/** Card form of an lfm_posted rule: quest names as the title, the filters as chips. */
function describeLfmPosted(
    criteria: LfmPostedCriteria,
    questName: (id: number) => string | undefined
): { title: string; chips: string[] } {
    const servers = criteria.server_names ?? []
    const chips = [servers.length ? servers.join(", ") : "Any server"]
    const levels = levelText(criteria.min_level, criteria.max_level)
    if (levels) chips.push(levels.charAt(0).toUpperCase() + levels.slice(1))
    if (criteria.difficulties?.length)
        chips.push(criteria.difficulties.join(", "))
    return { title: listQuests(criteria.quest_ids ?? [], questName), chips }
}

/** Returns a user-facing problem with the criteria, or null when it can be saved. */
function validateLfmPosted(criteria: LfmPostedCriteria): string | null {
    if (!criteria.quest_ids?.length) return "Pick at least one quest."
    if (criteria.quest_ids.length > 20) return "Pick at most 20 quests."
    const { min_level: min, max_level: max } = criteria
    for (const level of [min, max]) {
        if (
            level != null &&
            (!Number.isInteger(level) || level < 1 || level > 50)
        )
            return "Levels must be whole numbers from 1 to 50."
    }
    if (min != null && max != null && min > max)
        return "The minimum level can't be above the maximum level."
    return null
}

function defaultLfmPostedCriteria(): LfmPostedCriteria {
    return {
        quest_ids: [],
        server_names: [],
        min_level: null,
        max_level: null,
        difficulties: [],
    }
}

export {
    summarizeLfmPosted,
    describeLfmPosted,
    validateLfmPosted,
    defaultLfmPostedCriteria,
}
