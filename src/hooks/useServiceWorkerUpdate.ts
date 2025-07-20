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
                try {
                    if (registration.waiting) {
                        // Set up the listener BEFORE posting the message
                        const handleControllerChange = () => {
                            navigator.serviceWorker.removeEventListener(
                                "controllerchange",
                                handleControllerChange
                            )
                            window.location.reload()
                        }

                        navigator.serviceWorker.addEventListener(
                            "controllerchange",
                            handleControllerChange
                        )

                        // Tell the new service worker to skip waiting
                        registration.waiting.postMessage({
                            type: "SKIP_WAITING",
                        })
                    } else {
                        // Fallback: just reload
                        window.location.reload()
                    }

                    dismissNotification(notificationId)
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
                lifetime: MsFromSeconds(10),
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
