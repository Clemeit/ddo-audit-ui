import { getQuests, getQuestAnalytics } from "../questService"
import { getRequest } from "../apiHelper"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
}))

const mockedGetRequest = getRequest as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe("questService", () => {
    describe("getQuests", () => {
        it("uses v2 API version", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getQuests()
            expect(mockedGetRequest).toHaveBeenCalledWith(
                "quests",
                expect.any(Object),
                "v2"
            )
        })

        it("passes force flag in params when provided", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getQuests({ force: true })
            expect(mockedGetRequest).toHaveBeenCalledWith(
                "quests",
                expect.objectContaining({
                    params: expect.objectContaining({ force: true }),
                }),
                "v2"
            )
        })

        it("forwards abort signal", async () => {
            mockedGetRequest.mockResolvedValue({})
            const controller = new AbortController()
            await getQuests({ signal: controller.signal })
            expect(mockedGetRequest).toHaveBeenCalledWith(
                "quests",
                expect.objectContaining({ signal: controller.signal }),
                "v2"
            )
        })
    })

    describe("getQuestAnalytics", () => {
        it("builds path with quest ID and uses v2", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getQuestAnalytics(123)
            expect(mockedGetRequest).toHaveBeenCalledWith(
                "quests/123/analytics",
                expect.any(Object),
                "v2"
            )
        })
    })
})
