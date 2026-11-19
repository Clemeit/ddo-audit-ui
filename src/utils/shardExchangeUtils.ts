import {
    SHARD_EXCHANGE_SORTS,
    ShardExchangeCategory,
    ShardExchangeListing,
    ShardExchangeListingQuery,
    ShardExchangeMyBid,
    ShardExchangeSort,
} from "../models/ShardExchange.ts"

export const SHARD_EXCHANGE_MAX_LEVEL = 100

export const DEFAULT_LISTING_QUERY: ShardExchangeListingQuery = Object.freeze({
    q: "",
    category: null,
    minLevel: null,
    maxLevel: null,
    buyoutOnly: false,
    mine: false,
    sort: "name",
    dir: "asc",
    page: 1,
})

// URL search parameter names for the browse page
const PARAM = {
    q: "q",
    category: "category",
    minLevel: "min",
    maxLevel: "max",
    buyoutOnly: "buyout",
    mine: "mine",
    sort: "sort",
    dir: "dir",
    page: "page",
} as const

const CATEGORY_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)*$/

function parseLevel(value: string | null): number | null {
    if (value == null || value.trim() === "") return null
    const level = Number(value)
    if (!Number.isInteger(level)) return null
    if (level < 0 || level > SHARD_EXCHANGE_MAX_LEVEL) return null
    return level
}

function isSort(value: string | null): value is ShardExchangeSort {
    return (
        value != null &&
        (SHARD_EXCHANGE_SORTS as readonly string[]).includes(value)
    )
}

// The browse page's state from its URL. Anything invalid falls back to the default.
export function parseListingQuery(
    params: URLSearchParams
): ShardExchangeListingQuery {
    const category = (params.get(PARAM.category) || "").toLowerCase()
    const sort = params.get(PARAM.sort)
    const page = Number(params.get(PARAM.page))
    let minLevel = parseLevel(params.get(PARAM.minLevel))
    let maxLevel = parseLevel(params.get(PARAM.maxLevel))
    if (minLevel != null && maxLevel != null && minLevel > maxLevel) {
        ;[minLevel, maxLevel] = [maxLevel, minLevel]
    }
    return {
        q: (params.get(PARAM.q) || "").slice(0, 100),
        category: CATEGORY_PATTERN.test(category) ? category : null,
        minLevel,
        maxLevel,
        buyoutOnly: params.get(PARAM.buyoutOnly) === "1",
        mine: params.get(PARAM.mine) === "1",
        sort: isSort(sort) ? sort : DEFAULT_LISTING_QUERY.sort,
        dir: params.get(PARAM.dir) === "desc" ? "desc" : "asc",
        page: Number.isInteger(page) && page >= 1 ? page : 1,
    }
}

// The browse page's state as URL parameters, leaving out what is the default.
export function listingQueryToSearchParams(
    query: ShardExchangeListingQuery
): URLSearchParams {
    const params = new URLSearchParams()
    const q = query.q.trim()
    if (q) params.set(PARAM.q, q)
    if (query.category) params.set(PARAM.category, query.category)
    if (query.minLevel != null) params.set(PARAM.minLevel, `${query.minLevel}`)
    if (query.maxLevel != null) params.set(PARAM.maxLevel, `${query.maxLevel}`)
    if (query.buyoutOnly) params.set(PARAM.buyoutOnly, "1")
    if (query.mine) params.set(PARAM.mine, "1")
    if (query.sort !== DEFAULT_LISTING_QUERY.sort)
        params.set(PARAM.sort, query.sort)
    if (query.dir !== DEFAULT_LISTING_QUERY.dir)
        params.set(PARAM.dir, query.dir)
    if (query.page !== 1) params.set(PARAM.page, `${query.page}`)
    return params
}

// Clicking a sort header: the same header flips the direction, a new one starts ascending.
export function nextSort(
    query: ShardExchangeListingQuery,
    sort: ShardExchangeSort
): ShardExchangeListingQuery {
    const dir =
        query.sort === sort ? (query.dir === "asc" ? "desc" : "asc") : "asc"
    return { ...query, sort, dir, page: 1 }
}

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// Time left on a listing: rounded up to the hour when a day or more is left, else to the minute.
export function formatTimeLeft(expiresAt: string | null, now: number): string {
    if (!expiresAt) return "Unknown"
    const expires = Date.parse(expiresAt)
    if (Number.isNaN(expires)) return "Unknown"
    const left = expires - now
    if (left <= 0) return "Ending"
    if (left >= DAY) {
        const hours = Math.ceil(left / HOUR)
        const days = Math.floor(hours / 24)
        const rest = hours % 24
        return rest ? `${days}d ${rest}h` : `${days}d`
    }
    const minutes = Math.ceil(left / MINUTE)
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    if (!hours) return `${rest}m`
    return rest ? `${hours}h ${rest}m` : `${hours}h`
}

export function formatShards(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return "—"
    if (Number.isInteger(value)) return value.toLocaleString()
    return value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: value < 10 ? 2 : 1,
    })
}

// Price per unit for a stack; null for a single item.
export function unitPrice(
    price: number | null,
    quantity: number | null
): number | null {
    if (price == null || quantity == null || quantity <= 1) return null
    return price / quantity
}

// "just now", "12 minutes ago", "3 hours ago", "2 days ago"
export function formatAge(
    time: string | null | undefined,
    now: number
): string {
    if (!time) return "never"
    const then = Date.parse(time)
    if (Number.isNaN(then)) return "never"
    const age = Math.max(0, now - then)
    if (age < MINUTE) return "just now"
    if (age < HOUR) {
        const minutes = Math.floor(age / MINUTE)
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`
    }
    if (age < DAY) {
        const hours = Math.floor(age / HOUR)
        return `${hours} hour${hours === 1 ? "" : "s"} ago`
    }
    const days = Math.floor(age / DAY)
    return `${days} day${days === 1 ? "" : "s"} ago`
}

// The exact local date and time, for hover text. Empty when the time is missing or invalid.
export function formatDateTime(time: string | null | undefined): string {
    if (!time) return ""
    const date = new Date(time)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

// The data is updated about once an hour; older than this, it is out of date.
export const STALE_DATA_AGE_MS = 3 * HOUR

export function isStale(time: string | null | undefined, now: number): boolean {
    if (!time) return true
    const then = Date.parse(time)
    return Number.isNaN(then) || now - then > STALE_DATA_AGE_MS
}

// The categories from the root to the one with this slug (empty if there is none).
export function categoryTrail(
    categories: ShardExchangeCategory[],
    slug: string | null | undefined
): ShardExchangeCategory[] {
    if (!slug) return []
    for (const category of categories) {
        if (category.slug === slug) return [category]
        if (slug.startsWith(`${category.slug}.`)) {
            const rest = categoryTrail(category.children, slug)
            if (rest.length) return [category, ...rest]
        }
    }
    return []
}

export function categoryLabel(
    categories: ShardExchangeCategory[],
    slug: string | null | undefined
): string | null {
    const trail = categoryTrail(categories, slug)
    return trail.length ? trail.map((c) => c.name).join(" › ") : null
}

export function shardExchangePath(server: string, itemSlug?: string | null) {
    const base = `/shard-exchange/${encodeURIComponent(server.toLowerCase())}`
    return itemSlug ? `${base}/${encodeURIComponent(itemSlug)}` : base
}

function units(listing: ShardExchangeListing): number {
    return Math.max(listing.quantity ?? 1, 1)
}

function compareNullable(
    a: number | string | null,
    b: number | string | null,
    sign: number
): number {
    if (a == null || b == null) return a == null ? (b == null ? 0 : 1) : -1
    if (a < b) return -sign
    if (a > b) return sign
    return 0
}

function sortValue(
    listing: ShardExchangeListing,
    sort: ShardExchangeSort
): number | string | null {
    switch (sort) {
        case "name":
            return listing.name == null ? null : listing.name.toLowerCase()
        case "time_left": {
            const t = listing.expires_at ? Date.parse(listing.expires_at) : NaN
            return Number.isNaN(t) ? null : t
        }
        case "price":
            return listing.current_price
        case "buyout":
            return listing.buyout
        case "unit_price":
            return listing.current_price / units(listing)
        case "unit_buyout":
            return listing.buyout == null
                ? null
                : listing.buyout / units(listing)
    }
}

export function filterAndSortListings<T extends ShardExchangeListing>(
    listings: T[],
    query: ShardExchangeListingQuery
): T[] {
    const words = query.q.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const filtered = listings.filter((listing) => {
        const name = (listing.name ?? "").toLowerCase()
        if (words.some((word) => !name.includes(word))) return false
        if (
            query.category &&
            listing.category !== query.category &&
            !(listing.category ?? "").startsWith(`${query.category}.`)
        )
            return false
        const level = listing.min_level ?? 1
        if (query.minLevel != null && level < query.minLevel) return false
        if (query.maxLevel != null && level > query.maxLevel) return false
        if (query.buyoutOnly && listing.buyout == null) return false
        return true
    })
    const sign = query.dir === "desc" ? -1 : 1
    return filtered.sort(
        (a, b) =>
            compareNullable(
                sortValue(a, query.sort),
                sortValue(b, query.sort),
                sign
            ) ||
            compareNullable(sortValue(a, "name"), sortValue(b, "name"), 1) ||
            compareNullable(a.ref, b.ref, 1)
    )
}

export interface GroupedMyBids {
    leading: ShardExchangeMyBid[]
    outbid: ShardExchangeMyBid[]
    ended: ShardExchangeMyBid[]
}

function timeOf(value: string | null | undefined): number {
    const t = value ? Date.parse(value) : NaN
    return Number.isNaN(t) ? 0 : t
}

export function groupMyBids(bids: ShardExchangeMyBid[]): GroupedMyBids {
    const byTimeLeft = (a: ShardExchangeMyBid, b: ShardExchangeMyBid) =>
        compareNullable(
            sortValue(a, "time_left"),
            sortValue(b, "time_left"),
            1
        ) || compareNullable(a.ref, b.ref, 1)
    const endedAt = (bid: ShardExchangeMyBid) =>
        timeOf(bid.ended_at) || timeOf(bid.expires_at)
    return {
        leading: bids.filter((b) => b.status === "leading").sort(byTimeLeft),
        outbid: bids.filter((b) => b.status === "outbid").sort(byTimeLeft),
        ended: bids
            .filter((b) => b.status === "ended")
            .sort(
                (a, b) =>
                    endedAt(b) - endedAt(a) || compareNullable(a.ref, b.ref, 1)
            ),
    }
}

export function outbidEventKey(bid: ShardExchangeMyBid): string {
    return `${bid.ref}:${bid.my_bid.at ?? ""}`
}

export function undismissedOutbids(
    bids: ShardExchangeMyBid[],
    dismissed: string[]
): ShardExchangeMyBid[] {
    const hidden = new Set(dismissed)
    return bids.filter(
        (bid) => bid.status === "outbid" && !hidden.has(outbidEventKey(bid))
    )
}

export function pruneDismissed(
    dismissed: string[],
    bids: ShardExchangeMyBid[]
): string[] {
    const current = new Set(
        bids.filter((b) => b.status === "outbid").map(outbidEventKey)
    )
    return dismissed.filter((key) => current.has(key))
}
