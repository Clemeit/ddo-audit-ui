// Showing a delivered alert on this device: OS notification and sound.
// The in-app toast is created by AlertContext through the notification context.

import { RenderedAlert } from "../models/Alert"

const NOTIFICATION_ICON = "/icons/logo-192px.png"

type ThrottleDecision = "show" | "summary" | "drop"

/**
 * Limits OS notifications to `limit` per `windowMs`. The first one over the limit becomes a single
 * summary notification ("N more alerts"), the rest are dropped until the window moves on.
 */
function createOsNotificationThrottle(limit = 3, windowMs = 60_000) {
    let shown: number[] = []
    let summaryShownAt: number | null = null

    return function decide(now: number = Date.now()): ThrottleDecision {
        shown = shown.filter((t) => now - t < windowMs)
        if (summaryShownAt !== null && now - summaryShownAt >= windowMs) {
            summaryShownAt = null
        }
        if (shown.length < limit) {
            shown.push(now)
            return "show"
        }
        if (summaryShownAt === null) {
            summaryShownAt = now
            return "summary"
        }
        return "drop"
    }
}

function osNotificationsSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window
}

type OsNotificationStatus = NotificationPermission | "unsupported" | "insecure"

/**
 * Browsers only allow notifications on secure origins (HTTPS or localhost). Elsewhere they report
 * "denied" without ever asking, which is not something the user can change in site settings.
 */
function osNotificationPermission(): OsNotificationStatus {
    if (!osNotificationsSupported()) return "unsupported"
    if (window.isSecureContext === false) return "insecure"
    return Notification.permission
}

interface OsNotificationOptions {
    title: string
    body: string
    tag: string
    url: string
}

/**
 * Show an OS notification. Desktop browsers support `new Notification()` (whose click we can route
 * inside the app); Android Chrome throws on it and requires the service worker instead.
 */
async function showOsNotification(
    { title, body, tag, url }: OsNotificationOptions,
    onClick: (url: string) => void
): Promise<boolean> {
    if (osNotificationPermission() !== "granted") return false
    try {
        const notification = new Notification(title, {
            body,
            tag,
            icon: NOTIFICATION_ICON,
        })
        notification.onclick = () => {
            window.focus()
            onClick(url)
            notification.close()
        }
        return true
    } catch {
        try {
            if (!("serviceWorker" in navigator)) return false
            const registration = await navigator.serviceWorker.ready
            await registration.showNotification(title, {
                body,
                tag,
                icon: NOTIFICATION_ICON,
                data: { url },
            })
            return true
        } catch {
            return false
        }
    }
}

function alertToOsNotification(alert: RenderedAlert): OsNotificationOptions {
    return {
        title: alert.title,
        body: alert.body,
        tag: alert.tag,
        url: alert.url,
    }
}

function summaryOsNotification(): OsNotificationOptions {
    return {
        title: "More alerts",
        body: "Several of your alerts matched. Open DDO Audit to see them.",
        tag: "alerts-summary",
        url: "/notifications",
    }
}

// ----- sound -----

let audioContext: AudioContext | null = null

/** A short two-note chime, synthesised so no audio asset is needed. Fails silently (e.g. autoplay). */
function playAlertChime() {
    try {
        const AudioCtor =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
                .webkitAudioContext
        if (!AudioCtor) return
        audioContext = audioContext ?? new AudioCtor()
        const ctx = audioContext
        if (ctx.state === "suspended") void ctx.resume()
        const start = ctx.currentTime
        ;[880, 1320].forEach((frequency, i) => {
            const oscillator = ctx.createOscillator()
            const gain = ctx.createGain()
            oscillator.type = "sine"
            oscillator.frequency.value = frequency
            const t = start + i * 0.15
            gain.gain.setValueAtTime(0.0001, t)
            gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02)
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
            oscillator.connect(gain)
            gain.connect(ctx.destination)
            oscillator.start(t)
            oscillator.stop(t + 0.32)
        })
    } catch {
        // Audio is a nicety; never let it break alert delivery.
    }
}

export {
    createOsNotificationThrottle,
    osNotificationsSupported,
    osNotificationPermission,
    showOsNotification,
    alertToOsNotification,
    summaryOsNotification,
    playAlertChime,
}
export type { ThrottleDecision, OsNotificationOptions, OsNotificationStatus }
