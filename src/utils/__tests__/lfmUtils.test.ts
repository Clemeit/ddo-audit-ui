import {
    shouldLfmRerender,
    areLfmsEquivalent,
    areLfmArraysEqual,
    buildDifficultyString,
    getLfmPostedTimestamp,
    getLfmActivityEventsFlatMap,
} from "../lfmUtils"

const makeLfm = (overrides: any = {}): any => ({
    comment: "test",
    adventure_active_time: 120,
    members: [],
    quest_id: 1,
    difficulty: "Normal",
    minimum_level: 1,
    maximum_level: 30,
    leader: { name: "Leader" },
    accepted_classes_count: 15,
    is_quest_guess: false,
    activity: null,
    metadata: {
        isEligible: true,
        raidActivity: [],
        eligibleCharacters: [],
    },
    ...overrides,
})

describe("lfmUtils", () => {
    describe("shouldLfmRerender", () => {
        it("returns true when previous is null", () => {
            expect(shouldLfmRerender(null as any, makeLfm())).toBe(true)
        })

        it("returns true when current is null", () => {
            expect(shouldLfmRerender(makeLfm(), null as any)).toBe(true)
        })

        it("returns false when all tracked fields are the same", () => {
            const lfm = makeLfm()
            expect(shouldLfmRerender(lfm, { ...lfm })).toBe(false)
        })

        it("returns true when comment changes", () => {
            const a = makeLfm()
            const b = makeLfm({ comment: "changed" })
            expect(shouldLfmRerender(a, b)).toBe(true)
        })

        it("returns true when adventure_active_time rounds to different minute", () => {
            const a = makeLfm({ adventure_active_time: 60 })
            const b = makeLfm({ adventure_active_time: 120 })
            expect(shouldLfmRerender(a, b)).toBe(true)
        })

        it("returns false when adventure_active_time rounds to same minute", () => {
            const a = makeLfm({ adventure_active_time: 61 })
            const b = makeLfm({ adventure_active_time: 62 })
            expect(shouldLfmRerender(a, b)).toBe(false)
        })

        it("returns true when members length changes", () => {
            const a = makeLfm({ members: [] })
            const b = makeLfm({ members: [{}] })
            expect(shouldLfmRerender(a, b)).toBe(true)
        })

        it("returns true when quest_id changes", () => {
            const a = makeLfm()
            const b = makeLfm({ quest_id: 2 })
            expect(shouldLfmRerender(a, b)).toBe(true)
        })
    })

    describe("areLfmsEquivalent", () => {
        it("returns false when previous is undefined and current is not", () => {
            expect(areLfmsEquivalent(undefined as any, makeLfm())).toBe(false)
        })

        it("returns false when current is undefined and previous is not", () => {
            expect(areLfmsEquivalent(makeLfm(), undefined as any)).toBe(false)
        })

        it("returns true for identical LFMs", () => {
            const lfm = makeLfm()
            expect(areLfmsEquivalent(lfm, { ...lfm, metadata: { ...lfm.metadata } })).toBe(true)
        })

        it("returns false when accepted_classes_count differs", () => {
            const a = makeLfm({ accepted_classes_count: 15 })
            const b = makeLfm({ accepted_classes_count: 10 })
            expect(areLfmsEquivalent(a, b)).toBe(false)
        })
    })

    describe("areLfmArraysEqual", () => {
        it("returns false for different lengths", () => {
            expect(areLfmArraysEqual([makeLfm()], [], () => true)).toBe(false)
        })

        it("uses provided compare function", () => {
            const compareFn = jest.fn().mockReturnValue(true)
            const arr = [makeLfm()]
            areLfmArraysEqual(arr, arr, compareFn)
            expect(compareFn).toHaveBeenCalled()
        })

        it("returns false when compare function returns false for any pair", () => {
            const a = [makeLfm(), makeLfm()]
            const b = [makeLfm(), makeLfm({ comment: "diff" })]
            const compareFn = (prev: any, curr: any) => prev.comment === curr.comment
            expect(areLfmArraysEqual(a, b, compareFn)).toBe(false)
        })
    })

    describe("buildDifficultyString", () => {
        it("returns 'Normal' for null LFM", () => {
            expect(buildDifficultyString(null as any)).toBe("Normal")
        })

        it("returns the LFM difficulty when not a quest guess", () => {
            expect(buildDifficultyString(makeLfm({ difficulty: "Elite" }))).toBe("Elite")
        })

        it("returns 'Normal' when difficulty is null and not quest guess", () => {
            expect(buildDifficultyString(makeLfm({ difficulty: null }))).toBe("Normal")
        })

        it("parses Reaper with skull count from comment when difficulty is Reaper", () => {
            const lfm = makeLfm({
                difficulty: "Reaper",
                comment: "LFR r4",
            })
            expect(buildDifficultyString(lfm)).toBe("Reaper 4")
        })

        it("returns 'Reaper' when comment has no skull count and difficulty is Reaper", () => {
            const lfm = makeLfm({
                difficulty: "Reaper",
                comment: "No skulls mentioned",
            })
            expect(buildDifficultyString(lfm)).toBe("Reaper")
        })

        it("detects reaper from comment when is_quest_guess is true", () => {
            const lfm = makeLfm({
                is_quest_guess: true,
                comment: "running reaper 3",
            })
            expect(buildDifficultyString(lfm)).toBe("Reaper 3")
        })

        it("detects elite from comment when is_quest_guess is true", () => {
            const lfm = makeLfm({
                is_quest_guess: true,
                comment: "running elite",
            })
            expect(buildDifficultyString(lfm)).toBe("Elite")
        })

        it("detects hard from comment when is_quest_guess is true", () => {
            const lfm = makeLfm({
                is_quest_guess: true,
                comment: "hard mode",
            })
            expect(buildDifficultyString(lfm)).toBe("Hard")
        })

        it("returns 'Normal' when quest guess comment has no difficulty keywords", () => {
            const lfm = makeLfm({
                is_quest_guess: true,
                comment: "just farming",
            })
            expect(buildDifficultyString(lfm)).toBe("Normal")
        })

        it("clamps skull count to max (9001 for oversized values)", () => {
            const lfm = makeLfm({
                difficulty: "Reaper",
                comment: "reaper 99999",
            })
            expect(buildDifficultyString(lfm)).toBe("Reaper 9001")
        })

        it("includes + symbol when present in skull count", () => {
            const lfm = makeLfm({
                difficulty: "Reaper",
                comment: "reaper 4+",
            })
            expect(buildDifficultyString(lfm)).toBe("Reaper 4+")
        })
    })

    describe("getLfmPostedTimestamp", () => {
        it("returns new Date() when no activity", () => {
            const lfm = makeLfm({ activity: null })
            const result = getLfmPostedTimestamp(lfm)
            expect(result).toBeInstanceOf(Date)
        })

        it("returns timestamp of posted event", () => {
            const lfm = makeLfm({
                activity: [
                    {
                        timestamp: "2024-01-15T10:00:00Z",
                        events: [{ tag: "posted", data: {} }],
                    },
                ],
            })
            const result = getLfmPostedTimestamp(lfm)
            expect(result.toISOString()).toBe("2024-01-15T10:00:00.000Z")
        })
    })

    describe("getLfmActivityEventsFlatMap", () => {
        it("returns empty array when no activity", () => {
            expect(getLfmActivityEventsFlatMap(makeLfm({ activity: null }))).toEqual([])
        })

        it("flattens activity events", () => {
            const lfm = makeLfm({
                activity: [
                    {
                        timestamp: "2024-01-15T10:00:00Z",
                        events: [
                            { tag: "posted", data: {} },
                            { tag: "joined", data: { name: "Player" } },
                        ],
                    },
                ],
            })
            const result = getLfmActivityEventsFlatMap(lfm)
            expect(result).toHaveLength(2)
            expect(result[0].tag).toBe("posted")
            expect(result[1].tag).toBe("joined")
        })
    })
})
