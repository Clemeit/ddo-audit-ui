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
const Suggestions = lazy(
    () => import("./components/suggestions/Suggestions.tsx")
)
const Friends = lazy(() => import("./components/friends/Friends.tsx"))

// Providers
import { LfmProvider } from "./contexts/LfmContext.tsx"
import { WhoProvider } from "./contexts/WhoContext.tsx"
import { AreaProvider } from "./contexts/AreaContext.tsx"
import { QuestProvider } from "./contexts/QuestContext.tsx"

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
                    <AreaProvider>
                        <Registration />
                    </AreaProvider>
                }
            />
            <Route path="/activity" element={<Activity />} />
            <Route
                path="/grouping"
                element={
                    <LfmProvider>
                        <WhoProvider>
                            <AreaProvider>
                                <QuestProvider>
                                    <Grouping />
                                </QuestProvider>
                            </AreaProvider>
                        </WhoProvider>
                    </LfmProvider>
                }
            />
            <Route
                path="/grouping/:id"
                element={
                    <LfmProvider>
                        <WhoProvider>
                            <AreaProvider>
                                <QuestProvider>
                                    <GroupingSpecific />
                                </QuestProvider>
                            </AreaProvider>
                        </WhoProvider>
                    </LfmProvider>
                }
            />
            <Route
                path="/who"
                element={
                    <WhoProvider>
                        <LfmProvider>
                            <AreaProvider>
                                <Who />
                            </AreaProvider>
                        </LfmProvider>
                    </WhoProvider>
                }
            />
            <Route
                path="/who/:id"
                element={
                    <WhoProvider>
                        <LfmProvider>
                            <AreaProvider>
                                <WhoSpecific />
                            </AreaProvider>
                        </LfmProvider>
                    </WhoProvider>
                }
            />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/timers" element={<Timers />} />
            <Route path="/servers" element={<Servers />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route
                path="/friends"
                element={
                    <AreaProvider>
                        <Friends />
                    </AreaProvider>
                }
            />
            <Route path="*" element={<NotFound />} />
        </Route>
    )
)
