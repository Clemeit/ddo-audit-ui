import { ShardExchangeListedCriteria } from "../../../../models/Alert"
import { serversText } from "../../shared/ServerPills"

const MAX_PRICE = 2_000_000_000

function shards(amount: number): string {
    return amount.toLocaleString("en-US")
}

function priceChips(criteria: ShardExchangeListedCriteria): string[] {
    const chips: string[] = []
    if (criteria.max_buyout != null)
        chips.push(`Buyout up to ${shards(criteria.max_buyout)}`)
    else if (criteria.require_buyout) chips.push("Has a buyout")
    if (criteria.max_price != null)
        chips.push(`Bid up to ${shards(criteria.max_price)}`)
    return chips
}

function itemText(criteria: ShardExchangeListedCriteria): string {
    return criteria.item_name || criteria.item_slug || "An item"
}

/** One-line description, e.g. "Some Item on Thrane · Buyout up to 50,000". */
function summarizeShardExchangeListed(
    criteria: ShardExchangeListedCriteria
): string {
    const servers = criteria.server_names?.length
        ? criteria.server_names.join(", ")
        : "any server"
    return [
        `${itemText(criteria)} on ${servers}`,
        ...priceChips(criteria),
    ].join(" · ")
}

function describeShardExchangeListed(criteria: ShardExchangeListedCriteria): {
    title: string
    chips: string[]
} {
    return {
        title: itemText(criteria),
        chips: [serversText(criteria.server_names), ...priceChips(criteria)],
    }
}

function validPrice(value: number | null): boolean {
    return (
        value == null ||
        (Number.isInteger(value) && value >= 1 && value <= MAX_PRICE)
    )
}

function validateShardExchangeListed(
    criteria: ShardExchangeListedCriteria
): string | null {
    if (!criteria.item_slug) return "Pick an item."
    if (!validPrice(criteria.max_buyout) || !validPrice(criteria.max_price))
        return "Prices must be whole numbers of shards, at least 1."
    return null
}

function defaultShardExchangeListedCriteria(): ShardExchangeListedCriteria {
    return {
        item_slug: "",
        item_name: null,
        server_names: [],
        max_buyout: null,
        max_price: null,
        require_buyout: false,
    }
}

export {
    summarizeShardExchangeListed,
    describeShardExchangeListed,
    validateShardExchangeListed,
    defaultShardExchangeListedCriteria,
}
