import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import "./index.css"
import browserRouter from "./browserRouter.tsx"
import { AppProvider } from "./contexts/AppContext.tsx"
import { HelmetProvider } from "react-helmet-async"
import { NotificationProvider } from "./contexts/NotificationContext.tsx"
import { ServiceWorkerUpdater } from "./components/global/ServiceWorkerUpdater.tsx"
// Import banner image to get the correct webpack path for preloading
// import bannerImage from "./assets/webp/banner_night_revels.webp"
import logMessage from "./utils/logUtils.ts"
import { UserProvider } from "./contexts/UserContext.tsx"
import { RegisteredCharactersProvider } from "./contexts/RegisteredCharactersContext.tsx"
import { AlertProvider } from "./contexts/AlertContext.tsx"

// AlertProvider sits outside the router, so give it the router's navigate.
const navigateInApp = (url: string) => {
    void browserRouter.navigate(url)
}

// Preload the banner image for improved LCP
// const preloadBannerImage = () => {
//     const link = document.createElement("link")
//     link.rel = "preload"
//     link.as = "image"
//     link.href = bannerImage
//     document.head.appendChild(link)
// }

// Execute preload immediately
// preloadBannerImage()

const root = ReactDOM.createRoot(document.getElementById("root")!)
root.render(
    <HelmetProvider>
        <AppProvider>
            <NotificationProvider>
                <UserProvider>
                    <AlertProvider navigate={navigateInApp}>
                        <RegisteredCharactersProvider>
                            <ServiceWorkerUpdater />
                            <RouterProvider router={browserRouter} />
                        </RegisteredCharactersProvider>
                    </AlertProvider>
                </UserProvider>
            </NotificationProvider>
        </AppProvider>
    </HelmetProvider>
)
