import { useCallback, useEffect, useState } from "react"
import { useAlertContext } from "../../contexts/AlertContext"
import { useNotificationContext } from "../../contexts/NotificationContext"
import {
    osNotificationPermission,
    playAlertChime,
} from "../../utils/alertDelivery"
import { deviceNotificationState } from "../../utils/deviceNotificationState"

/**
 * Everything the notifications page needs about this device: which state it is in (gate, off, on,
 * push on, ...) and the actions that move between them.
 */
const useDeviceNotifications = () => {
    const { preferences, setPreferences, sendTest, push } = useAlertContext()
    const { createNotification } = useNotificationContext()
    const [permission, setPermission] = useState(() =>
        osNotificationPermission()
    )
    const [isSendingTest, setIsSendingTest] = useState(false)

    // The permission can change outside the page (site settings, another tab); keep up with it.
    useEffect(() => {
        const refresh = () => setPermission(osNotificationPermission())
        let status: PermissionStatus | null = null
        navigator.permissions
            ?.query({ name: "notifications" as PermissionName })
            .then((result) => {
                status = result
                status.onchange = refresh
            })
            .catch(() => undefined)
        document.addEventListener("visibilitychange", refresh)
        return () => {
            if (status) status.onchange = null
            document.removeEventListener("visibilitychange", refresh)
        }
    }, [])

    const device = deviceNotificationState({
        permission,
        osNotifications: preferences.osNotifications,
        setupDismissed: preferences.setupDismissed,
        pushStatus: push.status,
    })

    /** Ask for permission (only from a click) and turn notifications on for this device. */
    const turnOn = useCallback(async () => {
        if (permission === "unsupported" || permission === "insecure") return
        let result: NotificationPermission = Notification.permission
        if (result === "default") {
            try {
                result = await Notification.requestPermission()
            } catch {
                result = Notification.permission
            }
        }
        setPermission(result)
        if (result === "granted") {
            setPreferences({
                ...preferences,
                osNotifications: true,
                setupDismissed: false,
            })
        }
    }, [permission, preferences, setPreferences])

    /** Skip the gate (or accept in-tab alerts only). */
    const dismissSetup = useCallback(
        () => setPreferences({ ...preferences, setupDismissed: true }),
        [preferences, setPreferences]
    )

    const turnOff = useCallback(async () => {
        // Preferences first, so the page goes straight to the "off" bar while push unsubscribes.
        setPreferences({
            ...preferences,
            osNotifications: false,
            setupDismissed: true,
        })
        if (push.status === "on") await push.disable()
    }, [preferences, setPreferences, push])

    const enablePush = useCallback(async () => {
        try {
            const enabled = await push.enable()
            if (enabled) {
                if (!preferences.osNotifications) {
                    setPreferences({ ...preferences, osNotifications: true })
                }
                createNotification({
                    title: "Push notifications on",
                    message:
                        "Send a test alert to check that they arrive on this device.",
                    type: "success",
                    ttl: 5000,
                })
            }
        } catch {
            createNotification({
                title: "Couldn't turn on push notifications",
                message: "Please try again in a moment.",
                type: "error",
                ttl: 5000,
            })
        }
    }, [push, preferences, setPreferences, createNotification])

    const disablePush = useCallback(async () => {
        // Keep in-tab notifications on (push may have been turned on without them).
        if (!preferences.osNotifications) {
            setPreferences({ ...preferences, osNotifications: true })
        }
        await push.disable()
    }, [push, preferences, setPreferences])

    const setSound = useCallback(
        (sound: boolean) => {
            setPreferences({ ...preferences, sound })
            // Playing from the click also unlocks audio for later alerts in this tab.
            if (sound) playAlertChime()
        },
        [preferences, setPreferences]
    )

    const sendTestAlert = useCallback(async () => {
        setIsSendingTest(true)
        try {
            await sendTest()
            createNotification({
                title: "Test alert sent",
                message: "It should arrive within a few seconds.",
                type: "success",
                ttl: 4000,
            })
        } catch {
            createNotification({
                title: "Couldn't send a test alert",
                message: "Please try again in a moment.",
                type: "error",
                ttl: 5000,
            })
        } finally {
            setIsSendingTest(false)
        }
    }, [sendTest, createNotification])

    return {
        device,
        pushStatus: push.status,
        sound: preferences.sound,
        isSendingTest,
        turnOn,
        turnOff,
        dismissSetup,
        enablePush,
        disablePush,
        setSound,
        sendTestAlert,
    }
}

export default useDeviceNotifications
export type DeviceNotifications = ReturnType<typeof useDeviceNotifications>
