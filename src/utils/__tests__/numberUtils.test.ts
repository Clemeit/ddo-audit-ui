import { areArraysEqual, clamp } from "../numberUtils"

describe("numberUtils", () => {
    describe("areArraysEqual", () => {
        it("returns true for identical arrays", () => {
            expect(areArraysEqual([1, 2, 3], [1, 2, 3])).toBe(true)
        })

        it("returns true for same elements in different order", () => {
            expect(areArraysEqual([3, 2, 1], [1, 2, 3])).toBe(true)
        })

        it("returns false for different lengths", () => {
            expect(areArraysEqual([1, 2], [1, 2, 3])).toBe(false)
        })

        it("returns true for empty arrays", () => {
            expect(areArraysEqual([], [])).toBe(true)
        })

        it("returns false when elements differ", () => {
            expect(areArraysEqual([1, 2, 3], [1, 2, 4])).toBe(false)
        })
    })

    describe("clamp", () => {
        it("returns value when within range", () => {
            expect(clamp(5, 0, 10)).toBe(5)
        })

        it("returns min when value is below range", () => {
            expect(clamp(-5, 0, 10)).toBe(0)
        })

        it("returns max when value is above range", () => {
            expect(clamp(15, 0, 10)).toBe(10)
        })

        it("returns min for NaN", () => {
            expect(clamp(NaN, 0, 10)).toBe(0)
        })

        it("returns min for Infinity (non-finite falls to min)", () => {
            expect(clamp(Infinity, 0, 10)).toBe(0)
        })

        it("returns min for negative Infinity", () => {
            expect(clamp(-Infinity, 0, 10)).toBe(0)
        })

        it("returns exact boundary values", () => {
            expect(clamp(0, 0, 10)).toBe(0)
            expect(clamp(10, 0, 10)).toBe(10)
        })
    })
})
