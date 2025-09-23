// import {
//     getMessaging,
//     getToken,
//     onMessage,
//     deleteToken,
// } from "firebase/messaging"
// import { getApp } from "firebase/app"
// import { vapidKey } from "../config/firebaseConfig"
// import logMessage from "../utils/logUtils"

// // Get the already initialized Firebase app instead of creating a new one
// let app, messaging

// try {
//     app = getApp()
//     messaging = getMessaging(app)
//     // console.log("✅ Firebase app and messaging initialized successfully")
// } catch (error) {
//     // console.error("❌ Error initializing Firebase app/messaging:", error)
//     // console.log(
//     //     "This might mean Firebase wasn't initialized yet in firebase.ts"
//     // )
//     logMessage("Firebase messaging initialization failed", "error", {
//         metadata: {
//             error: error instanceof Error ? error.message : String(error),
//             stack: error instanceof Error ? error.stack : undefined,
//         },
//     })
// }

// export class FirebaseMessagingService {
//     private static instance: FirebaseMessagingService
//     private currentToken: string | null = null
//     private onTokenCallback?: (token: string) => void

//     private constructor() {}

//     public static getInstance(): FirebaseMessagingService {
//         if (!FirebaseMessagingService.instance) {
//             FirebaseMessagingService.instance = new FirebaseMessagingService()
//         }
//         return FirebaseMessagingService.instance
//     }

//     public async requestPermission(): Promise<boolean> {
//         try {
//             const permission = await Notification.requestPermission()
//             return permission === "granted"
//         } catch (error) {
//             // console.error("Error requesting notification permission:", error)
//             logMessage("Error requesting notification permission", "error", {
//                 metadata: {
//                     error:
//                         error instanceof Error ? error.message : String(error),
//                     stack: error instanceof Error ? error.stack : undefined,
//                 },
//             })
//             return false
//         }
//     }

//     public async getToken(): Promise<string | null> {
//         try {
//             if (!vapidKey) {
//                 console.error("VAPID key not found in environment variables")
//                 return null
//             }

//             // Wait for service worker to be ready and use our existing service worker
//             const registration = await navigator.serviceWorker.ready

//             // Try to get token with VAPID key and our service worker
//             try {
//                 const token = await getToken(messaging, {
//                     vapidKey,
//                     serviceWorkerRegistration: registration,
//                 })
//                 if (token) {
//                     this.currentToken = token
//                     // console.log("FCM Token:", token)

//                     // Save token to localStorage for persistence
//                     localStorage.setItem("fcm_token", token)

//                     if (this.onTokenCallback) {
//                         this.onTokenCallback(token)
//                     }

//                     return token
//                 } else {
//                     // console.log("No registration token available.")
//                     logMessage("No registration token available", "warn")
//                     return null
//                 }
//             } catch (vapidError) {
//                 // console.error("Error with VAPID key:", vapidError)
//                 // console.log(
//                 //     "VAPID key might be invalid. Please check your Firebase Console."
//                 // )
//                 logMessage("Error with VAPID key", "error", {
//                     metadata: {
//                         error:
//                             vapidError instanceof Error
//                                 ? vapidError.message
//                                 : String(vapidError),
//                         stack:
//                             vapidError instanceof Error
//                                 ? vapidError.stack
//                                 : undefined,
//                     },
//                 })
//                 throw vapidError // Re-throw the original error for debugging
//             }
//         } catch (error) {
//             // console.error("Error getting FCM token:", error)
//             logMessage("Error getting FCM token", "error", {
//                 message: error instanceof Error ? error.message : String(error),
//             })
//             return null
//         }
//     }

//     public getCurrentToken(): string | null {
//         return this.currentToken || localStorage.getItem("fcm_token")
//     }

//     public async deleteCurrentToken(): Promise<boolean> {
//         try {
//             // Store token backup for potential server cleanup
//             const tokenToDelete =
//                 this.currentToken || localStorage.getItem("fcm_token")
//             if (tokenToDelete) {
//                 localStorage.setItem("fcm_token_backup", tokenToDelete)
//             }

//             const success = await deleteToken(messaging)
//             if (success) {
//                 this.currentToken = null
//                 localStorage.removeItem("fcm_token")
//                 // console.log("FCM token deleted successfully")
//             }
//             return success
//         } catch (error) {
//             // console.error("Error deleting FCM token:", error)
//             logMessage("Error deleting FCM token", "error", {
//                 metadata: {
//                     error:
//                         error instanceof Error ? error.message : String(error),
//                     stack: error instanceof Error ? error.stack : undefined,
//                 },
//             })
//             return false
//         }
//     }

//     public onTokenRefresh(callback: (token: string) => void): void {
//         this.onTokenCallback = callback
//     }

//     public setupForegroundMessageHandler(): void {
//         // console.log("Setting up foreground message handler...")

//         onMessage(messaging, (payload) => {
//             // console.log("🔥 FOREGROUND MESSAGE RECEIVED:", payload)

//             // Always show notification when app is in foreground
//             if ("serviceWorker" in navigator) {
//                 navigator.serviceWorker.ready.then((registration) => {
//                     const notificationTitle =
//                         payload.notification?.title ||
//                         payload.data?.title ||
//                         "DDO Audit"
//                     const notificationBody =
//                         payload.notification?.body ||
//                         payload.data?.body ||
//                         "New notification"

//                     const notificationOptions = {
//                         body: notificationBody,
//                         icon: "/icons/logo-192px.png",
//                         badge: "/icons/logo-192px.png",
//                         tag: "ddo-notification",
//                         data: payload.data || {},
//                         requireInteraction: true,
//                         actions: [
//                             {
//                                 action: "open",
//                                 title: "Open App",
//                             },
//                             {
//                                 action: "dismiss",
//                                 title: "Dismiss",
//                             },
//                         ],
//                     }

//                     // console.log(
//                     //     "Showing foreground notification via service worker"
//                     // )
//                     registration.showNotification(
//                         notificationTitle,
//                         notificationOptions
//                     )
//                 })
//             }
//         })

//         // console.log("Foreground message handler setup complete")
//     }

//     public async subscribeToPushNotifications(): Promise<string | null> {
//         // console.log("🚀 Starting push notification subscription...")

//         // Ensure service worker is registered and ready
//         await this.ensureServiceWorkerRegistered()

//         const hasPermission = await this.requestPermission()
//         if (!hasPermission) {
//             // console.log("❌ Notification permission denied")
//             logMessage("Notification permission denied", "warn", {
//                 metadata: {
//                     error: "User denied notification permission",
//                 },
//             })
//             return null
//         }

//         // console.log("✅ Permission granted, setting up foreground handler...")

//         // Set up foreground message handler
//         this.setupForegroundMessageHandler()

//         // console.log("🎯 Getting FCM token...")
//         const token = await this.getToken()

//         if (token) {
//             // console.log("✅ Successfully subscribed to push notifications")
//         } else {
//             // console.log("❌ Failed to get FCM token")
//             logMessage("Failed to get FCM token", "error", {
//                 metadata: {
//                     error: "Could not retrieve FCM token after permission granted",
//                 },
//             })
//         }

//         return token
//     }

//     private async ensureServiceWorkerRegistered(): Promise<void> {
//         if ("serviceWorker" in navigator) {
//             try {
//                 // Wait for existing registration or register if needed
//                 let registration =
//                     await navigator.serviceWorker.getRegistration()

//                 if (!registration) {
//                     // console.log("🔧 No service worker found, registering...")
//                     registration =
//                         await navigator.serviceWorker.register(
//                             "/service-worker.js"
//                         )
//                     // console.log(
//                     //     "✅ Service worker registered:",
//                     //     registration.scope
//                     // )
//                 } else {
//                     // console.log(
//                     //     "✅ Service worker already registered:",
//                     //     registration.scope
//                     // )
//                 }

//                 // Wait for service worker to be ready
//                 await navigator.serviceWorker.ready
//                 // console.log("✅ Service worker ready")
//             } catch (error) {
//                 console.error("❌ Service worker registration failed:", error)
//                 logMessage("Service worker registration failed", "error", {
//                     metadata: {
//                         error:
//                             error instanceof Error
//                                 ? error.message
//                                 : String(error),
//                         stack: error instanceof Error ? error.stack : undefined,
//                     },
//                 })
//                 throw error
//             }
//         } else {
//             logMessage("Service workers not supported in this browser", "error")
//             throw new Error("Service workers not supported")
//         }
//     }

//     public async unsubscribeFromPushNotifications(): Promise<boolean> {
//         let success = true
//         const errors: string[] = []

//         try {
//             // 1. Delete the FCM token from Firebase
//             const tokenDeleted = await this.deleteCurrentToken()
//             if (!tokenDeleted) {
//                 errors.push("Failed to delete FCM token from Firebase")
//                 success = false
//             }
//         } catch (error) {
//             errors.push(`FCM token deletion error: ${error}`)
//             success = false
//         }

//         try {
//             // 2. Clear local storage and in-memory state regardless of Firebase token deletion
//             this.currentToken = null
//             localStorage.removeItem("fcm_token")
//             localStorage.removeItem("notification_preferences")
//             // console.log("Local notification data cleared")
//         } catch (error) {
//             errors.push(`Local storage cleanup error: ${error}`)
//             success = false
//         }

//         try {
//             // 3. Attempt to remove token from server if it exists
//             const storedToken =
//                 localStorage.getItem("fcm_token_backup") || this.currentToken
//             if (storedToken) {
//                 this.removeTokenFromServer(storedToken)
//             }
//         } catch (error) {
//             // console.warn("Could not remove token from server:", error)
//             // Don't mark as failure since server communication is optional
//         }

//         if (errors.length > 0) {
//             // console.error("Unsubscription completed with errors:", errors)
//             logMessage("Unsubscription completed with errors", "error", {
//                 metadata: {
//                     errors: errors.join(", "),
//                 },
//             })
//         }

//         return success
//     }

//     public removeTokenFromServer(token: string): void {
//         // This would call your backend to remove the token from the server
//         // console.log("Removing token from server:", token)
//         // Example API call (implement according to your backend):
//         // fetch('/api/fcm-tokens', {
//         //     method: 'DELETE',
//         //     headers: {
//         //         'Content-Type': 'application/json',
//         //     },
//         //     body: JSON.stringify({ token })
//         // }).catch(console.error);
//     }

//     public getNotificationPermissionStatus(): NotificationPermission {
//         return Notification.permission
//     }

//     public async forceCompleteUnsubscribe(): Promise<boolean> {
//         // console.log("🧹 Starting complete unsubscription cleanup...")

//         // This is a more aggressive cleanup that ensures the user is truly unsubscribed
//         let success = true
//         const errors: string[] = []

//         try {
//             // 1. Delete FCM token
//             const tokenDeleted = await this.deleteCurrentToken()
//             if (!tokenDeleted) {
//                 errors.push("Failed to delete FCM token")
//                 success = false
//             }
//         } catch (error) {
//             errors.push(`FCM deletion error: ${error}`)
//             success = false
//         }

//         try {
//             // 2. Clear all local storage related to notifications
//             const keysToRemove = [
//                 "fcm_token",
//                 "fcm_token_backup",
//                 "notification_preferences",
//                 "notification_permission_requested",
//             ]
//             keysToRemove.forEach((key) => {
//                 localStorage.removeItem(key)
//             })
//             this.currentToken = null
//             // console.log("✅ Local storage cleared")
//         } catch (error) {
//             errors.push(`Local storage cleanup error: ${error}`)
//             success = false
//         }

//         try {
//             // 3. Unregister service worker if it's only used for notifications
//             if ("serviceWorker" in navigator) {
//                 const registrations =
//                     await navigator.serviceWorker.getRegistrations()
//                 for (let registration of registrations) {
//                     // Only unregister if it's specifically for notifications
//                     // Be careful here - you might want to keep your service worker for other features
//                     // console.log(
//                     //     "Service worker registration found:",
//                     //     registration.scope
//                     // )
//                     // registration.unregister() // Uncomment if you want to unregister SW
//                 }
//             }
//         } catch (error) {
//             console.warn("Service worker cleanup warning:", error)
//             // Not marking as failure since SW might be used for other things
//         }

//         if (errors.length > 0) {
//             // console.error(
//             //     "Complete unsubscription finished with errors:",
//             //     errors
//             // )
//             logMessage(
//                 "Complete unsubscription finished with errors",
//                 "error",
//                 {
//                     metadata: {
//                         errors: errors.join(", "),
//                     },
//                 }
//             )
//         } else {
//             // console.log("✅ Complete unsubscription successful")
//         }

//         return success
//     }

//     public canReceiveNotifications(): boolean {
//         // Check multiple factors that could allow notifications
//         const hasPermission = Notification.permission === "granted"
//         const hasToken = !!(
//             this.currentToken || localStorage.getItem("fcm_token")
//         )
//         const hasServiceWorker = "serviceWorker" in navigator

//         return hasPermission && hasToken && hasServiceWorker
//     }

//     public getNotificationStatus(): {
//         permission: NotificationPermission
//         hasToken: boolean
//         hasServiceWorker: boolean
//         canReceive: boolean
//     } {
//         const hasToken = !!(
//             this.currentToken || localStorage.getItem("fcm_token")
//         )
//         const hasServiceWorker = "serviceWorker" in navigator
//         const permission = Notification.permission

//         return {
//             permission,
//             hasToken,
//             hasServiceWorker,
//             canReceive:
//                 permission === "granted" && hasToken && hasServiceWorker,
//         }
//     }

//     public sendTokenToServer(token: string, userPreferences?: any): void {
//         // This is where you would send the token to your backend server
//         // to store it and associate it with the user's notification preferences
//         // console.log("Token to send to server:", token)
//         // console.log("User preferences:", userPreferences)
//         // Example API call (implement according to your backend):
//         // fetch('/api/fcm-tokens', {
//         //     method: 'POST',
//         //     headers: {
//         //         'Content-Type': 'application/json',
//         //     },
//         //     body: JSON.stringify({
//         //         token: token,
//         //         preferences: userPreferences
//         //     })
//         // }).catch(console.error);
//     }

//     public async sendTestNotification(): Promise<void> {
//         // This is for testing - sends a local system notification
//         if (Notification.permission === "granted") {
//             new Notification("DDO Audit Test", {
//                 body: "This is a test system notification",
//                 icon: "/icons/logo-192px.png",
//                 tag: "test-notification",
//                 requireInteraction: false,
//             })
//         } else {
//             // console.warn("Notification permission not granted")
//         }
//     }
// }

// export default FirebaseMessagingService.getInstance()
