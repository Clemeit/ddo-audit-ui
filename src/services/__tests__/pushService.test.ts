import {
    deletePushSubscription,
    getVapidPublicKey,
    savePushSubscription,
} from "../pushService"
import { deleteRequest, getRequest, postRequest } from "../apiHelper"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
    postRequest: jest.fn(),
    deleteRequest: jest.fn(),
}))

const auth = {
    headers: { Authorization: "Bearer token" },
    signal: undefined,
    withCredentials: true,
}

beforeEach(() => {
    jest.clearAllMocks()
    ;(getRequest as jest.Mock).mockResolvedValue({})
    ;(postRequest as jest.Mock).mockResolvedValue({})
    ;(deleteRequest as jest.Mock).mockResolvedValue({})
})

describe("pushService", () => {
    it("fetches the VAPID public key without auth", async () => {
        await getVapidPublicKey()
        expect(getRequest).toHaveBeenCalledWith("push/vapid-public-key", {
            signal: undefined,
        })
    })

    it("saves the subscription JSON", async () => {
        const subscription = {
            endpoint: "https://fcm.googleapis.com/fcm/send/x",
            keys: { p256dh: "a", auth: "b" },
        }
        await savePushSubscription("token", subscription)
        expect(postRequest).toHaveBeenCalledWith("user/push-subscriptions", {
            ...auth,
            data: subscription,
            noRetry: true,
        })
    })

    it("deletes by endpoint", async () => {
        await deletePushSubscription("token", "https://fcm.googleapis.com/x")
        expect(deleteRequest).toHaveBeenCalledWith("user/push-subscriptions", {
            ...auth,
            data: { endpoint: "https://fcm.googleapis.com/x" },
            noRetry: true,
        })
    })
})
