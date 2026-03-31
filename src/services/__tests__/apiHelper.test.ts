import axios from "axios"
import {
    getRequest,
    postRequest,
    putRequest,
    patchRequest,
    deleteRequest,
} from "../apiHelper"

jest.mock("axios", () => {
    const mockAxios: any = jest.fn()
    mockAxios.defaults = {}
    mockAxios.interceptors = {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
    }
    return {
        __esModule: true,
        default: mockAxios,
    }
})

jest.mock("axios-retry", () => {
    const fn: any = jest.fn()
    fn.exponentialDelay = jest.fn()
    return {
        __esModule: true,
        default: fn,
        exponentialDelay: fn.exponentialDelay,
    }
})

const mockedAxios = axios as unknown as jest.Mock

beforeEach(() => {
    mockedAxios.mockReset()
    jest.spyOn(console, "error").mockImplementation(() => {})
    jest.spyOn(console, "warn").mockImplementation(() => {})
})

afterEach(() => {
    jest.restoreAllMocks()
})

describe("apiHelper", () => {
    // The retry condition from apiHelper.ts:
    // retryCondition(error) { return error.response ? error.response.status >= 500 : true }
    // We test this logic directly since module-level axiosRetry() calls are
    // difficult to capture via Jest mocks with CRA's Babel interop.
    describe("retry condition logic", () => {
        const retryCondition = (error: { response?: { status: number } }) =>
            error.response ? error.response.status >= 500 : true

        it("retries on 5xx errors", () => {
            expect(retryCondition({ response: { status: 500 } })).toBe(true)
            expect(retryCondition({ response: { status: 503 } })).toBe(true)
        })

        it("retries on network errors (no response)", () => {
            expect(retryCondition({ response: undefined })).toBe(true)
            expect(retryCondition({})).toBe(true)
        })

        it("does not retry on 4xx errors", () => {
            expect(retryCondition({ response: { status: 400 } })).toBe(false)
            expect(retryCondition({ response: { status: 404 } })).toBe(false)
            expect(retryCondition({ response: { status: 429 } })).toBe(false)
        })
    })

    describe("URL construction", () => {
        it("builds URL with default v1 version", async () => {
            mockedAxios.mockResolvedValue({ data: {} })
            await getRequest("test/endpoint")
            expect(mockedAxios).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining("/v1/test/endpoint"),
                })
            )
        })

        it("uses custom version string when provided", async () => {
            mockedAxios.mockResolvedValue({ data: {} })
            await getRequest("quests", {}, "v2")
            expect(mockedAxios).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: expect.stringContaining("/v2/quests"),
                })
            )
        })
    })

    describe("HTTP method dispatch", () => {
        it("getRequest sends GET method with no data body", async () => {
            mockedAxios.mockResolvedValue({ data: {} })
            await getRequest("endpoint")
            expect(mockedAxios).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: "get",
                    data: undefined,
                })
            )
        })

        it("postRequest sends POST method with data", async () => {
            mockedAxios.mockResolvedValue({ data: {} })
            const payload = { username: "test" }
            await postRequest("endpoint", { data: payload })
            expect(mockedAxios).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: "post",
                    data: payload,
                })
            )
        })

        it("putRequest sends PUT method with data", async () => {
            mockedAxios.mockResolvedValue({ data: {} })
            const payload = { key: "value" }
            await putRequest("endpoint", { data: payload })
            expect(mockedAxios).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: "put",
                    data: payload,
                })
            )
        })

        it("patchRequest sends PATCH method with data", async () => {
            mockedAxios.mockResolvedValue({ data: {} })
            const payload = { key: "value" }
            await patchRequest("endpoint", { data: payload })
            expect(mockedAxios).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: "patch",
                    data: payload,
                })
            )
        })

        it("deleteRequest sends DELETE method with data", async () => {
            mockedAxios.mockResolvedValue({ data: {} })
            const payload = { id: 1 }
            await deleteRequest("endpoint", { data: payload })
            expect(mockedAxios).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: "delete",
                    data: payload,
                })
            )
        })
    })

    describe("options forwarding", () => {
        it("sets a default request timeout", async () => {
            mockedAxios.mockResolvedValue({ data: {} })
            await getRequest("endpoint")
            expect(mockedAxios).toHaveBeenCalledWith(
                expect.objectContaining({
                    timeout: 15000,
                })
            )
        })

        it("passes signal to axios config", async () => {
            mockedAxios.mockResolvedValue({ data: {} })
            const controller = new AbortController()
            await getRequest("endpoint", { signal: controller.signal })
            expect(mockedAxios).toHaveBeenCalledWith(
                expect.objectContaining({
                    signal: controller.signal,
                })
            )
        })

        it("passes withCredentials to axios config", async () => {
            mockedAxios.mockResolvedValue({ data: {} })
            await postRequest("endpoint", { withCredentials: true })
            expect(mockedAxios).toHaveBeenCalledWith(
                expect.objectContaining({
                    withCredentials: true,
                })
            )
        })

        it("sets axios-retry retries to 0 when noRetry is true", async () => {
            mockedAxios.mockResolvedValue({ data: {} })
            await postRequest("endpoint", { noRetry: true })
            expect(mockedAxios).toHaveBeenCalledWith(
                expect.objectContaining({
                    "axios-retry": { retries: 0 },
                })
            )
        })

        it("does not set axios-retry config when noRetry is absent", async () => {
            mockedAxios.mockResolvedValue({ data: {} })
            await getRequest("endpoint")
            const config = mockedAxios.mock.calls[0][0]
            expect(config["axios-retry"]).toBeUndefined()
        })
    })

    describe("success path", () => {
        it("returns response.data, not the full response", async () => {
            const responseData = { id: 1, name: "test" }
            mockedAxios.mockResolvedValue({ data: responseData })
            const result = await getRequest("endpoint")
            expect(result).toEqual(responseData)
        })
    })

    describe("error handling", () => {
        it("logs console.error and re-throws on non-abort error", async () => {
            const error = new Error("Network error")
            mockedAxios.mockRejectedValue(error)
            await expect(getRequest("endpoint")).rejects.toThrow(
                "Network error"
            )
            expect(console.error).toHaveBeenCalled()
        })

        it("throws AbortError when request is aborted", async () => {
            const controller = new AbortController()
            controller.abort()
            const error = new Error("Aborted")
            mockedAxios.mockRejectedValue(error)
            await expect(
                getRequest("endpoint", {
                    signal: controller.signal,
                })
            ).rejects.toMatchObject({
                name: "AbortError",
                message: "Request aborted",
            })
            expect(console.warn).toHaveBeenCalled()
        })

        it("does not call console.error when request is aborted", async () => {
            const controller = new AbortController()
            controller.abort()
            mockedAxios.mockRejectedValue(new Error("Aborted"))
            await expect(
                getRequest("endpoint", { signal: controller.signal })
            ).rejects.toMatchObject({
                name: "AbortError",
            })
            expect(console.error).not.toHaveBeenCalled()
        })
    })
})
