import React, { useEffect, useState } from "react"
import "./Notifications.css"
import Page from "../global/Page.tsx"
import usePagination from "../../hooks/usePagination.ts"
import Page1 from "./Page1.tsx"
import Page2 from "./Page2.tsx"
import NotificationPreferences from "./NotificationPreferences.tsx"
// import NotificationNavigation from "./NotificationNavigation.tsx"
import firebaseMessaging from "../../services/firebaseMessaging"
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
        // Check if user is already subscribed
        const token = firebaseMessaging.getCurrentToken()
        if (token) {
            setFcmToken(token)
            setIsSubscribed(true)
        }

        // Set up token refresh handler
        firebaseMessaging.onTokenRefresh((newToken) => {
            setFcmToken(newToken)
            firebaseMessaging.sendTokenToServer(
                newToken,
                notificationPreferences
            )
        })

        // Periodically verify notification status to detect external changes
        const statusCheckInterval = setInterval(() => {
            const notificationStatus = firebaseMessaging.getNotificationStatus()
            const currentToken = firebaseMessaging.getCurrentToken()

            // If we think they're subscribed but they actually can't receive notifications
            if (isSubscribed && !notificationStatus.canReceive) {
                console.log(
                    "Detected that user can no longer receive notifications, updating state"
                )
                setIsSubscribed(false)
                setFcmToken(null)
            }

            // If we have a mismatch between our token state and actual token
            if (currentToken !== fcmToken) {
                setFcmToken(currentToken)
                setIsSubscribed(!!currentToken)
            }
        }, 30000) // Check every 30 seconds

        return () => clearInterval(statusCheckInterval)
    }, [notificationPreferences, isSubscribed, fcmToken])

    async function requestPermission() {
        console.log("Requesting permission...")
        try {
            const token = await firebaseMessaging.subscribeToPushNotifications()
            if (token) {
                setFcmToken(token)
                setIsSubscribed(true)
                firebaseMessaging.sendTokenToServer(
                    token,
                    notificationPreferences
                )
                console.log("Push notifications enabled successfully")
            } else {
                console.log("Permission denied or error occurred")
            }
        } catch (error) {
            console.error("Error requesting permission:", error)
        }
    }

    async function unsubscribe() {
        try {
            const success =
                await firebaseMessaging.unsubscribeFromPushNotifications()

            // Update UI state regardless of partial failure to prevent user confusion
            // They should see that they're "unsubscribed" even if cleanup had issues
            setIsSubscribed(false)
            setFcmToken(null)

            if (success) {
                console.log("Push notifications disabled successfully")
                logMessage("Push notifications disabled successfully", "info")
                createNotification({
                    title: "Success",
                    message: "Push notifications have been disabled.",
                    type: "success",
                })
            } else {
                console.warn(
                    "Push notifications disabled with some cleanup issues"
                )
                logMessage(
                    "Push notifications disabled with some cleanup issues",
                    "warn"
                )
                createNotification({
                    title: "Partially Disabled",
                    message:
                        "Push notifications have been disabled locally, but some cleanup operations failed. You should not receive new notifications.",
                    type: "warning",
                })
            }
        } catch (error) {
            console.error("Error unsubscribing:", error)

            // Even on error, try to clean up local state to prevent user confusion
            setIsSubscribed(false)
            setFcmToken(null)
            setForceUnsubscribeAvailable(true) // Show option for more aggressive cleanup

            // Clear local storage as a fallback
            try {
                localStorage.removeItem("fcm_token")
                localStorage.removeItem("notification_preferences")
            } catch (storageError) {
                console.error("Could not clear local storage:", storageError)
            }

            logMessage("Error disabling push notifications", "error", {
                metadata: {
                    error:
                        error instanceof Error ? error.message : String(error),
                },
            })
            createNotification({
                title: "Error",
                message:
                    "There was an error disabling push notifications, but local settings have been cleared. You should not receive new notifications. If you continue to receive notifications, try the 'Force Complete Cleanup' option below.",
                type: "error",
            })
        }
    }

    async function forceCompleteUnsubscribe() {
        try {
            const success = await firebaseMessaging.forceCompleteUnsubscribe()

            setIsSubscribed(false)
            setFcmToken(null)
            setForceUnsubscribeAvailable(false)

            if (success) {
                createNotification({
                    title: "Complete Cleanup Successful",
                    message:
                        "All notification data has been cleared. You will not receive any notifications.",
                    type: "success",
                })
            } else {
                createNotification({
                    title: "Cleanup Completed with Issues",
                    message:
                        "Most notification data has been cleared, but some cleanup operations failed. You should not receive notifications.",
                    type: "warning",
                })
            }
        } catch (error) {
            console.error("Error in force unsubscribe:", error)
            createNotification({
                title: "Force Cleanup Error",
                message:
                    "There was an error during complete cleanup. Please contact support if you continue receiving notifications.",
                type: "error",
            })
        }
    }

    const handlePreferencesChange = (preferences: any) => {
        setNotificationPreferences(preferences)
        // Send updated preferences to server along with token
        if (fcmToken) {
            firebaseMessaging.sendTokenToServer(fcmToken, preferences)
        }
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
