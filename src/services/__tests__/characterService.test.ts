import {
    getCharacterByNameAndServer,
    getCharacterById,
    getCharactersByIds,
    getCharacterByName,
    getOnlineCharactersByGuildName,
    getCharactersByGroupId,
} from "../characterService"
import { getRequest } from "../apiHelper"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
}))

const mockedGetRequest = getRequest as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe("characterService", () => {
    it("getCharacterByNameAndServer builds path with server and name", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getCharacterByNameAndServer("Clemeit", "Thelanis")
        expect(mockedGetRequest).toHaveBeenCalledWith("characters/Thelanis/Clemeit")
    })

    it("getCharacterByName builds path with any/{name}", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getCharacterByName("Clemeit")
        expect(mockedGetRequest).toHaveBeenCalledWith("characters/any/Clemeit")
    })

    it("getCharacterById builds path with id", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getCharacterById("123")
        expect(mockedGetRequest).toHaveBeenCalledWith("characters/123")
    })

    it("getCharactersByIds joins IDs with comma in path", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getCharactersByIds([1, 2, 3])
        expect(mockedGetRequest).toHaveBeenCalledWith(
            "characters/ids/1,2,3",
            undefined
        )
    })

    it("getCharactersByIds forwards signal option", async () => {
        mockedGetRequest.mockResolvedValue({})
        const controller = new AbortController()
        await getCharactersByIds([1], { signal: controller.signal })
        expect(mockedGetRequest).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ signal: controller.signal })
        )
    })

    it("getOnlineCharactersByGuildName builds path with guild name", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getOnlineCharactersByGuildName("TestGuild")
        expect(mockedGetRequest).toHaveBeenCalledWith(
            "characters/by-guild-name/TestGuild",
            undefined
        )
    })

    it("getCharactersByGroupId builds path with group id", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getCharactersByGroupId(42)
        expect(mockedGetRequest).toHaveBeenCalledWith("characters/by-group-id/42")
    })
})
