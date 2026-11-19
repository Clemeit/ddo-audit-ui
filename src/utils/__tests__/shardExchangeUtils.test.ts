import {
    DEFAULT_LISTING_QUERY,
    categoryLabel,
    categoryTrail,
    formatAge,
    formatShards,
    formatTimeLeft,
    isStale,
    listingQueryToSearchParams,
    nextSort,
    parseListingQuery,
    shardExchangePath,
    unitPrice,
} from "../shardExchangeUtils"
import { ShardExchangeCategory } from "../../models/ShardExchange"

const NOW = Date.parse("2026-11-11T12:00:00Z")
const at = (ms: number) => new Date(NOW + ms).toISOString()
const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

describe("parseListingQuery / listingQueryToSearchParams", () => {
    it("defaults when the URL has nothing", () => {
        expect(parseListingQuery(new URLSearchParams())).toEqual(
            DEFAULT_LISTING_QUERY
        )
        expect(
            listingQueryToSearchParams(DEFAULT_LISTING_QUERY).toString()
        ).toBe("")
    })

    it("round-trips a full query", () => {
        const query = {
            q: "jelly cake",
            category: "weapons.simple.club",
            minLevel: 5,
            maxLevel: 20,
            buyoutOnly: true,
            mine: true,
            sort: "unit_buyout" as const,
            dir: "desc" as const,
            page: 4,
        }
        const params = listingQueryToSearchParams(query)
        expect(params.toString()).toBe(
            "q=jelly+cake&category=weapons.simple.club&min=5&max=20&buyout=1&mine=1&sort=unit_buyout&dir=desc&page=4"
        )
        expect(parseListingQuery(params)).toEqual(query)
    })

    it("ignores invalid values", () => {
        const query = parseListingQuery(
            new URLSearchParams(
                "category=Not%20Valid!&min=abc&max=500&sort=nonsense&dir=sideways&page=-2"
            )
        )
        expect(query).toEqual(DEFAULT_LISTING_QUERY)
    })

    it("swaps a level range given backwards", () => {
        const query = parseListingQuery(new URLSearchParams("min=20&max=5"))
        expect([query.minLevel, query.maxLevel]).toEqual([5, 20])
    })
})

describe("nextSort", () => {
    it("starts a new column ascending on page 1", () => {
        const next = nextSort({ ...DEFAULT_LISTING_QUERY, page: 3 }, "buyout")
        expect([next.sort, next.dir, next.page]).toEqual(["buyout", "asc", 1])
    })

    it("flips the direction on the same column", () => {
        const once = nextSort(DEFAULT_LISTING_QUERY, "name")
        expect(once.dir).toBe("desc")
        expect(nextSort(once, "name").dir).toBe("asc")
    })
})

describe("formatTimeLeft", () => {
    it.each([
        [null, "Unknown"],
        [at(-MIN), "Ending"],
        [at(30 * 1000), "1m"],
        [at(59 * MIN + 1), "1h"],
        [at(3 * HOUR + 12 * MIN), "3h 12m"],
        [at(DAY), "1d"],
        [at(2 * DAY + 4 * HOUR + 1), "2d 5h"],
    ])("%s → %s", (expires, expected) => {
        expect(formatTimeLeft(expires, NOW)).toBe(expected)
    })
})

describe("prices", () => {
    it("formats shards", () => {
        expect(formatShards(null)).toBe("—")
        expect(formatShards(1500)).toBe((1500).toLocaleString())
        expect(formatShards(2.5)).toBe((2.5).toLocaleString())
    })

    it("gives a unit price only for stacks", () => {
        expect(unitPrice(100, 10)).toBe(10)
        expect(unitPrice(100, 1)).toBeNull()
        expect(unitPrice(100, null)).toBeNull()
        expect(unitPrice(null, 10)).toBeNull()
    })
})

describe("freshness", () => {
    it("describes the age of the data", () => {
        expect(formatAge(null, NOW)).toBe("never")
        expect(formatAge(at(-10 * 1000), NOW)).toBe("just now")
        expect(formatAge(at(-1 * MIN), NOW)).toBe("1 minute ago")
        expect(formatAge(at(-12 * MIN), NOW)).toBe("12 minutes ago")
        expect(formatAge(at(-5 * HOUR), NOW)).toBe("5 hours ago")
        expect(formatAge(at(-2 * DAY), NOW)).toBe("2 days ago")
    })

    it("calls data over three hours old stale", () => {
        expect(isStale(at(-2 * HOUR), NOW)).toBe(false)
        expect(isStale(at(-4 * HOUR), NOW)).toBe(true)
        expect(isStale(null, NOW)).toBe(true)
    })
})

describe("categories", () => {
    const tree: ShardExchangeCategory[] = [
        {
            slug: "weapons",
            name: "Weapons",
            children: [
                {
                    slug: "weapons.simple",
                    name: "Simple",
                    children: [
                        {
                            slug: "weapons.simple.club",
                            name: "Club",
                            children: [],
                        },
                    ],
                },
            ],
        },
        { slug: "potions", name: "Potions", children: [] },
    ]

    it("finds the trail to a category", () => {
        expect(
            categoryTrail(tree, "weapons.simple.club").map((c) => c.name)
        ).toEqual(["Weapons", "Simple", "Club"])
        expect(categoryTrail(tree, "weapons.martial")).toEqual([])
        expect(categoryTrail(tree, null)).toEqual([])
    })

    it("labels a category with its parents", () => {
        expect(categoryLabel(tree, "weapons.simple.club")).toBe(
            "Weapons › Simple › Club"
        )
        expect(categoryLabel(tree, "potions")).toBe("Potions")
        expect(categoryLabel(tree, "nope")).toBeNull()
    })
})

it("builds page paths", () => {
    expect(shardExchangePath("Thrane")).toBe("/shard-exchange/thrane")
    expect(shardExchangePath("thrane", "test-item")).toBe(
        "/shard-exchange/thrane/test-item"
    )
})
