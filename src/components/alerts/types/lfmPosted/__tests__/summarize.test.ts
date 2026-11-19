import {
    defaultLfmPostedCriteria,
    summarizeLfmPosted,
    validateLfmPosted,
} from "../summarize"

const names: Record<number, string> = {
    1: "The Pit",
    2: "Tempest's Spine",
    3: "Gianthold Tor",
    4: "Fire on Thunder Peak",
}
const questName = (id: number) => names[id]

const criteria = (overrides = {}) => ({
    ...defaultLfmPostedCriteria(),
    quest_ids: [1],
    ...overrides,
})

describe("summarizeLfmPosted", () => {
    it("describes a quest on any server", () => {
        expect(summarizeLfmPosted(criteria(), questName)).toBe(
            "The Pit on any server"
        )
    })

    it("includes servers, levels and difficulties", () => {
        expect(
            summarizeLfmPosted(
                criteria({
                    server_names: ["Argonnessen", "Cannith"],
                    min_level: 20,
                    max_level: 24,
                    difficulties: ["Elite", "Reaper"],
                }),
                questName
            )
        ).toBe("The Pit on Argonnessen, Cannith · levels 20-24 · Elite, Reaper")
    })

    it("handles open-ended level ranges", () => {
        expect(summarizeLfmPosted(criteria({ min_level: 30 }), questName)).toBe(
            "The Pit on any server · level 30+"
        )
        expect(summarizeLfmPosted(criteria({ max_level: 10 }), questName)).toBe(
            "The Pit on any server · up to level 10"
        )
    })

    it("abbreviates long quest lists and unknown quests", () => {
        expect(
            summarizeLfmPosted(
                criteria({ quest_ids: [1, 2, 3, 4, 99] }),
                questName
            )
        ).toBe(
            "The Pit, Tempest's Spine, Gianthold Tor and 2 more on any server"
        )
        expect(
            summarizeLfmPosted(criteria({ quest_ids: [99] }), questName)
        ).toBe("Quest #99 on any server")
    })
})

describe("validateLfmPosted", () => {
    it("accepts a quest with no other constraints", () => {
        expect(validateLfmPosted(criteria())).toBeNull()
    })

    it("requires a quest", () => {
        expect(validateLfmPosted(defaultLfmPostedCriteria())).toMatch(/quest/)
    })

    it("rejects inverted and out-of-range levels", () => {
        expect(
            validateLfmPosted(criteria({ min_level: 20, max_level: 10 }))
        ).toMatch(/minimum/)
        expect(validateLfmPosted(criteria({ min_level: 0 }))).toMatch(/1 to 50/)
        expect(validateLfmPosted(criteria({ max_level: 2.5 }))).toMatch(/whole/)
    })

    it("rejects too many quests", () => {
        expect(
            validateLfmPosted(
                criteria({
                    quest_ids: Array.from({ length: 21 }, (_, i) => i + 1),
                })
            )
        ).toMatch(/at most/)
    })
})
