import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import "./index.css"
import reportWebVitals from "./reportWebVitals"
import browserRouter from "./browserRouter.tsx"
import { ThemeProvider } from "./contexts/AppContext.tsx"
import { HelmetProvider } from "react-helmet-async"
import { NotificationProvider } from "./contexts/NotificationContext.tsx"
import { ServiceWorkerUpdater } from "./components/global/ServiceWorkerUpdater.tsx"
import logMessage from "./utils/logUtils.ts"

const root = ReactDOM.createRoot(document.getElementById("root")!)
root.render(
    <HelmetProvider>
        <ThemeProvider>
            <NotificationProvider>
                <ServiceWorkerUpdater />
                <RouterProvider router={browserRouter} />
            </NotificationProvider>
        </ThemeProvider>
    </HelmetProvider>
)

reportWebVitals((onPerfEntry: any) =>
    logMessage("Web vitals", "info", { metadata: onPerfEntry })
)
