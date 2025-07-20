import {
    getMessaging,
    getToken,
    onMessage,
    deleteToken,
} from "firebase/messaging"
import { getApp } from "firebase/app"
import { vapidKey } from "../config/firebaseConfig"

// Get the already initialized Firebase app instead of creating a new one
let app, messaging

try {
    app = getApp()
    messaging = getMessaging(app)
    console.log("✅ Firebase app and messaging initialized successfully")
} catch (error) {
    console.error("❌ Error initializing Firebase app/messaging:", error)
    console.log(
        "This might mean Firebase wasn't initialized yet in firebase.ts"
    )
}

export class FirebaseMessagingService {
    private static instance: FirebaseMessagingService
    private currentToken: string | null = null
    private onTokenCallback?: (token: string) => void

    private constructor() {}

    public static getInstance(): FirebaseMessagingService {
        if (!FirebaseMessagingService.instance) {
            FirebaseMessagingService.instance = new FirebaseMessagingService()
        }
        return FirebaseMessagingService.instance
    }

    public async requestPermission(): Promise<boolean> {
        try {
            const permission = await Notification.requestPermission()
            return permission === "granted"
        } catch (error) {
            console.error("Error requesting notification permission:", error)
            return false
        }
    }

    public async getToken(): Promise<string | null> {
        try {
            if (!vapidKey) {
                console.error("VAPID key not found in environment variables")
                return null
            }

            console.log("VAPID Key found:", vapidKey.substring(0, 10) + "...")
            console.log("VAPID Key length:", vapidKey.length)

            // Try to get token with VAPID key
            try {
                const token = await getToken(messaging, { vapidKey })
                if (token) {
                    this.currentToken = token
                    console.log("FCM Token:", token)

                    // Save token to localStorage for persistence
                    localStorage.setItem("fcm_token", token)

                    if (this.onTokenCallback) {
                        this.onTokenCallback(token)
                    }

                    return token
                } else {
                    console.log("No registration token available.")
                    return null
                }
            } catch (vapidError) {
                console.error("Error with VAPID key:", vapidError)
                console.log(
                    "VAPID key might be invalid. Please check your Firebase Console."
                )
                throw vapidError // Re-throw the original error for debugging
            }
        } catch (error) {
            console.error("Error getting FCM token:", error)
            return null
        }
    }

    public getCurrentToken(): string | null {
        return this.currentToken || localStorage.getItem("fcm_token")
    }

    public async deleteCurrentToken(): Promise<boolean> {
        try {
            const success = await deleteToken(messaging)
            if (success) {
                this.currentToken = null
                localStorage.removeItem("fcm_token")
                console.log("FCM token deleted successfully")
            }
            return success
        } catch (error) {
            console.error("Error deleting FCM token:", error)
            return false
        }
    }

    public onTokenRefresh(callback: (token: string) => void): void {
        this.onTokenCallback = callback
    }

    public setupForegroundMessageHandler(): void {
        console.log("Setting up foreground message handler...")

        onMessage(messaging, (payload) => {
            console.log("🔥 FOREGROUND MESSAGE RECEIVED:", payload)

            // Always show notification when app is in foreground
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.ready.then((registration) => {
                    const notificationTitle =
                        payload.notification?.title ||
                        payload.data?.title ||
                        "DDO Audit"
                    const notificationBody =
                        payload.notification?.body ||
                        payload.data?.body ||
                        "New notification"

                    const notificationOptions = {
                        body: notificationBody,
                        icon: "/icons/logo-192px.png",
                        badge: "/icons/logo-192px.png",
                        tag: "ddo-notification",
                        data: payload.data || {},
                        requireInteraction: true,
                        actions: [
                            {
                                action: "open",
                                title: "Open App",
                            },
                            {
                                action: "dismiss",
                                title: "Dismiss",
                            },
                        ],
                    }

                    console.log(
                        "Showing foreground notification via service worker"
                    )
                    registration.showNotification(
                        notificationTitle,
                        notificationOptions
                    )
                })
            }
        })

        console.log("Foreground message handler setup complete")
    }

    public async subscribeToPushNotifications(): Promise<string | null> {
        console.log("🚀 Starting push notification subscription...")

        const hasPermission = await this.requestPermission()
        if (!hasPermission) {
            console.log("❌ Notification permission denied")
            return null
        }

        console.log("✅ Permission granted, setting up foreground handler...")

        // Set up foreground message handler
        this.setupForegroundMessageHandler()

        console.log("🎯 Getting FCM token...")
        const token = await this.getToken()

        if (token) {
            console.log("✅ Successfully subscribed to push notifications")
        } else {
            console.log("❌ Failed to get FCM token")
        }

        return token
    }

    public async unsubscribeFromPushNotifications(): Promise<boolean> {
        return await this.deleteCurrentToken()
    }

    public sendTokenToServer(token: string, userPreferences?: any): void {
        // This is where you would send the token to your backend server
        // to store it and associate it with the user's notification preferences
        console.log("Token to send to server:", token)
        console.log("User preferences:", userPreferences)

        // Example API call (implement according to your backend):
        // fetch('/api/fcm-tokens', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         token: token,
        //         preferences: userPreferences
        //     })
        // }).catch(console.error);
    }

    public async sendTestNotification(): Promise<void> {
        // This is for testing - sends a local system notification
        if (Notification.permission === "granted") {
            new Notification("DDO Audit Test", {
                body: "This is a test system notification",
                icon: "/icons/logo-192px.png",
                tag: "test-notification",
                requireInteraction: false,
            })
        } else {
            console.warn("Notification permission not granted")
        }
    }
}

export default FirebaseMessagingService.getInstance()
