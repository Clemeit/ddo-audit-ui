import React, { useCallback, useEffect } from "react"
import { useNotificationContext } from "../contexts/NotificationContext"
import { UpdateNotificationActions } from "../components/global/UpdateNotificationActions"
import logMessage from "../utils/logUtils"
import { MsFromDays, MsFromSeconds } from "../utils/timeUtils"
import { getData, setData } from "../utils/localStorage"

export const useServiceWorkerUpdate = () => {
    const { createNotification, dismissNotification } = useNotificationContext()
    const UPDATE_DISMISSED_KEY = "update-dismissed"
    const UPDATE_SHOWN_KEY = "update-dismissed"

    const onDismissNotification = useCallback((notificationId: string) => {
        const now = new Date().toISOString()
        try {
            setData<string>(UPDATE_DISMISSED_KEY, now)
        } catch (error) {
            logMessage(
                "Failed to set update dismissal time in localStorage",
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
        }
        dismissNotification(notificationId)
    }, [])

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
                            // Force a hard reload to bypass any caching issues
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

                        // Fallback: if controllerchange doesn't fire within 5 seconds, force reload
                        setTimeout(() => {
                            console.warn(
                                "Service worker update timeout, forcing reload"
                            )
                            window.location.reload()
                        }, 5000)
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
                    // Force reload on error
                    window.location.reload()
                }
            }

            const lastDismissal = getData<string>(UPDATE_DISMISSED_KEY)
            if (lastDismissal) {
                const lastDismissalDate = new Date(lastDismissal)
                const now = new Date()
                const timeSinceLastDismissal =
                    now.getTime() - lastDismissalDate.getTime()

                if (timeSinceLastDismissal < MsFromDays(2)) {
                    return
                }
            }

            const lastDisplay = getData<string>(UPDATE_SHOWN_KEY)
            if (lastDisplay) {
                const lastDisplayDate = new Date(lastDisplay)
                const now = new Date()
                const timeSinceLastDisplay =
                    now.getTime() - lastDisplayDate.getTime()

                if (timeSinceLastDisplay < MsFromDays(2)) {
                    return
                }
            }

            try {
                setData<string>(UPDATE_SHOWN_KEY, new Date().toISOString())
            } catch (error) {
                logMessage(
                    "Failed to set update display time in localStorage",
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
            }

            // Create a notification ID for dismissal
            const notificationId = `sw-update-${Date.now()}`

            createNotification({
                id: notificationId,
                title: "Update Available",
                message: "A new version of DDO Audit is available.",
                type: "info",
                ttl: MsFromSeconds(10),
                actions: React.createElement(UpdateNotificationActions, {
                    onRefresh: () => reloadPage(notificationId),
                    onDismiss: () => onDismissNotification(notificationId),
                }),
            })
        },
        [createNotification, dismissNotification]
    )

    return { handleServiceWorkerUpdate }
}
