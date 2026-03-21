import { MsFromSeconds, MsFromMinutes, MsFromHours, MsFromDays } from "../timeUtils"

describe("timeUtils", () => {
    it("MsFromSeconds converts correctly", () => {
        expect(MsFromSeconds(1)).toBe(1000)
        expect(MsFromSeconds(0)).toBe(0)
        expect(MsFromSeconds(5)).toBe(5000)
    })

    it("MsFromMinutes converts correctly", () => {
        expect(MsFromMinutes(1)).toBe(60000)
        expect(MsFromMinutes(0)).toBe(0)
    })

    it("MsFromHours converts correctly", () => {
        expect(MsFromHours(1)).toBe(3600000)
        expect(MsFromHours(0)).toBe(0)
    })

    it("MsFromDays converts correctly", () => {
        expect(MsFromDays(1)).toBe(86400000)
        expect(MsFromDays(0)).toBe(0)
    })
})
