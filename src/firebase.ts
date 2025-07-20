import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyBPQk8DKDZvO88IL5War-0k-GLFmCvqeIg",
    authDomain: "hcnxsryjficudzazjxty.firebaseapp.com",
    projectId: "hcnxsryjficudzazjxty",
    storageBucket: "hcnxsryjficudzazjxty.firebasestorage.app",
    messagingSenderId: "808002047047",
    appId: "1:808002047047:web:251d7d87c213ffd1233562",
    measurementId: "G-L54PGXRRZV",
}

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
    } catch (err) {
        console.log("Firebase initialize error: ", err)
    }
}

export default init
