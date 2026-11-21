import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    deletePushSubscription,
    getVapidPublicKey,
    savePushSubscription,
} from "../services/pushService"
import {
    getPushSupport,
    PushSupport,
    subscriptionUsesKey,
    urlBase64ToUint8Array,
} from "../utils/pushSupport"
import logMessage from "../utils/logUtils"
import type { SessionEndReason } from "../services/authSession"

type PushStatus =
    | Exclude<PushSupport, "supported">
    | "checking"
    | "unavailable" // no service worker (dev build) or the server has no push keys
    | "denied" // the user blocked notifications for this site
    | "off"
    | "on"
    | "working"

const SERVICE_WORKER_WAIT_MS = 10_000

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
}

/** The active service worker registration, or null if none shows up (it only registers in production builds). */
async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!("serviceWorker" in navigator)) return null
    return Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), SERVICE_WORKER_WAIT_MS)
        ),
    ])
}

interface Props {
    authedRequest: <T>(request: (accessToken: string) => Promise<T>) => Promise<T>
    isLoggedIn: boolean
    /** Why the last session ended; only an explicit logout ("user") turns push off. */
    logoutReason: SessionEndReason | null
}

/**
 * This browser's Web Push subscription for the logged-in user: turning it on/off, re-saving it on login
 * (so the server knows which user this browser belongs to), and unsubscribing when the user logs out.
 * A session that merely expired keeps the subscription, so push comes back on when they log in again.
 */
const usePushSubscription = ({
    authedRequest,
    isLoggedIn,
    logoutReason,
}: Props) => {
    const support = useMemo(() => getPushSupport(), [])
    const [status, setStatus] = useState<PushStatus>(
        support === "supported" ? "checking" : support
    )
    const isLoggedInRef = useRef(isLoggedIn)
    isLoggedInRef.current = isLoggedIn
    const logoutReasonRef = useRef(logoutReason)
    logoutReasonRef.current = logoutReason
    const publicKeyRef = useRef<string | null>(null)
    const wasLoggedInRef = useRef(isLoggedIn)

    const getPublicKey = useCallback(async () => {
        if (!publicKeyRef.current) {
            const response = await getVapidPublicKey()
            publicKeyRef.current = response.data.public_key
        }
        return publicKeyRef.current
    }, [])

    // Work out the current state, and re-save an existing subscription for the logged-in user.
    useEffect(() => {
        if (support !== "supported") return
        const loggedOut =
            wasLoggedInRef.current &&
            !isLoggedIn &&
            logoutReasonRef.current === "user"
        wasLoggedInRef.current = isLoggedIn
        let cancelled = false

        void (async () => {
            const registration = await getRegistration()
            if (cancelled) return
            if (!registration) {
                setStatus("unavailable")
                return
            }
            const subscription =
                await registration.pushManager.getSubscription()

            if (loggedOut) {
                // Don't keep sending the previous user's alerts to this browser. The server drops the
                // row the next time the push service reports the subscription gone.
                await subscription?.unsubscribe().catch(() => undefined)
                if (!cancelled) setStatus("off")
                return
            }
            if (Notification.permission === "denied") {
                setStatus("denied")
                return
            }
            if (!subscription || !isLoggedIn) {
                setStatus("off")
                return
            }
            let publicKey: string
            try {
                publicKey = await getPublicKey()
            } catch {
                if (!cancelled) setStatus("unavailable")
                return
            }
            if (
                !subscriptionUsesKey(
                    subscription.options.applicationServerKey,
                    publicKey
                )
            ) {
                // Made with another key (e.g. the old Firebase setup): not ours to use.
                if (!cancelled) setStatus("off")
                return
            }
            if (isLoggedInRef.current) {
                try {
                    await authedRequest((token) =>
                        savePushSubscription(token, subscription.toJSON())
                    )
                } catch (error) {
                    logMessage("Failed to re-save push subscription", "warn", {
                        metadata: { error: errorMessage(error) },
                    })
                }
            }
            if (!cancelled) setStatus("on")
        })()

        return () => {
            cancelled = true
        }
    }, [support, isLoggedIn, getPublicKey, authedRequest])

    /** Ask for permission (only call this from a click), subscribe and save. Returns true when on. */
    const enable = useCallback(async (): Promise<boolean> => {
        if (support !== "supported" || !isLoggedInRef.current) return false
        setStatus("working")
        try {
            let permission = Notification.permission
            if (permission === "default") {
                permission = await Notification.requestPermission()
            }
            if (permission !== "granted") {
                setStatus(permission === "denied" ? "denied" : "off")
                return false
            }
            const registration = await getRegistration()
            if (!registration) {
                setStatus("unavailable")
                return false
            }
            const publicKey = await getPublicKey()
            let subscription = await registration.pushManager.getSubscription()
            if (
                subscription &&
                !subscriptionUsesKey(
                    subscription.options.applicationServerKey,
                    publicKey
                )
            ) {
                await subscription.unsubscribe()
                subscription = null
            }
            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                        .buffer as ArrayBuffer,
                })
            }
            const saved = subscription
            await authedRequest((token) =>
                savePushSubscription(token, saved.toJSON())
            )
            setStatus("on")
            return true
        } catch (error) {
            logMessage("Failed to turn on push notifications", "error", {
                metadata: { error: errorMessage(error) },
            })
            setStatus(Notification.permission === "denied" ? "denied" : "off")
            throw error
        }
    }, [support, getPublicKey, authedRequest])

    const disable = useCallback(async () => {
        setStatus("working")
        try {
            const registration = await getRegistration()
            const subscription =
                await registration?.pushManager.getSubscription()
            if (subscription) {
                if (isLoggedInRef.current) {
                    await authedRequest((token) =>
                        deletePushSubscription(token, subscription.endpoint)
                    ).catch(() => undefined)
                }
                await subscription.unsubscribe()
            }
        } finally {
            setStatus("off")
        }
    }, [authedRequest])

    return useMemo(
        () => ({ status, enable, disable }),
        [status, enable, disable]
    )
}

export default usePushSubscription
export type { PushStatus }
