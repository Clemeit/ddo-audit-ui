import { buildGenderPie } from "../genderPieBuilder"
import { ServerFilterEnum } from "../../models/Common"

describe("genderPieBuilder", () => {
    it("returns empty result for undefined demographic", () => {
        const result = buildGenderPie(undefined, ServerFilterEnum.ALL)
        expect(result).toEqual({ data: [], total: 0 })
    })

    it("aggregates gender counts across servers", () => {
        const data = {
            Argonnessen: { Male: 50, Female: 30 },
            Cannith: { Male: 20, Female: 10 },
        } as any
        const result = buildGenderPie(data, ServerFilterEnum.ALL)
        expect(result.total).toBe(110)
        expect(result.data.find((s) => s.id === "Male")?.value).toBe(70)
    })

    it("labels empty gender as 'Unknown'", () => {
        const data = {
            Argonnessen: { "": 5 },
        } as any
        const result = buildGenderPie(data, ServerFilterEnum.ALL)
        expect(result.data[0].id).toBe("Unknown")
    })

    it("filters servers by 64-bit", () => {
        const data = {
            Cormyr: { Male: 30 },
            Argonnessen: { Male: 20 },
        } as any
        const result = buildGenderPie(data, ServerFilterEnum.ONLY_64_BIT)
        expect(result.total).toBe(30)
    })
})
