import React, { useEffect, useState } from "react"
import "./Notifications.css"
import Page from "../global/Page.tsx"
import usePagination from "../../hooks/usePagination.ts"
import Page1 from "./Page1.tsx"
import Page2 from "./Page2.tsx"
import NotificationPreferences from "./NotificationPreferences.tsx"
// import NotificationNavigation from "./NotificationNavigation.tsx"
import firebaseMessaging from "../../services/firebaseMessaging"

const Notifications = () => {
    const { currentPage, setPage } = usePagination({
        useQueryParams: true,
        clearOtherQueryParams: false,
        maxPage: 3, // Updated to include preferences page
    })

    const [isSubscribed, setIsSubscribed] = useState(false)
    const [fcmToken, setFcmToken] = useState<string | null>(null)
    const [notificationPreferences, setNotificationPreferences] = useState(null)

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
    }, [notificationPreferences])

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
            if (success) {
                setIsSubscribed(false)
                setFcmToken(null)
                console.log("Push notifications disabled")
            }
        } catch (error) {
            console.error("Error unsubscribing:", error)
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
                    fcmToken={fcmToken}
                    showPreferencesLink={true}
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
