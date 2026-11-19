import { latePushAge } from "../pushAge"

const now = Date.parse("2026-11-19T22:00:00Z")
const ago = (ms: number) => new Date(now - ms).toISOString()

describe("latePushAge", () => {
    it("treats pushes under a minute old as on time", () => {
        expect(latePushAge(ago(0), now)).toBeNull()
        expect(latePushAge(ago(59_000), now)).toBeNull()
    })

    it("labels late pushes in minutes, then hours", () => {
        expect(latePushAge(ago(60_000), now)).toBe("1 min ago")
        expect(latePushAge(ago(4 * 60_000 + 30_000), now)).toBe("4 min ago")
        expect(latePushAge(ago(2 * 3_600_000), now)).toBe("2 h ago")
    })

    it("ignores missing or invalid times", () => {
        expect(latePushAge(undefined, now)).toBeNull()
        expect(latePushAge("not a date", now)).toBeNull()
    })
})
