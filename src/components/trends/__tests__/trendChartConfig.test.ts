import { trendAxisBottom } from "../trendChartConfig"

describe("trendAxisBottom", () => {
    it("scales the 'all' tick spacing with the span", () => {
        expect(trendAxisBottom("all", "week", false, 12).tickValues).toBe(
            "every 1 month"
        )
        expect(trendAxisBottom("all", "week", false, 18).tickValues).toBe(
            "every 3 months"
        )
        const long = trendAxisBottom("all", "month", false, 84)
        expect(long.tickValues).toBe("every 1 year")
        expect(long.format).toBe("%Y")
        expect(trendAxisBottom("all", "week", true, 18).tickValues).toBe(
            "every 6 months"
        )
    })

    it("keeps fixed spacing for the other ranges", () => {
        expect(trendAxisBottom("year", "day", false, 12).tickValues).toBe(
            "every 1 month"
        )
        expect(trendAxisBottom("week", "hour", false).legend).toBe(
            "Time (your timezone)"
        )
    })
})
