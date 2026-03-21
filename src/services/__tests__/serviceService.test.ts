import { getNews, getConfig, getConfigByKey, postFeedback, postLog } from "../serviceService"
import { getRequest, postRequest } from "../apiHelper"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
    postRequest: jest.fn(),
}))

const mockedGetRequest = getRequest as jest.Mock
const mockedPostRequest = postRequest as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe("serviceService", () => {
    it("getNews calls service/news endpoint", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getNews()
        expect(mockedGetRequest).toHaveBeenCalledWith("service/news", expect.any(Object))
    })

    it("getConfig calls service/config endpoint", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getConfig()
        expect(mockedGetRequest).toHaveBeenCalledWith("service/config", expect.any(Object))
    })

    it("getConfigByKey includes key in path", async () => {
        mockedGetRequest.mockResolvedValue({})
        await getConfigByKey("some-key")
        expect(mockedGetRequest).toHaveBeenCalledWith("service/config/some-key", expect.any(Object))
    })

    it("postFeedback passes feedback data", async () => {
        mockedPostRequest.mockResolvedValue({})
        const feedback = { message: "Great site!" } as any
        await postFeedback(feedback)
        expect(mockedPostRequest).toHaveBeenCalledWith("service/feedback", expect.objectContaining({
            data: feedback,
        }))
    })

    it("postLog uses noRetry: true", async () => {
        mockedPostRequest.mockResolvedValue({})
        const log = { message: "test" } as any
        await postLog(log)
        expect(mockedPostRequest).toHaveBeenCalledWith("service/log", expect.objectContaining({
            noRetry: true,
            data: log,
        }))
    })
})
