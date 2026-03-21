import { buildPrimaryClassPie } from "../primaryClassPieBuilder"
import { ServerFilterEnum } from "../../models/Common"

describe("primaryClassPieBuilder", () => {
    it("returns empty result for undefined demographic", () => {
        const result = buildPrimaryClassPie(undefined, ServerFilterEnum.ALL)
        expect(result).toEqual({ data: [], total: 0 })
    })

    it("aggregates primary class counts across servers", () => {
        const data = {
            Argonnessen: { Fighter: 50, Ranger: 30 },
            Cannith: { Fighter: 20, Wizard: 10 },
        } as any
        const result = buildPrimaryClassPie(data, ServerFilterEnum.ALL)
        expect(result.total).toBe(110)
        expect(result.data.find((s) => s.id === "Fighter")?.value).toBe(70)
    })

    it("excludes 'None' class", () => {
        const data = {
            Argonnessen: { None: 100, Fighter: 10 },
        } as any
        const result = buildPrimaryClassPie(data, ServerFilterEnum.ALL)
        expect(result.total).toBe(10)
        expect(result.data.find((s) => s.id === "None")).toBeUndefined()
    })
})
