import React, { useCallback } from "react"
import { useNotificationContext } from "../contexts/NotificationContext"
import { UpdateNotificationActions } from "../components/global/UpdateNotificationActions"
import logMessage from "../utils/logUtils"

// Session-only prompt state. The waiting worker is reported both on load and when
// update checks find it again, so the prompt is shown at most once per page load.
// "Later" lasts until the next page load; the update then gets offered again.
let promptHandled = false
let refreshing = false

export const useServiceWorkerUpdate = () => {
    const { createNotification, dismissNotification } = useNotificationContext()

    const handleServiceWorkerUpdate = useCallback(
        (registration: ServiceWorkerRegistration) => {
            if (promptHandled) {
                return
            }
            promptHandled = true

            const reloadPage = (notificationId: string) => {
                dismissNotification(notificationId)
                const waiting = registration.waiting
                if (!waiting) {
                    window.location.reload()
                    return
                }

                let fallbackTimer: ReturnType<typeof setTimeout> | undefined
                const reloadOnce = () => {
                    if (refreshing) return
                    refreshing = true
                    if (fallbackTimer) clearTimeout(fallbackTimer)
                    window.location.reload()
                }

                try {
                    // Listen before posting so the controller change can't be missed.
                    navigator.serviceWorker.addEventListener(
                        "controllerchange",
                        reloadOnce,
                        { once: true }
                    )
                    waiting.postMessage({ type: "SKIP_WAITING" })
                    // If the new worker never takes control, reload anyway.
                    fallbackTimer = setTimeout(() => {
                        console.warn(
                            "Service worker update timeout, forcing reload"
                        )
                        reloadOnce()
                    }, 5000)
                } catch (error) {
                    logMessage(
                        "Failed to skip waiting for service worker",
                        "error",
                        {
                            metadata: {
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : String(error),
                            },
                        }
                    )
                    reloadOnce()
                }
            }

            const notificationId = `sw-update-${Date.now()}`
            // No ttl: the prompt stays until the user picks Refresh or Later.
            createNotification({
                id: notificationId,
                title: "Update Available",
                message: "A new version of DDO Audit is available.",
                type: "info",
                actions: React.createElement(UpdateNotificationActions, {
                    onRefresh: () => reloadPage(notificationId),
                    onDismiss: () => dismissNotification(notificationId),
                }),
            })
        },
        [createNotification, dismissNotification]
    )

    return { handleServiceWorkerUpdate }
}
