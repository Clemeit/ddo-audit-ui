import {
    getPushSupport,
    PushEnvironment,
    subscriptionUsesKey,
    urlBase64ToUint8Array,
} from "../pushSupport"

const desktopChrome: PushEnvironment = {
    hasServiceWorker: true,
    hasPushManager: true,
    hasNotification: true,
    isSecureContext: true,
    userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
    platform: "Win32",
    maxTouchPoints: 0,
    isStandalone: false,
}

const iphoneSafari: PushEnvironment = {
    ...desktopChrome,
    userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    platform: "iPhone",
    maxTouchPoints: 5,
    hasPushManager: false,
}

describe("getPushSupport", () => {
    it("supports desktop browsers with the Push API", () => {
        expect(getPushSupport(desktopChrome)).toBe("supported")
    })

    it("reports insecure origins first", () => {
        expect(
            getPushSupport({ ...desktopChrome, isSecureContext: false })
        ).toBe("insecure")
    })

    it("asks iPhone users to add the site to the Home Screen", () => {
        expect(getPushSupport(iphoneSafari)).toBe("ios-needs-install")
    })

    it("supports iPhone when opened from the Home Screen", () => {
        expect(
            getPushSupport({
                ...iphoneSafari,
                hasPushManager: true,
                isStandalone: true,
            })
        ).toBe("supported")
    })

    it("treats an iPad reporting as a Mac as iOS", () => {
        expect(
            getPushSupport({
                ...desktopChrome,
                userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                platform: "MacIntel",
                maxTouchPoints: 5,
            })
        ).toBe("ios-needs-install")
    })

    it("reports missing APIs as unsupported", () => {
        expect(
            getPushSupport({ ...desktopChrome, hasPushManager: false })
        ).toBe("unsupported")
        expect(
            getPushSupport({ ...desktopChrome, hasServiceWorker: false })
        ).toBe("unsupported")
    })
})

describe("VAPID key helpers", () => {
    const key = "BAECAwQ" // bytes 4, 1, 2, 3, 4

    it("decodes base64url without padding", () => {
        expect(Array.from(urlBase64ToUint8Array(key))).toEqual([4, 1, 2, 3, 4])
        expect(Array.from(urlBase64ToUint8Array("-_8"))).toEqual([251, 255])
    })

    it("compares a subscription's key with the server key", () => {
        const same = new Uint8Array([4, 1, 2, 3, 4]).buffer
        const other = new Uint8Array([4, 1, 2, 3, 5]).buffer
        expect(subscriptionUsesKey(same, key)).toBe(true)
        expect(subscriptionUsesKey(other, key)).toBe(false)
        expect(subscriptionUsesKey(null, key)).toBe(false)
    })
})
