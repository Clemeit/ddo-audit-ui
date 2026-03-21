import { getServerInfo, getServerInfoByServerName } from "../gameService"
import { getRequest } from "../apiHelper"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
}))

const mockedGetRequest = getRequest as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe("gameService", () => {
    it("getServerInfo calls game/server-info endpoint", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getServerInfo()
        expect(mockedGetRequest).toHaveBeenCalledWith("game/server-info", expect.any(Object))
    })

    it("getServerInfoByServerName includes server name in path", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getServerInfoByServerName("Thelanis")
        expect(mockedGetRequest).toHaveBeenCalledWith("game/server-info/Thelanis", expect.any(Object))
    })

    it("forwards abort signal", async () => {
        mockedGetRequest.mockResolvedValue({})
        const controller = new AbortController()
        await getServerInfo(controller.signal)
        expect(mockedGetRequest).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ signal: controller.signal })
        )
    })
})
