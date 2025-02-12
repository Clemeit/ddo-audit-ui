import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getMessaging, getToken } from "firebase/messaging"

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

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app)
getToken(messaging, {
    vapidKey:
        " BGJOuCJ--9e_IpkMSdfqggo_T-QrSSbCNa-CdOWOiECNJI9IMaRkpwnKYBtiAcOpJMI_XjBFfEnvKo7F_QSkUVg",
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
