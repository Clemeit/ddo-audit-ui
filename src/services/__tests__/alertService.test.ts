import {
    createAlertRule,
    deleteAlertRule,
    getAlertInbox,
    getAlertRules,
    sendTestAlert,
    updateAlertRule,
} from "../alertService"
import {
    deleteRequest,
    getRequest,
    postRequest,
    putRequest,
} from "../apiHelper"

jest.mock("../apiHelper", () => ({
    getRequest: jest.fn(),
    postRequest: jest.fn(),
    putRequest: jest.fn(),
    deleteRequest: jest.fn(),
}))

const auth = {
    headers: { Authorization: "Bearer token" },
    signal: undefined,
    withCredentials: true,
}

const rule = {
    type: "lfm_posted",
    criteria: {
        quest_ids: [1],
        server_names: [],
        min_level: null,
        max_level: null,
        difficulties: [],
    },
    enabled: true,
}

beforeEach(() => {
    jest.clearAllMocks()
    ;(getRequest as jest.Mock).mockResolvedValue({})
    ;(postRequest as jest.Mock).mockResolvedValue({})
    ;(putRequest as jest.Mock).mockResolvedValue({})
    ;(deleteRequest as jest.Mock).mockResolvedValue({})
})

describe("alertService", () => {
    it("getAlertRules sends the bearer token", async () => {
        await getAlertRules("token")
        expect(getRequest).toHaveBeenCalledWith("user/alerts/rules", auth)
    })

    it("createAlertRule posts the rule without retries", async () => {
        await createAlertRule("token", rule)
        expect(postRequest).toHaveBeenCalledWith("user/alerts/rules", {
            ...auth,
            data: rule,
            noRetry: true,
        })
    })

    it("updateAlertRule puts to the rule's URL", async () => {
        await updateAlertRule("token", 7, rule)
        expect(putRequest).toHaveBeenCalledWith("user/alerts/rules/7", {
            ...auth,
            data: rule,
        })
    })

    it("deleteAlertRule deletes the rule's URL", async () => {
        await deleteAlertRule("token", 7)
        expect(deleteRequest).toHaveBeenCalledWith("user/alerts/rules/7", auth)
    })

    it("getAlertInbox omits `after` on the first call", async () => {
        await getAlertInbox("token")
        expect(getRequest).toHaveBeenCalledWith("user/alerts/inbox", {
            ...auth,
            params: undefined,
            noRetry: true,
        })
    })

    it("getAlertInbox passes `after` when given", async () => {
        await getAlertInbox("token", "12-0")
        expect(getRequest).toHaveBeenCalledWith("user/alerts/inbox", {
            ...auth,
            params: { after: "12-0" },
            noRetry: true,
        })
    })

    it("sendTestAlert posts to the test endpoint", async () => {
        await sendTestAlert("token")
        expect(postRequest).toHaveBeenCalledWith("user/alerts/test", {
            ...auth,
            noRetry: true,
        })
    })
})
