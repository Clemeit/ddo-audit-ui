import { buildRacePie } from "../racePieBuilder"
import { ServerFilterEnum } from "../../models/Common"

describe("racePieBuilder", () => {
    it("returns empty result for undefined demographic", () => {
        const result = buildRacePie(undefined, ServerFilterEnum.ALL)
        expect(result).toEqual({ data: [], total: 0 })
    })

    it("aggregates race counts across servers", () => {
        const data = {
            Argonnessen: { Human: 50, Elf: 30 },
            Cannith: { Human: 20, Dwarf: 10 },
        } as any
        const result = buildRacePie(data, ServerFilterEnum.ALL)
        expect(result.total).toBe(110)
        expect(result.data.find((s) => s.id === "Human")?.value).toBe(70)
    })

    it("excludes races containing 'unknown'", () => {
        const data = {
            Argonnessen: { Unknown: 100, Human: 10 },
        } as any
        const result = buildRacePie(data, ServerFilterEnum.ALL)
        expect(result.total).toBe(10)
        expect(result.data.find((s) => s.id === "Unknown")).toBeUndefined()
    })
})
