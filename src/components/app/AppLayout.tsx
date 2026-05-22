import { useMemo } from "react"
import { useAppContext } from "../../contexts/AppContext"
import "./AppLayout.css"
import Sidebar from "./Sidebar"
import { useLocation } from "react-router-dom"

const headerContentMap = {
    "": {
        title: "DDO Audit",
        subtitle: "Real-time Player Concurrency Data and LFM Viewer",
    },
    live: {
        title: "Live",
        subtitle: "Server status, quick info, and frequently asked questions",
    },
    servers: {
        title: "Servers",
        subtitle: "Server Population, Demographics, and Trends",
    },
    grouping: {
        title: "Grouping",
        subtitle: "Live LFM Viewer",
    },
    who: {
        title: "Who",
        subtitle: "Live Character Viewer",
    },
    trends: {
        title: "Trends",
        subtitle: "Long-term Population Trends",
    },
    quests: {
        title: "Quest Analytics",
        subtitle: "Completion Times and Popularity",
    },
    about: {
        title: "About DDO Audit",
        subtitle: "Real-time Player Concurrency Data and LFM Viewer",
    },
    verification: {
        title: "Verification",
        subtitle: "Verify Your Characters",
    },
    registration: {
        title: "Registration",
        subtitle: "Register Your Characters",
    },
    friends: {
        title: "Friends",
        subtitle: "Add Your Friends",
    },
    ignores: {
        title: "Ignore List",
        subtitle: "Block characters",
    },
    activity: {
        title: "Activity",
        subtitle: "Detailed Character Activity",
    },
    notifications: {
        title: "LFM Notifications",
        subtitle: "Set Up and Manage Notifications",
    },
    timers: {
        title: "Timers",
        subtitle: "View and Manage Timers",
    },
    feedback: {
        title: "DDO Audit",
        subtitle: "Real-time Player Concurrency Data and LFM Viewer",
    },
    guilds: {
        title: "Guilds",
        subtitle: "Guild Membership and Activity",
    },
    "owned-content": {
        title: "Content",
        subtitle: "Set Owned Content for Eligibility Filtering",
    },
    account: {
        title: "Account",
        subtitle: "Manage Your DDO Audit Account",
    },
}

const AppLayout = ({ children }) => {
    const { isSidebarCollapsed, setIsSidebarCollapsed, isFullScreen } =
        useAppContext()
    const location = useLocation()

    const { title, subtitle } = useMemo(() => {
        const rootPath = location.pathname.split("/")[1]
        const data = headerContentMap[rootPath]
        return {
            title: data["title"],
            subtitle: data["subtitle"],
        }
    }, [location.pathname])

    const baseClassName = useMemo(() => {
        const names = []
        if (isSidebarCollapsed) names.push("sidebar--collapsed")
        if (isFullScreen) names.push("full--screen")
        return names.join(" ")
    }, [isSidebarCollapsed, isFullScreen])

    return (
        <div className={baseClassName}>
            <div className="app-layout">
                <div className="app-layout__sidebar" id="sidebar">
                    <Sidebar />
                </div>
                <button
                    className="app-layout__sidebar-toggle"
                    aria-label={
                        isSidebarCollapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                    aria-expanded={!isSidebarCollapsed}
                    aria-controls="sidebar"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                >
                    <svg
                        className="app-layout__sidebar-toggle-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <div className="app-layout__main-content">
                    <div className="app-layout__main-content-header">
                        <h1 className="app-layout__main-content-title">
                            {title}
                        </h1>
                        <span>{subtitle}</span>
                    </div>
                    <div className="app-layout__horizontal-divider" />
                    <div className="app-layout__main-content-body">
                        <div className="app-layout__main-content-inner">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AppLayout
