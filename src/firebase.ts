import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { firebaseConfig } from "./config/firebaseConfig"

function init() {
    // Initialize Firebase
    try {
        const app = initializeApp(firebaseConfig)
        const analytics = getAnalytics(app)

        // Note: Firebase messaging is now integrated into the main service worker
        // No need to register a separate firebase-messaging-sw.js
        console.log("Firebase initialized successfully")
        return app
    } catch (err) {
        console.log("Firebase initialize error: ", err)
        return null
    }
}

export default init
