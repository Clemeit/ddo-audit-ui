import { getCharacterActivityById, getCharacterRaidActivityByIds } from "../activityService"
import { getRequest } from "../apiHelper"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
}))

const mockedGetRequest = getRequest as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe("activityService", () => {
    describe("getCharacterActivityById", () => {
        it("calls getRequest with the correct endpoint path", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getCharacterActivityById(42, "location" as any, "token123")
            expect(mockedGetRequest).toHaveBeenCalledWith(
                "activity/42/location",
                expect.any(Object)
            )
        })

        it("includes Authorization header with the access token", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getCharacterActivityById(1, "location" as any, "myToken")
            expect(mockedGetRequest).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: { Authorization: "myToken" },
                })
            )
        })

        it("appends startDate and endDate to params when provided", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getCharacterActivityById(1, "location" as any, "tok", "2024-01-01", "2024-12-31")
            const params: URLSearchParams = mockedGetRequest.mock.calls[0][1].params
            expect(params.get("start_date")).toBe("2024-01-01")
            expect(params.get("end_date")).toBe("2024-12-31")
        })

        it("does not append startDate/endDate when not provided", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getCharacterActivityById(1, "location" as any, "tok")
            const params: URLSearchParams = mockedGetRequest.mock.calls[0][1].params
            expect(params.has("start_date")).toBe(false)
            expect(params.has("end_date")).toBe(false)
        })

        it("appends limit to params when provided", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getCharacterActivityById(1, "location" as any, "tok", undefined, undefined, 50)
            const params: URLSearchParams = mockedGetRequest.mock.calls[0][1].params
            expect(params.get("limit")).toBe("50")
        })
    })

    describe("getCharacterRaidActivityByIds", () => {
        it("joins character IDs with comma in query params", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getCharacterRaidActivityByIds([1, 2, 3])
            const params: URLSearchParams = mockedGetRequest.mock.calls[0][1].params
            expect(params.get("character_ids")).toBe("1,2,3")
        })

        it("calls the activity/raids endpoint", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getCharacterRaidActivityByIds([10])
            expect(mockedGetRequest).toHaveBeenCalledWith(
                "activity/raids",
                expect.any(Object)
            )
        })
    })
})
