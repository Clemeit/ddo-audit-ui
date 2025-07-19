import React, { lazy } from "react"
import {
    createBrowserRouter,
    createRoutesFromElements,
    Outlet,
    Route,
} from "react-router-dom"

// Import common pages
import App from "./components/app/App.tsx"
import Directory from "./components/directory/Directory.tsx"
import Live from "./components/live/Live.tsx"
import Grouping from "./components/grouping/Grouping.tsx"
import GroupingSpecific from "./components/grouping/GroupingSpecific.tsx"
import Servers from "./components/servers/Servers.tsx"
import Who from "./components/who/Who.tsx"
import WhoSpecific from "./components/who/WhoSpecific.tsx"

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
const Timers = lazy(() => import("./components/timers/Timers.tsx"))
const Feedback = lazy(() => import("./components/feedback/Feedback.tsx"))
const Friends = lazy(() => import("./components/friends/Friends.tsx"))
const About = lazy(() => import("./components/about/About.tsx"))
const Ignores = lazy(() => import("./components/ignores/Ignores.tsx"))
const Trends = lazy(() => import("./components/trends/Trends.tsx"))
const Quests = lazy(() => import("./components/quests/Quests.tsx"))

// Providers
import {
    SocialDataProvider,
    GroupingDataProvider,
    WhoDataProvider,
    RegistrationDataProvider,
} from "./contexts/CombinedProviders.tsx"

// Set up the router
export default createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route index element={<Directory />} />
            <Route path="/live" element={<Live />} />
            <Route path="/verification" element={<Verification />} />
            <Route
                path="/registration"
                element={
                    <RegistrationDataProvider>
                        <Registration />
                    </RegistrationDataProvider>
                }
            />
            <Route path="/activity" element={<Activity />} />
            <Route
                path="/grouping"
                element={
                    <GroupingDataProvider>
                        <Outlet />
                    </GroupingDataProvider>
                }
            >
                <Route index element={<Grouping />} />
                <Route path=":id" element={<GroupingSpecific />} />
            </Route>
            <Route
                path="/who"
                element={
                    <WhoDataProvider>
                        <Outlet />
                    </WhoDataProvider>
                }
            >
                <Route index element={<Who />} />
                <Route path=":id" element={<WhoSpecific />} />
            </Route>
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/timers" element={<Timers />} />
            <Route path="/servers" element={<Servers />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route
                path="/friends"
                element={
                    <SocialDataProvider>
                        <Friends />
                    </SocialDataProvider>
                }
            />
            <Route
                path="/ignores"
                element={
                    <SocialDataProvider>
                        <Ignores />
                    </SocialDataProvider>
                }
            />
            <Route path="/trends" element={<Trends />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
        </Route>
    )
)
