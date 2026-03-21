import { getActiveTimer } from "../timerUtils"

describe("timerUtils", () => {
    describe("getActiveTimer", () => {
        const character = { id: 1 } as any

        it("returns undefined when no activities match", () => {
            const result = getActiveTimer(character, 100, [])
            expect(result).toBeUndefined()
        })

        it("returns undefined when activity is for different character", () => {
            const activity = {
                character_id: 2,
                timestamp: new Date().toISOString(),
                data: { quest_ids: [100] },
            } as any
            const result = getActiveTimer(character, 100, [activity])
            expect(result).toBeUndefined()
        })

        it("returns undefined when activity is for different quest", () => {
            const activity = {
                character_id: 1,
                timestamp: new Date().toISOString(),
                data: { quest_ids: [200] },
            } as any
            const result = getActiveTimer(character, 100, [activity])
            expect(result).toBeUndefined()
        })

        it("returns undefined when timer has expired", () => {
            const longAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
            const activity = {
                character_id: 1,
                timestamp: longAgo,
                data: { quest_ids: [100] },
            } as any
            const result = getActiveTimer(character, 100, [activity])
            expect(result).toBeUndefined()
        })

        it("returns the matching active timer", () => {
            const recentTimestamp = new Date().toISOString()
            const activity = {
                character_id: 1,
                timestamp: recentTimestamp,
                data: { quest_ids: [100] },
            } as any
            const result = getActiveTimer(character, 100, [activity])
            expect(result).toBe(activity)
        })

        it("returns the most recent matching timer", () => {
            const now = Date.now()
            const older = {
                character_id: 1,
                timestamp: new Date(now - 1000).toISOString(),
                data: { quest_ids: [100] },
            } as any
            const newer = {
                character_id: 1,
                timestamp: new Date(now).toISOString(),
                data: { quest_ids: [100] },
            } as any
            const result = getActiveTimer(character, 100, [older, newer])
            expect(result).toBe(newer)
        })
    })
})
