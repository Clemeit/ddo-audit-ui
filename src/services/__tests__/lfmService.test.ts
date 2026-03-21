import { getAllLfms, getLfmsByServerName } from "../lfmService"
import { getRequest } from "../apiHelper"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
}))

const mockedGetRequest = getRequest as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe("lfmService", () => {
    it("getAllLfms calls lfms endpoint", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getAllLfms()
        expect(mockedGetRequest).toHaveBeenCalledWith("lfms")
    })

    it("getLfmsByServerName lowercases the server name", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getLfmsByServerName("Thelanis")
        expect(mockedGetRequest).toHaveBeenCalledWith("lfms/thelanis")
    })

    it("getLfmsByServerName handles already-lowercase name", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getLfmsByServerName("thelanis")
        expect(mockedGetRequest).toHaveBeenCalledWith("lfms/thelanis")
    })
})
