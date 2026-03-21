import { getGuilds, getGuildByName } from "../guildService"
import { getRequest } from "../apiHelper"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
}))

const mockedGetRequest = getRequest as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe("guildService", () => {
    describe("getGuilds", () => {
        it("calls guilds endpoint with no params when none provided", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getGuilds()
            expect(mockedGetRequest).toHaveBeenCalledWith("guilds", expect.objectContaining({
                params: {},
            }))
        })

        it("includes guild name in params when provided", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getGuilds("TestGuild")
            expect(mockedGetRequest).toHaveBeenCalledWith("guilds", expect.objectContaining({
                params: expect.objectContaining({ name: "TestGuild" }),
            }))
        })

        it("includes server name in params when provided", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getGuilds(undefined, "Thelanis")
            expect(mockedGetRequest).toHaveBeenCalledWith("guilds", expect.objectContaining({
                params: expect.objectContaining({ server: "Thelanis" }),
            }))
        })

        it("includes page param only when page > 1", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getGuilds(undefined, undefined, 2)
            expect(mockedGetRequest).toHaveBeenCalledWith("guilds", expect.objectContaining({
                params: expect.objectContaining({ page: 2 }),
            }))
        })

        it("does not include page param when page is 1", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getGuilds(undefined, undefined, 1)
            const params = mockedGetRequest.mock.calls[0][1].params
            expect(params.page).toBeUndefined()
        })

        it("does not include page param when page is 0", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getGuilds(undefined, undefined, 0)
            const params = mockedGetRequest.mock.calls[0][1].params
            expect(params.page).toBeUndefined()
        })
    })

    describe("getGuildByName", () => {
        it("builds path with serverName and guildName", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getGuildByName("Thelanis", "MyGuild")
            expect(mockedGetRequest).toHaveBeenCalledWith(
                "guilds/Thelanis/MyGuild",
                expect.any(Object)
            )
        })
    })
})
