import React from "react"
import { act, render } from "@testing-library/react"
import { AlertProvider, useAlertContext } from "../AlertContext"
import { getAlertRules, getAlertInbox } from "../../services/alertService"
import { AlertRule } from "../../models/Alert"

jest.mock("../../services/alertService", () => ({
    createAlertRule: jest.fn(),
    deleteAlertRule: jest.fn(),
    getAlertInbox: jest.fn(),
    getAlertRules: jest.fn(),
    sendTestAlert: jest.fn(),
    updateAlertRule: jest.fn(),
}))

jest.mock("../../utils/logUtils", () => jest.fn())

jest.mock("../../services/authSession", () => ({
    isNotLoggedIn: () => false,
}))

jest.mock("../UserContext", () => ({
    useUserContext: () => ({
        isLoggedIn: true,
        authedRequest: (fn: (token: string) => Promise<unknown>) => fn("token"),
        logoutReason: null,
    }),
}))

jest.mock("../NotificationContext", () => ({
    useNotificationContext: () => ({ createNotification: jest.fn() }),
}))

jest.mock("../../hooks/usePushSubscription", () => ({
    __esModule: true,
    default: () => ({
        status: "off",
        enable: jest.fn(),
        disable: jest.fn(),
    }),
}))

const makeRule = (overrides: Partial<AlertRule>): AlertRule => ({
    id: 1,
    type: "lfm_posted",
    criteria: {},
    enabled: true,
    expires_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
})

const renderWithRules = async (rules: AlertRule[]) => {
    ;(getAlertRules as jest.Mock).mockResolvedValue({ data: rules })
    const api: { current: ReturnType<typeof useAlertContext> | null } = {
        current: null,
    }
    const Probe = () => {
        api.current = useAlertContext()
        return null
    }
    await act(async () => {
        render(
            <AlertProvider navigate={jest.fn()}>
                <Probe />
            </AlertProvider>
        )
    })
    return api as { current: ReturnType<typeof useAlertContext> }
}

describe("AlertContext active rule counts", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(getAlertInbox as jest.Mock).mockResolvedValue({
            data: { alerts: [], latest_id: "0-0" },
        })
    })

    it("counts only enabled, unexpired LFM rules in activeLfmRuleCount", async () => {
        const future = new Date(Date.now() + 3_600_000).toISOString()
        const past = new Date(Date.now() - 3_600_000).toISOString()
        const api = await renderWithRules([
            makeRule({ id: 1 }),
            makeRule({ id: 2, expires_at: future }),
            makeRule({ id: 3, enabled: false }),
            makeRule({ id: 4, expires_at: past }),
            makeRule({ id: 5, type: "server_status" }),
            makeRule({ id: 6, type: "friend_login" }),
        ])

        expect(api.current.activeLfmRuleCount).toBe(2)
        // Other alert types still count toward the overall total.
        expect(api.current.activeRuleCount).toBe(4)
    })

    it("is 0 when the user only has non-LFM rules", async () => {
        const api = await renderWithRules([
            makeRule({ id: 1, type: "server_status" }),
        ])

        expect(api.current.activeLfmRuleCount).toBe(0)
        expect(api.current.activeRuleCount).toBe(1)
    })
})
