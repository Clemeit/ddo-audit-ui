import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { firebaseConfig } from "./config/firebaseConfig"

function init() {
    // Initialize Firebase
    try {
        const app = initializeApp(firebaseConfig)
        const analytics = getAnalytics(app)

        // Register service worker for Firebase messaging
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/firebase-messaging-sw.js")
                .then((registration) => {
                    console.log(
                        "Firebase messaging service worker registered successfully:",
                        registration.scope
                    )
                })
                .catch((err) => {
                    console.log(
                        "Firebase messaging service worker registration failed: ",
                        err
                    )
                })
        }

        console.log("Firebase initialized successfully")
        return app
    } catch (err) {
        console.log("Firebase initialize error: ", err)
        return null
    }
}

export default init
