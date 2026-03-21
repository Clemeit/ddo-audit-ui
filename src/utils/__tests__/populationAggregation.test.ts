import {
    filterServers,
    aggregateHourDayToLocalDay,
    dayOfWeekDataToNivo,
} from "../populationAggregation"
import { DataTypeFilterEnum, ServerFilterEnum } from "../../models/Common"

describe("populationAggregation", () => {
    describe("filterServers", () => {
        const data = {
            Cormyr: { someData: true },
            Argonnessen: { someData: true },
        }

        it("returns all servers for ALL filter", () => {
            const result = filterServers(data, ServerFilterEnum.ALL)
            expect(Object.keys(result!)).toHaveLength(2)
        })

        it("filters to 64-bit only", () => {
            const result = filterServers(data, ServerFilterEnum.ONLY_64_BIT)
            expect(Object.keys(result!)).toEqual(["Cormyr"])
        })

        it("returns undefined for undefined data", () => {
            expect(filterServers(undefined, ServerFilterEnum.ALL)).toBeUndefined()
        })
    })

    describe("aggregateHourDayToLocalDay", () => {
        it("returns undefined for undefined input", () => {
            // identity map for UTC
            const utcMap = Array.from({ length: 7 }, (_, d) =>
                Array.from({ length: 24 }, (_, h) => ({ day: d, hour: h }))
            )
            expect(aggregateHourDayToLocalDay(undefined, utcMap)).toBeUndefined()
        })

        it("aggregates hour+day data to day-level", () => {
            const utcMap = Array.from({ length: 7 }, (_, d) =>
                Array.from({ length: 24 }, (_, h) => ({ day: d, hour: h }))
            )
            const raw = {
                Argonnessen: {
                    0: {
                        0: { avg_character_count: 100, avg_lfm_count: 10 },
                        1: { avg_character_count: 200, avg_lfm_count: 20 },
                    },
                },
            } as any
            const result = aggregateHourDayToLocalDay(raw, utcMap)
            expect(result).toBeDefined()
            expect(result!.Argonnessen).toBeDefined()
            // Day 0 should have averaged values from 2 hours
            expect(result!.Argonnessen[0].avg_character_count).toBe(150) // (100+200)/2
        })
    })

    describe("dayOfWeekDataToNivo", () => {
        it("returns empty array for undefined data", () => {
            expect(
                dayOfWeekDataToNivo(undefined, DataTypeFilterEnum.CHARACTERS, () => [])
            ).toEqual([])
        })

        it("delegates to converter function", () => {
            const mockConverter = jest.fn().mockReturnValue([{ index: "Sunday" }])
            const data = { Argonnessen: {} } as any
            const result = dayOfWeekDataToNivo(data, DataTypeFilterEnum.CHARACTERS, mockConverter)
            expect(mockConverter).toHaveBeenCalledWith(data, DataTypeFilterEnum.CHARACTERS)
            expect(result).toEqual([{ index: "Sunday" }])
        })
    })
})
