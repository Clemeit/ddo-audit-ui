import { Outlet, ScrollRestoration } from "react-router-dom"
import Header from "./Header.tsx"
import Footer from "./Footer.tsx"
import ContentPush from "./ContentPush.tsx"
import { ErrorBoundary } from "./ErrorBoundary.tsx"
import Notifications from "../global/Notifications.tsx"
import PageViewTracker from "../global/PageViewTracker.tsx"

function App() {
    return (
        <ErrorBoundary>
            <Header />
            <PageViewTracker />
            <Outlet />
            <ScrollRestoration />
            <Footer />
            <Notifications />
            <ContentPush />
        </ErrorBoundary>
    )
}

export default App
