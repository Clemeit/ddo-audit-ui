import {
    DEFAULT_LISTING_QUERY,
    filterAndSortListings,
    groupMyBids,
} from "../shardExchangeUtils"
import { ShardExchangeMyBid } from "../../models/ShardExchange"

const NOW = Date.parse("2026-11-11T12:00:00Z")
const at = (ms: number) => new Date(NOW + ms).toISOString()
const HOUR = 60 * 60 * 1000

function bid(overrides: Partial<ShardExchangeMyBid> = {}): ShardExchangeMyBid {
    return {
        ref: "a",
        name: "Item",
        slug: "item",
        category: null,
        quantity: null,
        min_level: null,
        bound: false,
        min_bid: 1,
        bid: 10,
        bids: [],
        current_price: 10,
        buyout: null,
        posted_at: null,
        expires_at: at(HOUR),
        server: "thrane",
        status: "leading",
        ended_at: null,
        my_bid: { character_id: 1, amount: 10, at: at(-HOUR) },
        ...overrides,
    }
}

describe("filterAndSortListings", () => {
    const listings = [
        bid({
            ref: "1",
            name: "Jelly Cake",
            current_price: 30,
            min_level: 5,
            category: "food.cake",
        }),
        bid({
            ref: "2",
            name: "Ring of Jelly",
            current_price: 10,
            buyout: 50,
            category: "jewelry",
        }),
        bid({ ref: "3", name: null, current_price: 20 }),
    ]

    it("filters by words, category, level and buyout", () => {
        const q = { ...DEFAULT_LISTING_QUERY, q: "jelly" }
        expect(filterAndSortListings(listings, q).map((l) => l.ref)).toEqual([
            "1",
            "2",
        ])
        expect(
            filterAndSortListings(listings, {
                ...DEFAULT_LISTING_QUERY,
                category: "food",
            }).map((l) => l.ref)
        ).toEqual(["1"])
        expect(
            filterAndSortListings(listings, {
                ...DEFAULT_LISTING_QUERY,
                minLevel: 2,
            }).map((l) => l.ref)
        ).toEqual(["1"])
        expect(
            filterAndSortListings(listings, {
                ...DEFAULT_LISTING_QUERY,
                buyoutOnly: true,
            }).map((l) => l.ref)
        ).toEqual(["2"])
    })

    it("sorts with missing values last", () => {
        expect(
            filterAndSortListings(listings, DEFAULT_LISTING_QUERY).map(
                (l) => l.ref
            )
        ).toEqual(["1", "2", "3"])
        expect(
            filterAndSortListings(listings, {
                ...DEFAULT_LISTING_QUERY,
                sort: "price",
                dir: "desc",
            }).map((l) => l.ref)
        ).toEqual(["1", "3", "2"])
        expect(
            filterAndSortListings(listings, {
                ...DEFAULT_LISTING_QUERY,
                sort: "buyout",
                dir: "desc",
            }).map((l) => l.ref)
        ).toEqual(["2", "1", "3"])
    })
})

describe("groupMyBids", () => {
    it("splits by status and orders each group", () => {
        const groups = groupMyBids([
            bid({ ref: "late", expires_at: at(3 * HOUR) }),
            bid({ ref: "soon", expires_at: at(HOUR) }),
            bid({ ref: "out", status: "outbid" }),
            bid({ ref: "old", status: "ended", ended_at: at(-5 * HOUR) }),
            bid({ ref: "new", status: "ended", ended_at: at(-HOUR) }),
        ])
        expect(groups.leading.map((b) => b.ref)).toEqual(["soon", "late"])
        expect(groups.outbid.map((b) => b.ref)).toEqual(["out"])
        expect(groups.ended.map((b) => b.ref)).toEqual(["new", "old"])
    })
})
