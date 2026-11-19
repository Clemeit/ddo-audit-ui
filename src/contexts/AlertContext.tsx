import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { AlertRule, AlertRuleInput, RenderedAlert } from "../models/Alert"
import { NotificationPreferences } from "../models/Notification"
import {
    createAlertRule,
    deleteAlertRule,
    getAlertInbox,
    getAlertRules,
    sendTestAlert,
    updateAlertRule,
} from "../services/alertService"
import {
    alertToOsNotification,
    createOsNotificationThrottle,
    playAlertChime,
    showOsNotification,
    summaryOsNotification,
} from "../utils/alertDelivery"
import {
    getNotificationPreferences,
    setNotificationPreferences,
} from "../utils/localStorage"
import logMessage from "../utils/logUtils"
import { useNotificationContext } from "./NotificationContext"
import { useUserContext } from "./UserContext"
import Button from "../components/global/Button"
import usePushSubscription, { PushStatus } from "../hooks/usePushSubscription"
import { isExpired } from "../utils/alertExpiry"

const POLL_INTERVAL_MS = 15_000
const SLOW_POLL_INTERVAL_MS = 60_000
const SLOW_POLL_AFTER_HIDDEN_MS = 10 * 60_000
const ALERT_TOAST_TTL_MS = 20_000
// Sent by the service worker when a push notification is clicked (see src/service-worker.ts).
const ALERT_NAVIGATE_MESSAGE = "ALERT_NAVIGATE"
// Must match ALERT_PUSHED_MESSAGE in src/service-worker.ts.
const ALERT_PUSHED_MESSAGE = "ALERT_PUSHED"

interface AlertContextProps {
    rules: AlertRule[]
    isLoadingRules: boolean
    rulesError: boolean
    reloadRules: () => Promise<void>
    createRule: (rule: AlertRuleInput) => Promise<AlertRule>
    updateRule: (id: number, rule: AlertRuleInput) => Promise<AlertRule>
    deleteRule: (id: number) => Promise<void>
    sendTest: () => Promise<void>
    preferences: NotificationPreferences
    setPreferences: (preferences: NotificationPreferences) => void
    isListening: boolean
    // Enabled rules that haven't expired.
    activeRuleCount: number
    push: {
        status: PushStatus
        enable: () => Promise<boolean>
        disable: () => Promise<void>
    }
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined)

interface Props {
    children: React.ReactNode
    // Supplied by index.tsx (this provider sits outside the router).
    navigate: (url: string) => void
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error)
}

export const AlertProvider = ({ children, navigate }: Props) => {
    const { isLoggedIn, accessToken } = useUserContext()
    const { createNotification } = useNotificationContext()

    const [rules, setRules] = useState<AlertRule[]>([])
    const [isLoadingRules, setIsLoadingRules] = useState(false)
    const [rulesError, setRulesError] = useState(false)
    const [preferences, setPreferencesState] =
        useState<NotificationPreferences>(() => getNotificationPreferences())

    const accessTokenRef = useRef(accessToken)
    accessTokenRef.current = accessToken
    const navigateRef = useRef(navigate)
    navigateRef.current = navigate
    const preferencesRef = useRef(preferences)
    preferencesRef.current = preferences
    const push = usePushSubscription({ accessToken, isLoggedIn })
    // With push on, this device already gets an OS notification from the service worker.
    const pushOnRef = useRef(false)
    pushOnRef.current = push.status === "on"
    const throttleRef = useRef(createOsNotificationThrottle())
    // Inbox stream ID of the last alert seen; null until seeded (seeding skips old alerts).
    const cursorRef = useRef<string | null>(null)

    const requireToken = useCallback(() => {
        const token = accessTokenRef.current
        if (!token) throw new Error("Not logged in")
        return token
    }, [])

    // ----- rules -----

    const reloadRules = useCallback(async () => {
        const token = accessTokenRef.current
        if (!token) return
        setIsLoadingRules(true)
        try {
            const response = await getAlertRules(token)
            setRules(response?.data ?? [])
            setRulesError(false)
        } catch (error) {
            setRulesError(true)
            logMessage("Failed to load alert rules", "error", {
                metadata: { error: errorMessage(error) },
            })
        } finally {
            setIsLoadingRules(false)
        }
    }, [])

    useEffect(() => {
        if (isLoggedIn) {
            void reloadRules()
        } else {
            setRules([])
            setRulesError(false)
        }
        // Reload only on login/logout, not on every access-token refresh.
    }, [isLoggedIn])

    const createRule = useCallback(
        async (rule: AlertRuleInput) => {
            const response = await createAlertRule(requireToken(), rule)
            setRules((prev) => [...prev, response.data])
            return response.data
        },
        [requireToken]
    )

    const updateRule = useCallback(
        async (id: number, rule: AlertRuleInput) => {
            const response = await updateAlertRule(requireToken(), id, rule)
            setRules((prev) =>
                prev.map((r) => (r.id === id ? response.data : r))
            )
            return response.data
        },
        [requireToken]
    )

    const deleteRule = useCallback(
        async (id: number) => {
            await deleteAlertRule(requireToken(), id)
            setRules((prev) => prev.filter((r) => r.id !== id))
        },
        [requireToken]
    )

    const sendTest = useCallback(async () => {
        await sendTestAlert(requireToken())
    }, [requireToken])

    const setPreferences = useCallback((next: NotificationPreferences) => {
        setNotificationPreferences(next)
        setPreferencesState(next)
    }, [])

    // ----- delivery -----

    const deliver = useCallback(
        (alert: RenderedAlert) => {
            const prefs = preferencesRef.current
            const go = (url: string) => navigateRef.current(url)

            createNotification({
                title: alert.title,
                message: alert.body,
                type: "info",
                ttl: ALERT_TOAST_TTL_MS,
                actions: alert.url ? (
                    <Button
                        type="secondary"
                        small
                        onClick={() => go(alert.url)}
                    >
                        View
                    </Button>
                ) : undefined,
            })

            if (prefs.sound) playAlertChime()

            // A test alert shows the OS notification even in the active tab so people can see it work.
            if (document.hidden || alert.type === "test") {
                if (prefs.osNotifications && !pushOnRef.current) {
                    const decision = throttleRef.current()
                    if (decision === "show") {
                        void showOsNotification(
                            alertToOsNotification(alert),
                            go
                        )
                    } else if (decision === "summary") {
                        void showOsNotification(summaryOsNotification(), go)
                    }
                }
            }
        },
        [createNotification]
    )

    // Clicking a push notification focuses this tab; route there without reloading.
    useEffect(() => {
        if (!("serviceWorker" in navigator)) return
        const onMessage = (event: MessageEvent) => {
            const data = event.data as { type?: string; url?: string } | null
            if (
                data?.type === ALERT_NAVIGATE_MESSAGE &&
                typeof data.url === "string" &&
                data.url.startsWith("/")
            ) {
                navigateRef.current(data.url)
            }
        }
        navigator.serviceWorker.addEventListener("message", onMessage)
        return () =>
            navigator.serviceWorker.removeEventListener("message", onMessage)
    }, [])

    // ----- inbox polling -----

    // Rules expire on the server; re-check about once a minute so this stays roughly current.
    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
        if (!rules.some((rule) => rule.expires_at)) return
        const interval = setInterval(() => setNow(Date.now()), 60_000)
        return () => clearInterval(interval)
    }, [rules])
    const activeRuleCount = rules.filter(
        (rule) => rule.enabled && !isExpired(rule.expires_at, now)
    ).length
    const isListening = isLoggedIn && activeRuleCount > 0
    // The test alert works even without rules, so poll briefly after sending one.
    const [testPending, setTestPending] = useState(false)
    const shouldPoll = isListening || testPending

    const sendTestAndListen = useCallback(async () => {
        // Seed first so the test alert is not mistaken for an old one.
        if (cursorRef.current === null) {
            const response = await getAlertInbox(requireToken())
            cursorRef.current = response.data.latest_id
        }
        await sendTest()
        setTestPending(true)
    }, [requireToken, sendTest])

    useEffect(() => {
        if (!testPending) return
        const timeout = setTimeout(() => setTestPending(false), 2 * 60_000)
        return () => clearTimeout(timeout)
    }, [testPending])

    useEffect(() => {
        if (!isLoggedIn) cursorRef.current = null
    }, [isLoggedIn])

    useEffect(() => {
        if (!shouldPoll) return

        let cancelled = false
        let timeout: ReturnType<typeof setTimeout> | null = null
        let hiddenSince: number | null = document.hidden ? Date.now() : null
        const controller = new AbortController()

        const nextDelay = () => {
            if (
                hiddenSince &&
                Date.now() - hiddenSince > SLOW_POLL_AFTER_HIDDEN_MS
            )
                return SLOW_POLL_INTERVAL_MS
            return testPending && !isListening ? 5_000 : POLL_INTERVAL_MS
        }

        let inFlight = false
        let pollAgain = false

        const poll = async () => {
            if (inFlight) {
                // A push arrived mid-request; check again once this one is done.
                pollAgain = true
                return
            }
            if (timeout) clearTimeout(timeout)
            timeout = null
            inFlight = true
            const token = accessTokenRef.current
            if (token) {
                try {
                    const response = await getAlertInbox(
                        token,
                        cursorRef.current ?? undefined,
                        controller.signal
                    )
                    if (cancelled) return
                    const { alerts, latest_id } = response.data
                    const isSeed = cursorRef.current === null
                    cursorRef.current = latest_id
                    if (!isSeed) alerts.forEach(deliver)
                    if (alerts.some((a) => a.type === "test")) {
                        setTestPending(false)
                    }
                } catch {
                    if (cancelled) return
                    // Expired tokens are refreshed by UserContext; try again next time.
                }
            }
            inFlight = false
            if (cancelled) return
            if (pollAgain) {
                pollAgain = false
                void poll()
                return
            }
            timeout = setTimeout(poll, nextDelay())
        }

        // The service worker says when a push arrives. The alert is already in the inbox (the server
        // writes it there before pushing), so check now: the toast then shows with the push notification
        // instead of up to a poll interval later.
        const onServiceWorkerMessage = (event: MessageEvent) => {
            const data = event.data as { type?: string } | null
            if (data?.type === ALERT_PUSHED_MESSAGE) void poll()
        }
        const serviceWorker =
            "serviceWorker" in navigator ? navigator.serviceWorker : null
        serviceWorker?.addEventListener("message", onServiceWorkerMessage)

        const onVisibilityChange = () => {
            if (document.hidden) {
                hiddenSince = Date.now()
            } else {
                const wasSlow =
                    hiddenSince !== null &&
                    Date.now() - hiddenSince > SLOW_POLL_AFTER_HIDDEN_MS
                hiddenSince = null
                if (wasSlow && timeout) {
                    clearTimeout(timeout)
                    timeout = setTimeout(poll, 0)
                }
            }
        }
        document.addEventListener("visibilitychange", onVisibilityChange)

        void poll()

        return () => {
            cancelled = true
            controller.abort()
            if (timeout) clearTimeout(timeout)
            document.removeEventListener("visibilitychange", onVisibilityChange)
            serviceWorker?.removeEventListener(
                "message",
                onServiceWorkerMessage
            )
        }
    }, [shouldPoll, isListening, testPending, deliver])

    const value = useMemo(
        () => ({
            rules,
            isLoadingRules,
            rulesError,
            reloadRules,
            createRule,
            updateRule,
            deleteRule,
            sendTest: sendTestAndListen,
            preferences,
            setPreferences,
            isListening,
            activeRuleCount,
            push,
        }),
        [
            rules,
            isLoadingRules,
            rulesError,
            reloadRules,
            createRule,
            updateRule,
            deleteRule,
            sendTestAndListen,
            preferences,
            setPreferences,
            isListening,
            activeRuleCount,
            push,
        ]
    )

    return (
        <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
    )
}

export const useAlertContext = () => {
    const context = useContext(AlertContext)
    if (!context) {
        throw new Error("useAlertContext must be used within an AlertProvider")
    }
    return context
}
