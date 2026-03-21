import { buildClassCountPie } from "../classCountPieBuilder"
import { ServerFilterEnum } from "../../models/Common"

describe("classCountPieBuilder", () => {
    it("returns empty result for undefined demographic", () => {
        const result = buildClassCountPie(undefined, ServerFilterEnum.ALL)
        expect(result).toEqual({ data: [], total: 0 })
    })

    it("aggregates class counts across servers", () => {
        const data = {
            Argonnessen: { "1": 10, "2": 20, "3": 5 },
            Cannith: { "1": 15, "2": 10 },
        } as any
        const result = buildClassCountPie(data, ServerFilterEnum.ALL)
        expect(result.total).toBe(60)
        expect(result.data.find((s) => s.id === "1")?.value).toBe(25)
        expect(result.data.find((s) => s.id === "2")?.value).toBe(30)
    })

    it("excludes class count '0'", () => {
        const data = {
            Argonnessen: { "0": 100, "1": 10 },
        } as any
        const result = buildClassCountPie(data, ServerFilterEnum.ALL)
        expect(result.total).toBe(10)
        expect(result.data.find((s) => s.id === "0")).toBeUndefined()
    })

    it("filters to only 64-bit servers", () => {
        const data = {
            Cormyr: { "1": 30 },
            Argonnessen: { "1": 20 },
        } as any
        const result = buildClassCountPie(data, ServerFilterEnum.ONLY_64_BIT)
        expect(result.total).toBe(30)
    })

    it("filters to only 32-bit servers", () => {
        const data = {
            Cormyr: { "1": 30 },
            Argonnessen: { "1": 20 },
        } as any
        const result = buildClassCountPie(data, ServerFilterEnum.ONLY_32_BIT)
        expect(result.total).toBe(20)
    })
})
