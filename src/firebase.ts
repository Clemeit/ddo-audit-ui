import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getMessaging, getToken, onMessage } from "firebase/messaging"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "",
    authDomain: "hcnxsryjficudzazjxty.firebaseapp.com",
    projectId: "hcnxsryjficudzazjxty",
    storageBucket: "hcnxsryjficudzazjxty.firebasestorage.app",
    messagingSenderId: "808002047047",
    appId: "1:808002047047:web:251d7d87c213ffd1233562",
    measurementId: "G-L54PGXRRZV",
}

function initializeMessaging(app: any) {
    const messaging = getMessaging(app)
    getToken(messaging, {
        vapidKey: process.env.FIREBASE_VAPID_KEY || "",
    })
        .then((currentToken) => {
            if (currentToken) {
                // Send the token to your server and update the UI if necessary
                // ...
                console.log("currentToken: ", currentToken)
            } else {
                // Show permission request UI
                console.log(
                    "No registration token available. Request permission to generate one."
                )
                // ...
            }
        })
        .catch((err) => {
            console.log("An error occurred while retrieving token. ", err)
            // ...
        })

    onMessage(messaging, (payload) => {
        console.log("Message received. ", payload)
    })
}

function init() {
    // Initialize Firebase
    try {
        const app = initializeApp(firebaseConfig)
        const analytics = getAnalytics(app)

        // Only initialize messaging if user has granted permission
        if ("Notification" in window && Notification.permission === "granted") {
            initializeMessaging(app)
        }
    } catch (err) {
        console.log("Firebase initialize error: ", err)
    }
}

export default init
