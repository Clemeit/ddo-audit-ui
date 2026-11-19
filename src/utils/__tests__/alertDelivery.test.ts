import {
    createOsNotificationThrottle,
    osNotificationPermission,
    startTitleFlash,
    stopTitleFlash,
} from "../alertDelivery"

describe("createOsNotificationThrottle", () => {
    it("shows up to the limit, then one summary, then drops", () => {
        const decide = createOsNotificationThrottle(3, 60_000)
        expect([0, 1, 2, 3, 4, 5].map((t) => decide(t))).toEqual([
            "show",
            "show",
            "show",
            "summary",
            "drop",
            "drop",
        ])
    })

    it("frees slots once the window has passed", () => {
        const decide = createOsNotificationThrottle(2, 1000)
        decide(0)
        decide(10)
        expect(decide(20)).toBe("summary")
        expect(decide(1001)).toBe("show")
    })

    it("allows a new summary after the window", () => {
        const decide = createOsNotificationThrottle(1, 1000)
        decide(0)
        expect(decide(1)).toBe("summary")
        expect(decide(2)).toBe("drop")
        decide(1000) // slot freed: shown
        expect(decide(1001)).toBe("summary")
    })
})

describe("title flash", () => {
    let hidden = true

    beforeAll(() => {
        Object.defineProperty(document, "hidden", {
            configurable: true,
            get: () => hidden,
        })
    })

    beforeEach(() => {
        jest.useFakeTimers()
        hidden = true
        document.title = "DDO Audit"
    })

    afterEach(() => {
        stopTitleFlash()
        jest.useRealTimers()
    })

    it("alternates the title while hidden and restores it when visible", () => {
        startTitleFlash("(1) New alert")
        expect(document.title).toBe("(1) New alert")
        jest.advanceTimersByTime(1000)
        expect(document.title).toBe("DDO Audit")
        jest.advanceTimersByTime(1000)
        expect(document.title).toBe("(1) New alert")

        hidden = false
        document.dispatchEvent(new Event("visibilitychange"))
        expect(document.title).toBe("DDO Audit")
        jest.advanceTimersByTime(3000)
        expect(document.title).toBe("DDO Audit")
    })

    it("does nothing when the tab is visible", () => {
        hidden = false
        startTitleFlash("(1) New alert")
        expect(document.title).toBe("DDO Audit")
    })
})

describe("osNotificationPermission", () => {
    const originalNotification = (window as any).Notification
    const originalSecure = window.isSecureContext

    afterEach(() => {
        ;(window as any).Notification = originalNotification
        Object.defineProperty(window, "isSecureContext", {
            configurable: true,
            value: originalSecure,
        })
    })

    it("reports insecure origins separately from a user block", () => {
        ;(window as any).Notification = { permission: "denied" }
        Object.defineProperty(window, "isSecureContext", {
            configurable: true,
            value: false,
        })
        expect(osNotificationPermission()).toBe("insecure")
    })

    it("returns the browser permission on secure origins", () => {
        ;(window as any).Notification = { permission: "default" }
        Object.defineProperty(window, "isSecureContext", {
            configurable: true,
            value: true,
        })
        expect(osNotificationPermission()).toBe("default")
    })

    it("reports unsupported browsers", () => {
        delete (window as any).Notification
        expect(osNotificationPermission()).toBe("unsupported")
    })
})
