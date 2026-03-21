import {
    getPopulationTimeseriesForRange,
    getTotalPopulationForRange,
    getUniquePopulationForRange,
    getAveragePopulationForRange,
    getPopulationByHourForRange,
    getPopulationByDayOfWeekForRange,
    getPopulationByHourAndDayOfWeekForRange,
} from "../populationService"
import { getRequest } from "../apiHelper"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
}))

const mockedGetRequest = getRequest as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe("populationService", () => {
    const cases: [string, Function, string][] = [
        ["getPopulationTimeseriesForRange", getPopulationTimeseriesForRange, "timeseries"],
        ["getTotalPopulationForRange", getTotalPopulationForRange, "totals"],
        ["getUniquePopulationForRange", getUniquePopulationForRange, "unique"],
        ["getAveragePopulationForRange", getAveragePopulationForRange, "average"],
        ["getPopulationByHourForRange", getPopulationByHourForRange, "by-hour"],
        ["getPopulationByDayOfWeekForRange", getPopulationByDayOfWeekForRange, "by-day-of-week"],
        ["getPopulationByHourAndDayOfWeekForRange", getPopulationByHourAndDayOfWeekForRange, "by-hour-and-day-of-week"],
    ]

    it.each(cases)("%s defaults to quarter range", async (_, fn, metric) => {
        mockedGetRequest.mockResolvedValue({})
        await (fn as Function)()
        expect(mockedGetRequest).toHaveBeenCalledWith(
            `population/${metric}/quarter`,
            expect.any(Object)
        )
    })

    it.each(cases)("%s uses custom range when provided", async (_, fn, metric) => {
        mockedGetRequest.mockResolvedValue({})
        await (fn as Function)("week")
        expect(mockedGetRequest).toHaveBeenCalledWith(
            `population/${metric}/week`,
            expect.any(Object)
        )
    })
})
