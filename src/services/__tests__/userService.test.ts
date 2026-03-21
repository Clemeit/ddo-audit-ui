import {
    getUserSettings,
    postUserSettings,
    getProfile,
    putUpdatePassword,
    putPersistentSettings,
    patchPersistentSettings,
    getPersistentSettings,
    deletePersistentSettings,
} from "../userService"
import { getRequest, postRequest, putRequest, patchRequest, deleteRequest } from "../apiHelper"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
    postRequest: jest.fn(),
    putRequest: jest.fn(),
    patchRequest: jest.fn(),
    deleteRequest: jest.fn(),
}))

const mockedGetRequest = getRequest as jest.Mock
const mockedPostRequest = postRequest as jest.Mock
const mockedPutRequest = putRequest as jest.Mock
const mockedPatchRequest = patchRequest as jest.Mock
const mockedDeleteRequest = deleteRequest as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe("userService", () => {
    const token = "test-token"

    describe("deprecated endpoints", () => {
        it("getUserSettings calls user/settings/{id}", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getUserSettings("user123")
            expect(mockedGetRequest).toHaveBeenCalledWith("user/settings/user123")
        })

        it("postUserSettings calls user/settings with data", async () => {
            mockedPostRequest.mockResolvedValue({})
            const settings = {} as any
            await postUserSettings(settings, "userId")
            expect(mockedPostRequest).toHaveBeenCalledWith("user/settings", expect.objectContaining({
                data: expect.objectContaining({ settings, originatingUserId: "userId" }),
            }))
        })
    })

    describe("getProfile", () => {
        it("includes Bearer header and withCredentials", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getProfile(token)
            expect(mockedGetRequest).toHaveBeenCalledWith("user/profile", expect.objectContaining({
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            }))
        })
    })

    describe("putUpdatePassword", () => {
        it("calls putRequest with password endpoint and payload", async () => {
            mockedPutRequest.mockResolvedValue({})
            const payload = { old_password: "old", new_password: "new" }
            await putUpdatePassword(token, payload)
            expect(mockedPutRequest).toHaveBeenCalledWith("user/profile/password", expect.objectContaining({
                headers: { Authorization: `Bearer ${token}` },
                data: payload,
                withCredentials: true,
            }))
        })
    })

    describe("putPersistentSettings", () => {
        it("calls putRequest with persistent settings endpoint", async () => {
            mockedPutRequest.mockResolvedValue({})
            const payload = { settings: {} } as any
            await putPersistentSettings(token, payload)
            expect(mockedPutRequest).toHaveBeenCalledWith("user/settings/persistent", expect.objectContaining({
                headers: { Authorization: `Bearer ${token}` },
                data: payload,
                withCredentials: true,
            }))
        })
    })

    describe("patchPersistentSettings", () => {
        it("calls patchRequest with persistent settings endpoint", async () => {
            mockedPatchRequest.mockResolvedValue({})
            const payload = { settings: {} } as any
            await patchPersistentSettings(token, payload)
            expect(mockedPatchRequest).toHaveBeenCalledWith("user/settings/persistent", expect.objectContaining({
                headers: { Authorization: `Bearer ${token}` },
                data: payload,
                withCredentials: true,
            }))
        })
    })

    describe("getPersistentSettings", () => {
        it("calls getRequest with Bearer header", async () => {
            mockedGetRequest.mockResolvedValue({})
            await getPersistentSettings(token)
            expect(mockedGetRequest).toHaveBeenCalledWith("user/settings/persistent", expect.objectContaining({
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            }))
        })
    })

    describe("deletePersistentSettings", () => {
        it("calls deleteRequest with Bearer header", async () => {
            mockedDeleteRequest.mockResolvedValue({})
            await deletePersistentSettings(token)
            expect(mockedDeleteRequest).toHaveBeenCalledWith("user/settings/persistent", expect.objectContaining({
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            }))
        })
    })
})
