import React from "react"
import "./NavigationCard.css"
import { ReactComponent as LiveSVG } from "../../assets/svg/live.svg"
import { ReactComponent as TransferSVG } from "../../assets/svg/transfer.svg"
import { ReactComponent as ServersSVG } from "../../assets/svg/servers.svg"
import { ReactComponent as GroupingSVG } from "../../assets/svg/grouping.svg"
import { ReactComponent as WhoSVG } from "../../assets/svg/who.svg"
import { ReactComponent as FriendsSVG } from "../../assets/svg/friends.svg"
import { ReactComponent as QuestsSVG } from "../../assets/svg/quests.svg"
import { ReactComponent as TrendsSVG } from "../../assets/svg/trends.svg"
import { ReactComponent as AboutSVG } from "../../assets/svg/about.svg"
import { ReactComponent as ApiSVG } from "../../assets/svg/api.svg"
import { ReactComponent as FeedbackSVG } from "../../assets/svg/feedback.svg"
import { ReactComponent as RegistrationSVG } from "../../assets/svg/registration.svg"
import { ReactComponent as TimerSVG } from "../../assets/svg/timer.svg"
import { ReactComponent as Activity } from "../../assets/svg/activity.svg"
import { ReactComponent as Health } from "../../assets/svg/health.svg"
import { ReactComponent as Ignore } from "../../assets/svg/ignore.svg"

import Link from "./Link.tsx"
import WebLink from "./WebLink.tsx"
import logMessage from "../../utils/logUtils.ts"
import { getElementInnerText } from "../../utils/elementUtils.ts"

const typeToTitleMap = {
    live: "Quick Info",
    servers: "Server Statistics",
    quests: "Quest Activity",
    trends: "Population Trends",
    grouping: "Live LFM Viewer",
    who: "Live Character Viewer",
    transfers: "Server Transfers",
    friends: "Friends List",
    registration: "Register Characters",
    timers: "Raid and Quest Timers",
    about: "About This Project",
    api: "API",
    feedback: "Give Feedback",
    activity: "Character Activity",
    health: "Site and API Health",
    ignore: "Ignore List",
}

const typeToDescriptionMap = {
    live: "Server status, most populated server, and default server.",
    servers: "Server population, character demographics, and activity trends.",
    quests: "Content popularity, average completion time, and XP/minute.",
    trends: "Long-term trends, daily counts, and important game events.",
    grouping: "Easily find grounds with a live LFM viewer for each server.",
    who: "Explore a list of online players with a live character viewer.",
    transfers:
        "Which servers are gaining players and which servers are losing them.",
    friends: "See what your friends are up to with your own friends list.",
    registration:
        "Add your characters for automatic LFM filtering and raid tracking.",
    timers: "View and manage your current raid and quest timers.",
    about: "Everything you wanted to know about this project and more.",
    api: "Pull back the curtain. Access the data for your own use.",
    feedback:
        "Your feedback is important. Let me know what you think of the project.",
    activity: "View your verified characters' detailed activity history.",
    health: "Monitor DDO Audit's data collection, website, and API health.",
    ignore: "Hide LFMs posted by certain players or containing certain words.",
}

const typeToIconMap = {
    live: <LiveSVG className="shrinkable-icon" />,
    servers: <ServersSVG className="shrinkable-icon" />,
    quests: <QuestsSVG className="shrinkable-icon" />,
    trends: <TrendsSVG className="shrinkable-icon" />,
    grouping: <GroupingSVG className="shrinkable-icon" />,
    who: <WhoSVG className="shrinkable-icon" />,
    transfers: <TransferSVG className="shrinkable-icon" />,
    friends: <FriendsSVG className="shrinkable-icon" />,
    registration: <RegistrationSVG className="shrinkable-icon" />,
    timers: <TimerSVG className="shrinkable-icon" />,
    about: <AboutSVG className="shrinkable-icon" />,
    api: <ApiSVG className="shrinkable-icon" />,
    feedback: <FeedbackSVG className="shrinkable-icon" />,
    activity: <Activity className="shrinkable-icon" />,
    health: <Health className="shrinkable-icon" />,
    ignore: <Ignore className="shrinkable-icon" />,
}

interface Props {
    type: string
    badge?: React.ReactNode
    noLink?: boolean
    onClick?: () => void
    fullWidth?: boolean
    externalLink?: string
}

const NavigationCard = ({
    type,
    badge,
    noLink,
    onClick,
    fullWidth,
    externalLink,
}: Props) => {
    const handleClick = () => {
        logMessage("Navigation card clicked", "info", {
            action: "click",
            component: "NavigationCard",
            metadata: {
                type,
            },
        })
        onClick?.()
    }

    if (externalLink) {
        return (
            <WebLink
                href={externalLink}
                className={`navigation-card ${fullWidth ? "full-width" : ""}`}
            >
                <span className="navigation-card-title">
                    {typeToIconMap[type]}
                    {typeToTitleMap[type]}
                    {badge}
                </span>
                <p className="navigation-card-content">
                    {typeToDescriptionMap[type]}
                </p>
            </WebLink>
        )
    }

    if (noLink) {
        return (
            <button
                onClick={handleClick}
                className={`navigation-card ${fullWidth ? "full-width" : ""}`}
            >
                <span className="navigation-card-title">
                    {typeToIconMap[type]}
                    {typeToTitleMap[type]}
                    {badge}
                </span>
                <p className="navigation-card-content">
                    {typeToDescriptionMap[type]}
                </p>
            </button>
        )
    }

    return (
        <Link
            to={`/${type}`}
            className={`navigation-card ${fullWidth ? "full-width" : ""}`}
        >
            <span className="navigation-card-title">
                {typeToIconMap[type]}
                {typeToTitleMap[type]}
                {badge}
            </span>
            <p className="navigation-card-content">
                {typeToDescriptionMap[type]}
            </p>
        </Link>
    )
}

export default NavigationCard
