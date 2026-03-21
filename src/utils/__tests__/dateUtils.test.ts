import {
    dateToLongString,
    dateToLongStringWithTime,
    dateToShortStringWithTime,
    numberToDayOfWeek,
    dayOfWeekToNumber,
    numberToHourOfDay,
} from "../dateUtils"

describe("dateUtils", () => {
    describe("dateToLongString", () => {
        it("returns formatted date for valid input", () => {
            const date = new Date("2024-03-15T12:00:00Z")
            const result = dateToLongString(date)
            expect(result).toContain("2024")
            expect(result).toContain("March")
            expect(result).toContain("15")
        })

        it("returns 'Unknown date' for undefined", () => {
            expect(dateToLongString(undefined)).toBe("Unknown date")
        })

        it("returns 'Invalid date' for invalid Date", () => {
            expect(dateToLongString(new Date("invalid"))).toBe("Invalid date")
        })
    })

    describe("dateToLongStringWithTime", () => {
        it("returns 'Unknown date' for undefined", () => {
            expect(dateToLongStringWithTime(undefined)).toBe("Unknown date")
        })

        it("returns 'Invalid date' for invalid Date", () => {
            expect(dateToLongStringWithTime(new Date("invalid"))).toBe("Invalid date")
        })

        it("includes time components for valid date", () => {
            const date = new Date("2024-03-15T14:30:45Z")
            const result = dateToLongStringWithTime(date)
            expect(result).toContain("2024")
        })
    })

    describe("dateToShortStringWithTime", () => {
        it("returns 'Unknown date' for undefined", () => {
            expect(dateToShortStringWithTime(undefined)).toBe("Unknown date")
        })

        it("returns 'Invalid date' for invalid Date", () => {
            expect(dateToShortStringWithTime(new Date("invalid"))).toBe("Invalid date")
        })
    })

    describe("numberToDayOfWeek", () => {
        it("maps 0 to Sunday", () => {
            expect(numberToDayOfWeek(0)).toBe("Sunday")
        })

        it("maps 6 to Saturday", () => {
            expect(numberToDayOfWeek(6)).toBe("Saturday")
        })

        it("returns 'Unknown' for out-of-range values", () => {
            expect(numberToDayOfWeek(7)).toBe("Unknown")
            expect(numberToDayOfWeek(-1)).toBe("Unknown")
        })
    })

    describe("dayOfWeekToNumber", () => {
        it("returns 0 for Sunday", () => {
            expect(dayOfWeekToNumber("Sunday")).toBe(0)
        })

        it("is case-insensitive", () => {
            expect(dayOfWeekToNumber("SUNDAY")).toBe(0)
            expect(dayOfWeekToNumber("sunday")).toBe(0)
        })

        it("returns -1 for unknown day", () => {
            expect(dayOfWeekToNumber("Funday")).toBe(-1)
        })
    })

    describe("numberToHourOfDay", () => {
        it("formats 0 as 12 AM", () => {
            const result = numberToHourOfDay(0)
            expect(result).toMatch(/12\s*AM/i)
        })

        it("formats 12 as 12 PM", () => {
            const result = numberToHourOfDay(12)
            expect(result).toMatch(/12\s*PM/i)
        })

        it("formats 13 as 1 PM", () => {
            const result = numberToHourOfDay(13)
            expect(result).toMatch(/1\s*PM/i)
        })
    })
})
