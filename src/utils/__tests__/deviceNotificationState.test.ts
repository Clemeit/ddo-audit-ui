import { deviceNotificationState } from "../deviceNotificationState"

const base = {
    permission: "default" as const,
    osNotifications: false,
    setupDismissed: false,
    pushStatus: "off" as const,
}

describe("deviceNotificationState", () => {
    it("shows the gate until notifications are set up", () => {
        expect(deviceNotificationState(base)).toEqual({ state: "gate" })
        // Permission granted elsewhere but never turned on here: still the gate (one click, no prompt).
        expect(
            deviceNotificationState({ ...base, permission: "granted" })
        ).toEqual({ state: "gate" })
    })

    it("explains why when notifications can't be turned on", () => {
        expect(
            deviceNotificationState({
                ...base,
                permission: "denied",
                pushStatus: "denied",
            })
        ).toEqual({ state: "gate-blocked", reason: "denied" })
        expect(
            deviceNotificationState({ ...base, permission: "insecure" })
        ).toEqual({ state: "gate-blocked", reason: "insecure" })
    })

    it("prefers the Home Screen hint on iOS", () => {
        expect(
            deviceNotificationState({
                ...base,
                permission: "unsupported",
                pushStatus: "ios-needs-install",
            })
        ).toEqual({ state: "gate-blocked", reason: "ios-needs-install" })
    })

    it("is off once skipped or turned off", () => {
        expect(
            deviceNotificationState({ ...base, setupDismissed: true })
        ).toEqual({ state: "off" })
        expect(
            deviceNotificationState({
                ...base,
                permission: "granted",
                setupDismissed: true,
            })
        ).toEqual({ state: "off" })
    })

    it("is in-tab only when blocked and the gate was skipped", () => {
        expect(
            deviceNotificationState({
                ...base,
                permission: "unsupported",
                pushStatus: "unsupported",
                setupDismissed: true,
            })
        ).toEqual({ state: "in-tab-only", reason: "unsupported" })
    })

    it("is on with OS notifications, and on-push with push", () => {
        const on = { ...base, permission: "granted" as const }
        expect(
            deviceNotificationState({ ...on, osNotifications: true })
        ).toEqual({ state: "on" })
        expect(
            deviceNotificationState({
                ...on,
                osNotifications: true,
                pushStatus: "on",
            })
        ).toEqual({ state: "on-push" })
        // Push turned on by itself still counts.
        expect(deviceNotificationState({ ...on, pushStatus: "on" })).toEqual({
            state: "on-push",
        })
    })

    it("falls back to the gate when a granted permission is later revoked", () => {
        expect(
            deviceNotificationState({
                ...base,
                permission: "denied",
                osNotifications: true,
                setupDismissed: true,
            })
        ).toEqual({ state: "in-tab-only", reason: "denied" })
    })
})
