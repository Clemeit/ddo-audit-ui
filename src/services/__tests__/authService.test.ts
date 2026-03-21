import { postRegister, postLogin, postRefresh, postLogout, deleteAccount } from "../authService"
import { postRequest, deleteRequest } from "../apiHelper"

jest.mock("../apiHelper", () => ({
    postRequest: jest.fn(),
    deleteRequest: jest.fn(),
}))

const mockedPostRequest = postRequest as jest.Mock
const mockedDeleteRequest = deleteRequest as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe("authService", () => {
    const payload = { username: "user", password: "pass" }
    const token = "test-access-token"

    describe("postRegister", () => {
        it("calls postRequest with auth/register endpoint", async () => {
            mockedPostRequest.mockResolvedValue({})
            await postRegister(payload)
            expect(mockedPostRequest).toHaveBeenCalledWith("auth/register", expect.objectContaining({
                data: payload,
                withCredentials: true,
            }))
        })

        it("forwards abort signal", async () => {
            mockedPostRequest.mockResolvedValue({})
            const controller = new AbortController()
            await postRegister(payload, controller.signal)
            expect(mockedPostRequest).toHaveBeenCalledWith("auth/register", expect.objectContaining({
                signal: controller.signal,
            }))
        })
    })

    describe("postLogin", () => {
        it("calls postRequest with auth/login endpoint and credentials", async () => {
            mockedPostRequest.mockResolvedValue({})
            await postLogin(payload)
            expect(mockedPostRequest).toHaveBeenCalledWith("auth/login", expect.objectContaining({
                data: payload,
                withCredentials: true,
            }))
        })
    })

    describe("postRefresh", () => {
        it("calls postRequest with auth/refresh and no data payload", async () => {
            mockedPostRequest.mockResolvedValue({})
            await postRefresh()
            expect(mockedPostRequest).toHaveBeenCalledWith("auth/refresh", expect.objectContaining({
                withCredentials: true,
            }))
            // Ensure no data field is passed
            const callArgs = mockedPostRequest.mock.calls[0][1]
            expect(callArgs.data).toBeUndefined()
        })
    })

    describe("postLogout", () => {
        it("includes Authorization Bearer header", async () => {
            mockedPostRequest.mockResolvedValue({})
            await postLogout(token)
            expect(mockedPostRequest).toHaveBeenCalledWith("auth/logout", expect.objectContaining({
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            }))
        })
    })

    describe("deleteAccount", () => {
        it("calls deleteRequest with auth/account endpoint", async () => {
            mockedDeleteRequest.mockResolvedValue({})
            await deleteAccount(token)
            expect(mockedDeleteRequest).toHaveBeenCalledWith("auth/account", expect.objectContaining({
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            }))
        })
    })
})
