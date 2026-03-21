import {
    getTotalLevelDemographic,
    getRaceDemographic,
    getGenderDemographic,
    getGuildAffiliatedDemographic,
    getPrimaryClassDemographic,
    getClassCountDemographic,
} from "../demographicsService"
import { getRequest } from "../apiHelper"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
}))

const mockedGetRequest = getRequest as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe("demographicsService", () => {
    const cases: [string, Function, string][] = [
        ["getTotalLevelDemographic", getTotalLevelDemographic, "total-level"],
        ["getRaceDemographic", getRaceDemographic, "race"],
        ["getGenderDemographic", getGenderDemographic, "gender"],
        ["getGuildAffiliatedDemographic", getGuildAffiliatedDemographic, "guild-affiliated"],
        ["getPrimaryClassDemographic", getPrimaryClassDemographic, "primary-class"],
        ["getClassCountDemographic", getClassCountDemographic, "class-count"],
    ]

    it.each(cases)("%s defaults to quarter range", async (_, fn, metric) => {
        mockedGetRequest.mockResolvedValue({})
        await (fn as Function)()
        expect(mockedGetRequest).toHaveBeenCalledWith(
            `demographics/${metric}/quarter`,
            expect.any(Object)
        )
    })

    it.each(cases)("%s uses custom range when provided", async (_, fn, metric) => {
        mockedGetRequest.mockResolvedValue({})
        await (fn as Function)("week")
        expect(mockedGetRequest).toHaveBeenCalledWith(
            `demographics/${metric}/week`,
            expect.any(Object)
        )
    })

    it("forwards abort signal", async () => {
        mockedGetRequest.mockResolvedValue({})
        const controller = new AbortController()
        await getTotalLevelDemographic(undefined, controller.signal)
        expect(mockedGetRequest).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ signal: controller.signal })
        )
    })
})
