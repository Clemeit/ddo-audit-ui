import { buildLevelDistributionSeries } from "../levelDistributionBuilder"
import { ServerFilterEnum } from "../../models/Common"

describe("levelDistributionBuilder", () => {
    it("returns empty array for undefined data", () => {
        expect(buildLevelDistributionSeries(undefined, ServerFilterEnum.ALL, false)).toEqual([])
    })

    it("builds raw series for a single server", () => {
        const data = {
            Argonnessen: { "1": 10, "5": 20, "34": 5 },
        } as any
        const result = buildLevelDistributionSeries(data, ServerFilterEnum.ALL, false)
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe("Argonnessen")
        expect(result[0].data).toHaveLength(3)
        expect(result[0].data.find((d) => d.x === 1)?.y).toBe(10)
    })

    it("filters out levels outside MIN_LEVEL..MAX_LEVEL", () => {
        const data = {
            Argonnessen: { "0": 100, "1": 10, "35": 50 },
        } as any
        const result = buildLevelDistributionSeries(data, ServerFilterEnum.ALL, false)
        expect(result[0].data).toHaveLength(1) // only level 1
    })

    it("normalizes values when normalized=true", () => {
        const data = {
            Argonnessen: { "1": 25, "2": 75 },
        } as any
        const result = buildLevelDistributionSeries(data, ServerFilterEnum.ALL, true)
        expect(result[0].data.find((d) => d.x === 1)?.y).toBeCloseTo(0.25)
        expect(result[0].data.find((d) => d.x === 2)?.y).toBeCloseTo(0.75)
    })

    it("filters by 64-bit servers", () => {
        const data = {
            Cormyr: { "1": 30 },
            Argonnessen: { "1": 20 },
        } as any
        const result = buildLevelDistributionSeries(data, ServerFilterEnum.ONLY_64_BIT, false)
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe("Cormyr")
    })
})
