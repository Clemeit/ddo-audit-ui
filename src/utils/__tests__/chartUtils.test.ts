import { getServerColor } from "../chartUtils"

describe("chartUtils", () => {
    describe("getServerColor", () => {
        it("returns a color for a known server", () => {
            expect(getServerColor("Argonnessen")).toMatch(/^hsl\(/)
        })

        it("returns white for an unknown server", () => {
            expect(getServerColor("NonExistentServer")).toBe("hsl(0, 0%, 100%)")
        })

        it("gives retired servers their own color, case-insensitively", () => {
            expect(getServerColor("Hardcore")).toBe("hsl(60, 70%, 44%)")
            expect(getServerColor("hardcore")).toBe("hsl(60, 70%, 44%)")
        })

        it("is case-insensitive via getServerIndex", () => {
            const upper = getServerColor("ARGONNESSEN")
            const lower = getServerColor("argonnessen")
            expect(upper).toBe(lower)
        })
    })
})
