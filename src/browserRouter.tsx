import React, { lazy } from "react"
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom"

// Import common pages
import App from "./components/app/App.tsx"
import Directory from "./components/directory/Directory.tsx"
import Live from "./components/live/Live.tsx"
import Grouping from "./components/grouping/Grouping.tsx"
import GroupingSpecific from "./components/grouping/GroupingSpecific.tsx"
import { LfmProvider } from "./contexts/LfmContext.tsx"

// Lazy load uncommon pages
const Verification = lazy(
    () => import("./components/verification/Verification.tsx")
)
const Registration = lazy(
    () => import("./components/registration/Registration.tsx")
)
const Activity = lazy(() => import("./components/activity/Activity.tsx"))
const NotFound = lazy(() => import("./components/app/NotFound.tsx"))
const Notifications = lazy(
    () => import("./components/notifications/Notifications.tsx")
)

// Set up the router
export default createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route index element={<Directory />} />
            <Route path="/live" element={<Live />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/activity" element={<Activity />} />
            <Route
                path="/grouping"
                element={
                    <LfmProvider>
                        <Grouping />
                    </LfmProvider>
                }
            />
            <Route
                path="/grouping/:id"
                element={
                    <LfmProvider>
                        <GroupingSpecific />
                    </LfmProvider>
                }
            />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<NotFound />} />
        </Route>
    )
)
