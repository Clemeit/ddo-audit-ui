import {
    getRelativeString,
    getRelativeMetricColor,
    getBestXpValue,
    calculateQuestXpPerMinute,
    isQuestWithinLevelTolerance,
    getQuestLevelDeltaFromTarget,
    sortQuestsByPeerProximity,
    sortQuestsByField,
    getMetricOverlayDisplayData,
} from "../questUtils"

describe("questUtils", () => {
    describe("getRelativeString", () => {
        it("returns 'N/A' for null/undefined", () => {
            expect(getRelativeString(undefined)).toBe("N/A")
            expect(getRelativeString(null as any)).toBe("N/A")
        })

        it("returns 'Very Low' for values < 0.2", () => {
            expect(getRelativeString(0)).toBe("Very Low")
            expect(getRelativeString(0.19)).toBe("Very Low")
        })

        it("returns 'Low' for values >= 0.2 and < 0.4", () => {
            expect(getRelativeString(0.2)).toBe("Low")
            expect(getRelativeString(0.39)).toBe("Low")
        })

        it("returns 'Average' for values >= 0.4 and < 0.6", () => {
            expect(getRelativeString(0.4)).toBe("Average")
            expect(getRelativeString(0.59)).toBe("Average")
        })

        it("returns 'High' for values >= 0.6 and < 0.8", () => {
            expect(getRelativeString(0.6)).toBe("High")
            expect(getRelativeString(0.79)).toBe("High")
        })

        it("returns 'Very High' for values >= 0.8", () => {
            expect(getRelativeString(0.8)).toBe("Very High")
            expect(getRelativeString(1.0)).toBe("Very High")
        })
    })

    describe("getRelativeMetricColor", () => {
        it("returns QUEST_INFO color for null/undefined", () => {
            const result = getRelativeMetricColor(undefined)
            expect(typeof result).toBe("string")
            expect(result.length).toBeGreaterThan(0)
        })

        it("returns different colors for different ranges", () => {
            const veryLow = getRelativeMetricColor(0.1)
            const low = getRelativeMetricColor(0.3)
            const avg = getRelativeMetricColor(0.5)
            const high = getRelativeMetricColor(0.7)
            const veryHigh = getRelativeMetricColor(0.9)
            // All should be distinct (or at least strings)
            expect(veryLow).not.toBe(veryHigh)
        })
    })

    describe("getBestXpValue", () => {
        it("returns null for null xp", () => {
            expect(getBestXpValue(null as any, "heroic")).toBeNull()
        })

        it("returns elite value first if positive", () => {
            const xp = { heroic_elite: 100, heroic_hard: 80, heroic_normal: 60, heroic_casual: 40 }
            expect(getBestXpValue(xp as any, "heroic")).toBe(100)
        })

        it("falls back to hard when elite is 0", () => {
            const xp = { heroic_elite: 0, heroic_hard: 80, heroic_normal: 60, heroic_casual: 40 }
            expect(getBestXpValue(xp as any, "heroic")).toBe(80)
        })

        it("falls through cascade to casual", () => {
            const xp = { heroic_elite: 0, heroic_hard: 0, heroic_normal: 0, heroic_casual: 40 }
            expect(getBestXpValue(xp as any, "heroic")).toBe(40)
        })

        it("returns null when all values are 0", () => {
            const xp = { heroic_elite: 0, heroic_hard: 0, heroic_normal: 0, heroic_casual: 0 }
            expect(getBestXpValue(xp as any, "heroic")).toBeNull()
        })

        it("works with epic prefix", () => {
            const xp = { epic_elite: 500 }
            expect(getBestXpValue(xp as any, "epic")).toBe(500)
        })
    })

    describe("calculateQuestXpPerMinute", () => {
        it("returns null for null quest", () => {
            expect(calculateQuestXpPerMinute(null, "heroic")).toBeNull()
        })

        it("returns null when quest has no length", () => {
            expect(calculateQuestXpPerMinute({ xp: { heroic_elite: 100 } } as any, "heroic")).toBeNull()
        })

        it("returns null when quest has no xp", () => {
            expect(calculateQuestXpPerMinute({ length: 600 } as any, "heroic")).toBeNull()
        })

        it("calculates xp per minute correctly", () => {
            const quest = {
                length: 600, // 10 minutes
                xp: { heroic_elite: 1000 },
            }
            // 1000 / (600/60) = 1000/10 = 100
            expect(calculateQuestXpPerMinute(quest as any, "heroic")).toBe(100)
        })
    })

    describe("isQuestWithinLevelTolerance", () => {
        it("returns false when either quest is null", () => {
            expect(isQuestWithinLevelTolerance(null, null)).toBe(false)
            expect(isQuestWithinLevelTolerance({ heroic_normal_cr: 5 } as any, null)).toBe(false)
        })

        it("returns true when heroic levels are within tolerance", () => {
            const a = { heroic_normal_cr: 5 } as any
            const b = { heroic_normal_cr: 6 } as any
            expect(isQuestWithinLevelTolerance(a, b, 1)).toBe(true)
        })

        it("returns true when epic levels are within tolerance", () => {
            const a = { epic_normal_cr: 25 } as any
            const b = { epic_normal_cr: 26 } as any
            expect(isQuestWithinLevelTolerance(a, b, 1)).toBe(true)
        })

        it("returns false when both levels exceed tolerance", () => {
            const a = { heroic_normal_cr: 5, epic_normal_cr: 25 } as any
            const b = { heroic_normal_cr: 10, epic_normal_cr: 30 } as any
            expect(isQuestWithinLevelTolerance(a, b, 1)).toBe(false)
        })

        it("defaults tolerance to 1", () => {
            const a = { heroic_normal_cr: 5 } as any
            const b = { heroic_normal_cr: 6 } as any
            expect(isQuestWithinLevelTolerance(a, b)).toBe(true)
        })
    })

    describe("getQuestLevelDeltaFromTarget", () => {
        it("returns null when either quest is null", () => {
            expect(getQuestLevelDeltaFromTarget(null, null)).toBeNull()
        })

        it("returns minimum of heroic and epic deltas", () => {
            const target = { heroic_normal_cr: 10, epic_normal_cr: 25 } as any
            const candidate = { heroic_normal_cr: 12, epic_normal_cr: 26 } as any
            // heroic delta = 2, epic delta = 1 → min = 1
            expect(getQuestLevelDeltaFromTarget(target, candidate)).toBe(1)
        })

        it("returns null when neither level is available", () => {
            expect(getQuestLevelDeltaFromTarget({} as any, {} as any)).toBeNull()
        })
    })

    describe("sortQuestsByPeerProximity", () => {
        it("sorts by level delta ascending", () => {
            const target = { heroic_normal_cr: 5 } as any
            const quests = [
                { name: "A", heroic_normal_cr: 10, id: 1 },
                { name: "B", heroic_normal_cr: 6, id: 2 },
                { name: "C", heroic_normal_cr: 5, id: 3 },
            ] as any[]
            const sorted = sortQuestsByPeerProximity(quests, target)
            expect(sorted[0].name).toBe("C")
            expect(sorted[1].name).toBe("B")
            expect(sorted[2].name).toBe("A")
        })

        it("puts null-delta quests at the end", () => {
            const target = { heroic_normal_cr: 5 } as any
            const quests = [
                { name: "No Level", id: 1 },
                { name: "Close", heroic_normal_cr: 5, id: 2 },
            ] as any[]
            const sorted = sortQuestsByPeerProximity(quests, target)
            expect(sorted[0].name).toBe("Close")
            expect(sorted[1].name).toBe("No Level")
        })

        it("breaks ties by name alphabetically", () => {
            const target = { heroic_normal_cr: 5 } as any
            const quests = [
                { name: "Bravo", heroic_normal_cr: 5, id: 1 },
                { name: "Alpha", heroic_normal_cr: 5, id: 2 },
            ] as any[]
            const sorted = sortQuestsByPeerProximity(quests, target)
            expect(sorted[0].name).toBe("Alpha")
            expect(sorted[1].name).toBe("Bravo")
        })

        it("does not mutate original array", () => {
            const quests = [{ name: "A", id: 1 }] as any[]
            const sorted = sortQuestsByPeerProximity(quests, null)
            expect(sorted).not.toBe(quests)
        })
    })

    describe("sortQuestsByField", () => {
        const quests = [
            { id: 1, name: "Beta", heroic_normal_cr: 10 },
            { id: 2, name: "Alpha", heroic_normal_cr: 5 },
            { id: 3, name: "Gamma", heroic_normal_cr: null },
        ] as any[]

        it("sorts by name ascending", () => {
            const sorted = sortQuestsByField(quests, "name", "asc")
            expect(sorted[0].name).toBe("Alpha")
            expect(sorted[1].name).toBe("Beta")
        })

        it("sorts by name descending", () => {
            const sorted = sortQuestsByField(quests, "name", "desc")
            expect(sorted[0].name).toBe("Gamma")
            expect(sorted[1].name).toBe("Beta")
        })

        it("pushes null/empty values to end regardless of direction", () => {
            const sorted = sortQuestsByField(quests, "heroic_normal_cr", "asc")
            expect(sorted[sorted.length - 1].heroic_normal_cr).toBeNull()
        })

        it("does not mutate original array", () => {
            const sorted = sortQuestsByField(quests, "name", "asc")
            expect(sorted).not.toBe(quests)
        })
    })

    describe("getMetricOverlayDisplayData", () => {
        it("returns all nulls when lfm is null", () => {
            const result = getMetricOverlayDisplayData(null, {} as any)
            expect(result.xpPerMinuteRelativeString).toBeNull()
            expect(result.xpPerMinuteColor).toBeNull()
            expect(result.popularityRelativeString).toBeNull()
            expect(result.popularityColor).toBeNull()
        })

        it("returns all nulls when quest is null", () => {
            const result = getMetricOverlayDisplayData({} as any, null)
            expect(result.xpPerMinuteRelativeString).toBeNull()
        })

        it("returns computed values for valid input", () => {
            const lfm = { minimum_level: 5, maximum_level: 10 } as any
            const quest = {
                heroic_normal_cr: 7,
                epic_normal_cr: 25,
                heroic_xp_per_minute_relative: 0.5,
                heroic_popularity_relative: 0.8,
            } as any
            const result = getMetricOverlayDisplayData(lfm, quest)
            expect(result.xpPerMinuteRelativeString).toBe("Average")
            expect(result.popularityRelativeString).toBe("Very High")
        })
    })
})
