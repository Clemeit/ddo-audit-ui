import { buildGuildAffiliationPie } from "../guildAffiliationPieBuilder"
import { ServerFilterEnum } from "../../models/Common"

describe("guildAffiliationPieBuilder", () => {
    it("returns empty result for undefined demographic", () => {
        const result = buildGuildAffiliationPie(undefined, ServerFilterEnum.ALL)
        expect(result).toEqual({ data: [], total: 0 })
    })

    it("aggregates guild affiliation across servers", () => {
        const data = {
            Argonnessen: { in_guild: 80, not_in_guild: 20 },
            Cannith: { in_guild: 60, not_in_guild: 40 },
        } as any
        const result = buildGuildAffiliationPie(data, ServerFilterEnum.ALL)
        expect(result.total).toBe(200)
        expect(result.data.find((s) => s.id === "in_guild")?.value).toBe(140)
    })

    it("labels in_guild as 'In Guild'", () => {
        const data = { Argonnessen: { in_guild: 10 } } as any
        const result = buildGuildAffiliationPie(data, ServerFilterEnum.ALL)
        expect(result.data[0].label).toBe("In Guild")
    })

    it("labels not_in_guild as 'Not in Guild'", () => {
        const data = { Argonnessen: { not_in_guild: 10 } } as any
        const result = buildGuildAffiliationPie(data, ServerFilterEnum.ALL)
        expect(result.data[0].label).toBe("Not in Guild")
    })
})
