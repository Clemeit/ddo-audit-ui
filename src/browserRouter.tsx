import { lazy } from "react"
import {
    createBrowserRouter,
    createRoutesFromElements,
    Outlet,
    Route,
} from "react-router-dom"
import { lazyRetry } from "./utils/routerUtils.ts"

// Import common pages
import App from "./components/app/App.tsx"
import Directory from "./components/directory/Directory.tsx"
import Live from "./components/live/Live.tsx"
import Grouping from "./components/grouping/Grouping.tsx"
import GroupingSpecific from "./components/grouping/GroupingSpecific.tsx"
import Servers from "./components/servers/Servers.tsx"
import Who from "./components/who/Who.tsx"
import WhoSpecific from "./components/who/WhoSpecific.tsx"

// Providers
import {
    SocialDataProvider,
    GroupingDataProvider,
    WhoDataProvider,
    RegistrationDataProvider,
} from "./contexts/CombinedProviders.tsx"
import { AreaProvider } from "./contexts/AreaContext.tsx"
import { QuestProvider } from "./contexts/QuestContext.tsx"

// Lazy load uncommon pages
const Verification = lazy(() =>
    lazyRetry(() => import("./components/verification/Verification.tsx"))
)
const Registration = lazy(() =>
    lazyRetry(() => import("./components/registration/Registration.tsx"))
)
const Activity = lazy(() =>
    lazyRetry(() => import("./components/activity/Activity.tsx"))
)
const NotFound = lazy(() =>
    lazyRetry(() => import("./components/app/NotFound.tsx"))
)
// const Notifications = lazy(
//     () => lazyRetry(() => import("./components/notifications/Notifications.tsx"))
// )
const Timers = lazy(() =>
    lazyRetry(() => import("./components/timers/Timers.tsx"))
)
const Feedback = lazy(() =>
    lazyRetry(() => import("./components/feedback/Feedback.tsx"))
)
const Friends = lazy(() =>
    lazyRetry(() => import("./components/friends/Friends.tsx"))
)
const About = lazy(() =>
    lazyRetry(() => import("./components/about/About.tsx"))
)
const Ignores = lazy(() =>
    lazyRetry(() => import("./components/ignores/Ignores.tsx"))
)
const Guilds = lazy(() =>
    lazyRetry(() => import("./components/guilds/Guilds.tsx"))
)
const GuildSpecific = lazy(() =>
    lazyRetry(() => import("./components/guilds/GuildSpecific.tsx"))
)
const OwnedContent = lazy(() =>
    lazyRetry(() => import("./components/owned-content/OwnedContent.tsx"))
)
const Donated = lazy(() =>
    lazyRetry(() => import("./components/app/donated/Donated.tsx"))
)
const UserSettings = lazy(() =>
    lazyRetry(() => import("./components/user-settings/UserSettings.tsx"))
)
// const Trends = lazy(() => lazyRetry(() => import("./components/trends/Trends.tsx")))
const Quests = lazy(() =>
    lazyRetry(() => import("./components/quests/Quests.tsx"))
)
const QuestSpecific = lazy(() =>
    lazyRetry(() => import("./components/quests/QuestSpecific.tsx"))
)

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
            <Route
                path="/activity"
                element={
                    <AreaProvider>
                        <QuestProvider>
                            <Activity />
                        </QuestProvider>
                    </AreaProvider>
                }
            />
            <Route
                path="/owned-content"
                element={
                    <GroupingDataProvider>
                        <OwnedContent />
                    </GroupingDataProvider>
                }
            />
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
            {/* <Route path="/notifications" element={<Notifications />} /> */}
            <Route
                path="/timers"
                element={
                    <QuestProvider>
                        <Timers />
                    </QuestProvider>
                }
            />
            <Route path="/servers" element={<Outlet />}>
                <Route index element={<Servers />} />
                <Route path=":id" element={<Servers />} />
            </Route>
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
            {/* <Route path="/trends" element={<Trends />} /> */}
            <Route path="/guilds" element={<Outlet />}>
                <Route
                    index
                    element={
                        <AreaProvider>
                            <Guilds />
                        </AreaProvider>
                    }
                />
                <Route
                    path=":server/:guild"
                    element={
                        <AreaProvider>
                            <GuildSpecific />
                        </AreaProvider>
                    }
                />
            </Route>
            <Route path="/donated" element={<Donated />} />
            <Route
                path="/user-settings"
                element={
                    <SocialDataProvider>
                        <UserSettings />
                    </SocialDataProvider>
                }
            />
            <Route
                path="/quests"
                element={
                    <QuestProvider>
                        <AreaProvider>
                            <Outlet />
                        </AreaProvider>
                    </QuestProvider>
                }
            >
                <Route index element={<Quests />} />
                <Route path=":id" element={<QuestSpecific />} />
            </Route>
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
        </Route>
    )
)
