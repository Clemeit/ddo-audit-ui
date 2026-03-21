import { findMostPopulatedServer, calculateTotalPopulation } from "../gameUtils"

describe("gameUtils", () => {
    describe("findMostPopulatedServer", () => {
        it("returns the server with the highest character_count", () => {
            const data = {
                Thelanis: { character_count: 100 },
                Cannith: { character_count: 200 },
                Ghallanda: { character_count: 50 },
            } as any
            expect(findMostPopulatedServer(data)).toBe("Cannith")
        })

        it("returns empty string for empty data", () => {
            expect(findMostPopulatedServer({})).toBe("")
        })

        it("returns empty string for null/undefined data", () => {
            expect(findMostPopulatedServer(null as any)).toBe("")
            expect(findMostPopulatedServer(undefined as any)).toBe("")
        })

        it("returns the single server when only one exists", () => {
            const data = { Thelanis: { character_count: 50 } } as any
            expect(findMostPopulatedServer(data)).toBe("Thelanis")
        })
    })

    describe("calculateTotalPopulation", () => {
        it("sums character_count and lfm_count across servers", () => {
            const data = {
                Thelanis: { character_count: 100, lfm_count: 10 },
                Cannith: { character_count: 200, lfm_count: 20 },
            } as any
            expect(calculateTotalPopulation(data)).toEqual({
                totalPopulation: 300,
                totalLfmCount: 30,
            })
        })

        it("returns zeros for null data", () => {
            expect(calculateTotalPopulation(null)).toEqual({
                totalPopulation: 0,
                totalLfmCount: 0,
            })
        })

        it("returns zeros for undefined data", () => {
            expect(calculateTotalPopulation(undefined)).toEqual({
                totalPopulation: 0,
                totalLfmCount: 0,
            })
        })

        it("treats missing counts as 0", () => {
            const data = {
                Thelanis: { character_count: 100 },
                Cannith: {},
            } as any
            expect(calculateTotalPopulation(data)).toEqual({
                totalPopulation: 100,
                totalLfmCount: 0,
            })
        })
    })
})
