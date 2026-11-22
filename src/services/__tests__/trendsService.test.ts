import {
    getPopulationTrends,
    getPopulationTrendsSummary,
} from "../trendsService"
import { getRequest } from "../apiHelper"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
}))

const mockedGetRequest = getRequest as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
    mockedGetRequest.mockResolvedValue({})
})

describe("trendsService", () => {
    it("requests trends with range and bucket as query params", async () => {
        const signal = new AbortController().signal
        await getPopulationTrends("year", "week", signal)
        expect(mockedGetRequest).toHaveBeenCalledWith("population/trends", {
            params: { range: "year", bucket: "week" },
            signal,
        })
    })

    it("omits bucket when not given so the API default applies", async () => {
        await getPopulationTrends("all")
        expect(mockedGetRequest).toHaveBeenCalledWith("population/trends", {
            params: { range: "all" },
            signal: undefined,
        })
    })

    it("requests the summary", async () => {
        await getPopulationTrendsSummary()
        expect(mockedGetRequest).toHaveBeenCalledWith(
            "population/trends/summary",
            { signal: undefined }
        )
    })
})
