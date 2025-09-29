import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import "./index.css"
import reportWebVitals from "./reportWebVitals"
import browserRouter from "./browserRouter.tsx"
import { ThemeProvider } from "./contexts/AppContext.tsx"
import { HelmetProvider } from "react-helmet-async"
import { NotificationProvider } from "./contexts/NotificationContext.tsx"
import { ServiceWorkerUpdater } from "./components/global/ServiceWorkerUpdater.tsx"
// Import banner image to get the correct webpack path for preloading
import bannerImage from "./assets/webp/banner.webp"
import logMessage from "./utils/logUtils.ts"

// Preload the banner image for improved LCP
const preloadBannerImage = () => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = bannerImage
    document.head.appendChild(link)
}

// Execute preload immediately
preloadBannerImage()

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
