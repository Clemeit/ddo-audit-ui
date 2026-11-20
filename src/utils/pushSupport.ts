// Whether this browser can receive Web Push notifications, and why not if it can't.

type PushSupport =
    | "supported"
    | "unsupported" // no Push API (old browser, some in-app browsers)
    | "insecure" // not HTTPS/localhost: browsers disable push entirely
    | "ios-needs-install" // iPhone/iPad Safari: push only works from the Home Screen app

interface PushEnvironment {
    hasServiceWorker: boolean
    hasPushManager: boolean
    hasNotification: boolean
    isSecureContext: boolean
    userAgent: string
    platform: string
    maxTouchPoints: number
    isStandalone: boolean
}

function isIos(
    env: Pick<PushEnvironment, "userAgent" | "platform" | "maxTouchPoints">
) {
    if (/iPad|iPhone|iPod/.test(env.userAgent)) return true
    // iPadOS reports itself as a Mac; touch support gives it away.
    return env.platform === "MacIntel" && env.maxTouchPoints > 1
}

function getPushSupport(
    env: PushEnvironment = readPushEnvironment()
): PushSupport {
    if (!env.isSecureContext) return "insecure"
    if (isIos(env) && !env.isStandalone) return "ios-needs-install"
    if (!env.hasServiceWorker || !env.hasPushManager || !env.hasNotification)
        return "unsupported"
    return "supported"
}

function readPushEnvironment(): PushEnvironment {
    const nav = navigator as Navigator & { standalone?: boolean }
    return {
        hasServiceWorker: "serviceWorker" in navigator,
        hasPushManager: "PushManager" in window,
        hasNotification: "Notification" in window,
        isSecureContext: window.isSecureContext !== false,
        userAgent: navigator.userAgent ?? "",
        platform: navigator.platform ?? "",
        maxTouchPoints: navigator.maxTouchPoints ?? 0,
        isStandalone:
            nav.standalone === true ||
            (typeof window.matchMedia === "function" &&
                window.matchMedia("(display-mode: standalone)").matches),
    }
}

/** VAPID public keys are base64url; PushManager.subscribe wants raw bytes. */
function urlBase64ToUint8Array(base64Url: string): Uint8Array {
    const padding = "=".repeat((4 - (base64Url.length % 4)) % 4)
    const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/")
    const raw = atob(base64)
    const bytes = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
    return bytes
}

/** Was this subscription made with `publicKey`? (Old subscriptions may use a different key.) */
function subscriptionUsesKey(
    applicationServerKey: ArrayBuffer | null | undefined,
    publicKey: string
): boolean {
    if (!applicationServerKey) return false
    const a = new Uint8Array(applicationServerKey)
    const b = urlBase64ToUint8Array(publicKey)
    if (a.length !== b.length) return false
    return a.every((byte, i) => byte === b[i])
}

export {
    getPushSupport,
    readPushEnvironment,
    isIos,
    urlBase64ToUint8Array,
    subscriptionUsesKey,
}
export type { PushSupport, PushEnvironment }
