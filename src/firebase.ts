import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { firebaseConfig } from "./config/firebaseConfig"
import logMessage from "./utils/logUtils"

function init() {
    // Initialize Firebase
    try {
        const app = initializeApp(firebaseConfig)
        const analytics = getAnalytics(app)

        // Note: Firebase messaging is now integrated into the main service worker
        // No need to register a separate firebase-messaging-sw.js
        // console.log("Firebase initialized successfully")
        return app
    } catch (err) {
        // console.log("Firebase initialize error: ", err)
        logMessage("Firebase initialization failed", "error", {
            metadata: {
                error: err instanceof Error ? err.message : String(err),
                stack: err instanceof Error ? err.stack : undefined,
            },
        })
        return null
    }
}

export default init
