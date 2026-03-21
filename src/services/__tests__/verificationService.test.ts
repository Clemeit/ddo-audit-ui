import { getVerificationChallengeByCharacterId } from "../verificationService"
import { getRequest } from "../apiHelper"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
}))

const mockedGetRequest = getRequest as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe("verificationService", () => {
    it("builds path with character_id", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getVerificationChallengeByCharacterId(42)
        expect(mockedGetRequest).toHaveBeenCalledWith("verification/42")
    })
})
