import {
    filterServers,
    hourlyPopulationToSeries,
    buildUtcToLocalHourMap,
    remapUtcToLocalHours,
} from "../hourlyPopulationBuilder"
import { DataTypeFilterEnum, ServerFilterEnum } from "../../models/Common"

describe("hourlyPopulationBuilder", () => {
    describe("filterServers", () => {
        const data = {
            Cormyr: { 0: { avg_character_count: 10, avg_lfm_count: 1 } },
            Argonnessen: { 0: { avg_character_count: 20, avg_lfm_count: 2 } },
        } as any

        it("returns all servers for ALL filter", () => {
            const result = filterServers(data, ServerFilterEnum.ALL)
            expect(Object.keys(result!)).toHaveLength(2)
        })

        it("filters to 64-bit only", () => {
            const result = filterServers(data, ServerFilterEnum.ONLY_64_BIT)
            expect(Object.keys(result!)).toEqual(["Cormyr"])
        })

        it("filters to 32-bit only", () => {
            const result = filterServers(data, ServerFilterEnum.ONLY_32_BIT)
            expect(Object.keys(result!)).toEqual(["Argonnessen"])
        })

        it("returns undefined for undefined data", () => {
            expect(filterServers(undefined, ServerFilterEnum.ALL)).toBeUndefined()
        })
    })

    describe("hourlyPopulationToSeries", () => {
        it("returns empty array for undefined data", () => {
            expect(hourlyPopulationToSeries(undefined, DataTypeFilterEnum.CHARACTERS)).toEqual([])
        })

        it("converts hours data to series for characters", () => {
            const data = {
                Argonnessen: {
                    0: { avg_character_count: 100, avg_lfm_count: 10 },
                    12: { avg_character_count: 200, avg_lfm_count: 20 },
                },
            } as any
            const result = hourlyPopulationToSeries(data, DataTypeFilterEnum.CHARACTERS)
            expect(result).toHaveLength(1)
            expect(result[0].id).toBe("Argonnessen")
            expect(result[0].data).toHaveLength(2)
            expect(result[0].data[0].y).toBe(100) // sorted by x
        })

        it("uses lfm_count for LFMS data type", () => {
            const data = {
                Argonnessen: {
                    0: { avg_character_count: 100, avg_lfm_count: 10 },
                },
            } as any
            const result = hourlyPopulationToSeries(data, DataTypeFilterEnum.LFMS)
            expect(result[0].data[0].y).toBe(10)
        })

        it("sorts data by hour", () => {
            const data = {
                Argonnessen: {
                    12: { avg_character_count: 200, avg_lfm_count: 20 },
                    0: { avg_character_count: 100, avg_lfm_count: 10 },
                    6: { avg_character_count: 150, avg_lfm_count: 15 },
                },
            } as any
            const result = hourlyPopulationToSeries(data, DataTypeFilterEnum.CHARACTERS)
            expect(result[0].data[0].x).toBe(0)
            expect(result[0].data[1].x).toBe(6)
            expect(result[0].data[2].x).toBe(12)
        })
    })

    describe("buildUtcToLocalHourMap", () => {
        it("returns 24-element array for UTC", () => {
            const map = buildUtcToLocalHourMap("UTC")
            expect(map).toHaveLength(24)
            // UTC should map hour 0 to 0
            expect(map[0]).toBe(0)
            expect(map[12]).toBe(12)
        })
    })

    describe("remapUtcToLocalHours", () => {
        it("returns undefined for undefined data", () => {
            expect(remapUtcToLocalHours(undefined, [])).toBeUndefined()
        })

        it("remaps hours using provided mapping", () => {
            // Identity mapping
            const identityMap = Array.from({ length: 24 }, (_, i) => i)
            const data = {
                Argonnessen: {
                    0: { avg_character_count: 100, avg_lfm_count: 10 },
                },
            } as any
            const result = remapUtcToLocalHours(data, identityMap)
            expect(result!.Argonnessen[0].avg_character_count).toBe(100)
        })
    })
})
