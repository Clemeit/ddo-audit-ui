// import { initializeApp, FirebaseApp } from "firebase/app"
// import { firebaseConfig } from "./config/firebaseConfig"
// import logMessage from "./utils/logUtils"

// let appInstance: FirebaseApp | null = null
// // Analytics intentionally disabled (GA4 handled via gtag snippet directly)

// async function init() {
//     if (appInstance) return appInstance
//     try {
//         appInstance = initializeApp(firebaseConfig)
//         return appInstance
//     } catch (err) {
//         logMessage("Firebase initialization failed", "error", {
//             metadata: {
//                 error: err instanceof Error ? err.message : String(err),
//                 stack: err instanceof Error ? err.stack : undefined,
//             },
//         })
//         return null
//     }
// }

// export default init
