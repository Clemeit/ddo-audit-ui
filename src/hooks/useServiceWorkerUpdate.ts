import React, { useCallback } from "react"
import { useNotificationContext } from "../contexts/NotificationContext"
import { UpdateNotificationActions } from "../components/global/UpdateNotificationActions"
import logMessage from "../utils/logUtils"
import { MsFromSeconds } from "../utils/timeUtils"

export const useServiceWorkerUpdate = () => {
    const { createNotification, dismissNotification } = useNotificationContext()

    const handleServiceWorkerUpdate = useCallback(
        (registration: ServiceWorkerRegistration) => {
            const reloadPage = (notificationId: string) => {
                // Tell the new service worker to skip waiting and become active immediately
                try {
                    if (registration.waiting) {
                        registration.waiting.postMessage({
                            type: "SKIP_WAITING",
                        })

                        // Listen for the new service worker to take control
                        navigator.serviceWorker.addEventListener(
                            "controllerchange",
                            () => {
                                // Reload the page to get the latest content
                                window.location.reload()
                            }
                        )
                    } else {
                        // Fallback: just reload (though this might not show new content)
                        window.location.reload()
                    }
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
                    dismissNotification(notificationId)
                }
            }

            // Create a notification ID for dismissal
            const notificationId = `sw-update-${Date.now()}`

            createNotification({
                id: notificationId,
                title: "Update Available",
                message: "A new version of DDO Audit is available.",
                type: "info",
                lifetime: MsFromSeconds(10), // Don't auto-dismiss
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
