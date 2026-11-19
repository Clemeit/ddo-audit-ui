import { expiryFromPreset, formatExpiry, isExpired } from "../alertExpiry"

const now = Date.parse("2026-11-19T20:00:00Z")
const inMs = (ms: number) => new Date(now + ms).toISOString()
const HOUR = 3_600_000

describe("expiryFromPreset", () => {
    it("computes an end time from now", () => {
        expect(expiryFromPreset("3h", null, now)).toBe(inMs(3 * HOUR))
        expect(expiryFromPreset("7d", null, now)).toBe(inMs(7 * 24 * HOUR))
    })

    it("never clears it, keep leaves it", () => {
        expect(expiryFromPreset("never", inMs(HOUR), now)).toBeNull()
        expect(expiryFromPreset("keep", inMs(HOUR), now)).toBe(inMs(HOUR))
    })
})

describe("formatExpiry", () => {
    it("describes the time left", () => {
        expect(formatExpiry(inMs(10 * 60_000), now)).toBe("Ends in 10m")
        expect(formatExpiry(inMs(3 * HOUR), now)).toBe("Ends in 3h")
        expect(formatExpiry(inMs(7 * 24 * HOUR), now)).toBe("Ends in 7d")
    })

    it("marks past times as expired and ignores missing ones", () => {
        expect(formatExpiry(inMs(-1), now)).toBe("Expired")
        expect(formatExpiry(null, now)).toBeNull()
        expect(formatExpiry("nope", now)).toBeNull()
    })
})

describe("isExpired", () => {
    it("is true only for past times", () => {
        expect(isExpired(inMs(-1), now)).toBe(true)
        expect(isExpired(inMs(1), now)).toBe(false)
        expect(isExpired(null, now)).toBe(false)
    })
})
