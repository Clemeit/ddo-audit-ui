import { getMessaging, getToken, onMessage } from "firebase/messaging"

let messagingInitialized = false

export const enableNotifications = async (app: any) => {
    if (messagingInitialized) return

    try {
        // Request permission first
        const permission = await Notification.requestPermission()

        if (permission === "granted") {
            const messaging = getMessaging(app)

            const currentToken = await getToken(messaging, {
                vapidKey: process.env.FIREBASE_VAPID_KEY || "",
            })

            if (currentToken) {
                console.log("currentToken: ", currentToken)

                onMessage(messaging, (payload) => {
                    console.log("Message received. ", payload)
                })

                messagingInitialized = true
                return currentToken
            } else {
                console.log("No registration token available.")
            }
        } else {
            console.log("Notification permission denied.")
        }
    } catch (err) {
        console.log("An error occurred while setting up notifications. ", err)
    }
}
