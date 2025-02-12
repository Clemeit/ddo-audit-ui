import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import "./index.css"
import reportWebVitals from "./reportWebVitals"
import browserRouter from "./browserRouter.tsx"
import { ThemeProvider } from "./contexts/ThemeContext.tsx"
import { HelmetProvider } from "react-helmet-async"
import { NotificationProvider } from "./contexts/NotificationContext.tsx"
import * as serviceWorkerRegistration from "./serviceWorkerRegistration.ts"
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getMessaging, getToken, onMessage } from "firebase/messaging"

const firebaseConfig = {
    apiKey: "AIzaSyBPQk8DKDZvO88IL5War-0k-GLFmCvqeIg",
    authDomain: "hcnxsryjficudzazjxty.firebaseapp.com",
    projectId: "hcnxsryjficudzazjxty",
    storageBucket: "hcnxsryjficudzazjxty.firebasestorage.app",
    messagingSenderId: "808002047047",
    appId: "1:808002047047:web:251d7d87c213ffd1233562",
    measurementId: "G-L54PGXRRZV",
}
// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const messaging = getMessaging(app)
getToken(messaging, {
    vapidKey:
        "BGJOuCJ--9e_IpkMSdfqggo_T-QrSSbCNa-CdOWOiECNJI9IMaRkpwnKYBtiAcOpJMI_XjBFfEnvKo7F_QSkUVg",
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
if (messaging != null) {
    onMessage(messaging, (payload) => {
        console.log("Message received. ", payload)
    })
}

const root = ReactDOM.createRoot(document.getElementById("root")!)
root.render(
    <React.StrictMode>
        <HelmetProvider>
            <ThemeProvider>
                <NotificationProvider>
                    <RouterProvider router={browserRouter} />
                </NotificationProvider>
            </ThemeProvider>
        </HelmetProvider>
    </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
serviceWorkerRegistration.register()
