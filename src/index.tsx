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
import init from "./firebase.ts"

init()

const root = ReactDOM.createRoot(document.getElementById("root")!)
root.render(
    <HelmetProvider>
        <ThemeProvider>
            <NotificationProvider>
                <RouterProvider router={browserRouter} />
            </NotificationProvider>
        </ThemeProvider>
    </HelmetProvider>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
serviceWorkerRegistration.register()
