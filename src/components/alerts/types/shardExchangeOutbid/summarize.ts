import { ShardExchangeOutbidCriteria } from "../../../../models/Alert"

const MAX_NAMES_LISTED = 3
const MAX_CHARACTERS = 50

function charactersText(
    criteria: ShardExchangeOutbidCriteria,
    characterName: (id: number) => string | undefined
): string {
    const ids = criteria.character_ids ?? []
    if (!ids.length) return "All my verified characters"
    const names = ids.map((id) => characterName(id) ?? "Unknown character")
    if (names.length <= MAX_NAMES_LISTED) return names.join(", ")
    const rest = names.length - MAX_NAMES_LISTED
    return `${names.slice(0, MAX_NAMES_LISTED).join(", ")} and ${rest} more`
}

/** One-line description, e.g. "Somebody outbid on the Shard Exchange". */
function summarizeShardExchangeOutbid(
    criteria: ShardExchangeOutbidCriteria,
    characterName: (id: number) => string | undefined
): string {
    return `${charactersText(criteria, characterName)} outbid on the Shard Exchange`
}

function describeShardExchangeOutbid(
    criteria: ShardExchangeOutbidCriteria,
    characterName: (id: number) => string | undefined
): { title: string; chips: string[] } {
    const count = criteria.character_ids?.length ?? 0
    return {
        title: charactersText(criteria, characterName),
        chips: [
            count
                ? `${count} character${count === 1 ? "" : "s"}`
                : "Follows your verified characters",
        ],
    }
}

function validateShardExchangeOutbid(
    criteria: ShardExchangeOutbidCriteria
): string | null {
    if ((criteria.character_ids?.length ?? 0) > MAX_CHARACTERS)
        return `Choose at most ${MAX_CHARACTERS} characters.`
    return null
}

function defaultShardExchangeOutbidCriteria(): ShardExchangeOutbidCriteria {
    return { character_ids: [] }
}

export {
    summarizeShardExchangeOutbid,
    describeShardExchangeOutbid,
    validateShardExchangeOutbid,
    defaultShardExchangeOutbidCriteria,
}
