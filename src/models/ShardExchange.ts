// Shard Exchange (the in-game auction house). Prices are in shards.

export interface ShardExchangeBid {
    amount: number
    at: string
}

export interface ShardExchangeListing {
    // Opaque, stable identifier of the listing (for React keys and selection)
    ref: string
    // null when the item's name is not known yet
    name: string | null
    slug: string | null
    category: string | null
    // null when the item does not stack
    quantity: number | null
    min_level: number | null
    bound: boolean
    min_bid: number
    // null when nobody has bid
    bid: number | null
    // Recorded bids, oldest first. "at" is when an update saw the bid, so it can trail the real bid by up to
    // an hour, and bids between two updates show as one. Never says who bid.
    bids: ShardExchangeBid[]
    // The bid if there is one, else the minimum bid
    current_price: number
    // null when the listing has no buyout price
    buyout: number | null
    posted_at: string | null
    expires_at: string | null
}

export interface ShardExchangeListingsResponse {
    server: string
    page: number
    limit: number
    total: number
    pages: number
    updated_at: string | null
    data: ShardExchangeListing[]
}

export interface ShardExchangeCategory {
    slug: string
    name: string
    // Present when the categories were asked for with a server
    count?: number
    children: ShardExchangeCategory[]
}

export interface ShardExchangeCategoriesResponse {
    server?: string
    updated_at?: string | null
    total?: number
    uncategorized?: number
    data: ShardExchangeCategory[]
}

// Per-unit asking prices for one update (bucket "hour", about hourly) or one UTC day (bucket "day")
export interface ShardExchangePricePoint {
    time: string
    listing_count: number
    unit_count: number
    buyout_listing_count: number
    min_buyout_unit: number | null
    median_buyout_unit: number | null
    max_buyout_unit: number | null
    min_bid_unit: number | null
    // How many updates went into this point
    updates: number
}

export type ShardExchangePriceBucket = "day" | "hour"

export interface ShardExchangeItemResponse {
    server: string
    slug: string
    name: string
    category: string | null
    days: number
    bucket: ShardExchangePriceBucket
    data: ShardExchangePricePoint[]
}

export type ShardExchangeBidStatus = "leading" | "outbid" | "ended"

export interface ShardExchangeMyBid extends ShardExchangeListing {
    server: string
    status: ShardExchangeBidStatus
    ended_at: string | null
    my_bid: {
        character_id: number
        amount: number
        at: string | null
    }
}

export interface ShardExchangeMyBidsResponse {
    characters: number[]
    updated_at: string | null
    data: ShardExchangeMyBid[]
}

export const SHARD_EXCHANGE_SORTS = [
    "name",
    "time_left",
    "price",
    "buyout",
    "unit_price",
    "unit_buyout",
] as const

export type ShardExchangeSort = (typeof SHARD_EXCHANGE_SORTS)[number]

export type SortDirection = "asc" | "desc"

export interface ShardExchangeListingQuery {
    q: string
    category: string | null
    minLevel: number | null
    maxLevel: number | null
    buyoutOnly: boolean
    mine: boolean
    sort: ShardExchangeSort
    dir: SortDirection
    page: number
}
