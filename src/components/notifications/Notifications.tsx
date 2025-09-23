import React, { useEffect, useState } from "react"
import "./Notifications.css"
import Page from "../global/Page.tsx"
import usePagination from "../../hooks/usePagination.ts"
import Page1 from "./Page1.tsx"
import Page2 from "./Page2.tsx"
import NotificationPreferences from "./NotificationPreferences.tsx"
// import NotificationNavigation from "./NotificationNavigation.tsx"
import logMessage from "../../utils/logUtils.ts"
import { useNotificationContext } from "../../contexts/NotificationContext.tsx"

const Notifications = () => {
    const { currentPage, setPage } = usePagination({
        useQueryParams: true,
        clearOtherQueryParams: false,
        maxPage: 3, // Updated to include preferences page
    })

    const [isSubscribed, setIsSubscribed] = useState(false)
    const [fcmToken, setFcmToken] = useState<string | null>(null)
    const [notificationPreferences, setNotificationPreferences] = useState(null)
    const [forceUnsubscribeAvailable, setForceUnsubscribeAvailable] =
        useState(false)
    const { createNotification } = useNotificationContext()

    useEffect(() => {
        // With Firebase removed, there is no push subscription state.
        setIsSubscribed(false)
        setFcmToken(null)
    }, [])

    async function requestPermission() {
        try {
            const permission = await Notification.requestPermission()
            if (permission === "granted") {
                createNotification({
                    title: "Enabled",
                    message:
                        "Browser notification permission granted (local only).",
                    type: "success",
                })
            } else if (permission === "denied") {
                createNotification({
                    title: "Denied",
                    message: "Browser blocked notifications.",
                    type: "error",
                })
            }
        } catch (error) {
            logMessage("Notification permission request failed", "error", {
                metadata: {
                    error:
                        error instanceof Error ? error.message : String(error),
                },
            })
        }
    }

    async function unsubscribe() {
        // With Firebase removed, just reset local state
        setIsSubscribed(false)
        setFcmToken(null)
        createNotification({
            title: "Disabled",
            message: "Push notifications are not active (Firebase removed).",
            type: "info",
        })
    }

    async function forceCompleteUnsubscribe() {
        setIsSubscribed(false)
        setFcmToken(null)
        setForceUnsubscribeAvailable(false)
        createNotification({
            title: "Cleanup",
            message: "Nothing to clean – Firebase notifications removed.",
            type: "info",
        })
    }

    const handlePreferencesChange = (preferences: any) => {
        setNotificationPreferences(preferences)
        // Send updated preferences to server along with token
        // No server sync – Firebase removed
    }

    return (
        <Page
            title="LFM Notifications"
            description="Set up LFM notifications and never miss your favorite quest or raid again!"
        >
            {/* <NotificationNavigation
                currentPage={currentPage}
                setPage={setPage}
                isSubscribed={isSubscribed}
            /> */}

            {currentPage === 1 && (
                <Page1
                    setPage={setPage}
                    isSubscribed={isSubscribed}
                    onSubscribe={requestPermission}
                    onUnsubscribe={unsubscribe}
                    onForceUnsubscribe={forceCompleteUnsubscribe}
                    fcmToken={fcmToken}
                    showPreferencesLink={true}
                    forceUnsubscribeAvailable={forceUnsubscribeAvailable}
                />
            )}
            {currentPage === 2 && <Page2 setPage={setPage} />}
            {currentPage === 3 && (
                <NotificationPreferences
                    isSubscribed={isSubscribed}
                    onPreferencesChange={handlePreferencesChange}
                    setPage={setPage}
                />
            )}
        </Page>
    )
}

export default Notifications
