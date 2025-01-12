import React from "react"
import "./NavigationCard.css"
// @ts-ignore
import { ReactComponent as LiveSVG } from "../../assets/svg/live.svg"
// @ts-ignore
import { ReactComponent as TransferSVG } from "../../assets/svg/transfer.svg"
// @ts-ignore
import { ReactComponent as ServersSVG } from "../../assets/svg/servers.svg"
// @ts-ignore
import { ReactComponent as GroupingSVG } from "../../assets/svg/grouping.svg"
// @ts-ignore
import { ReactComponent as WhoSVG } from "../../assets/svg/who.svg"
// @ts-ignore
import { ReactComponent as FriendsSVG } from "../../assets/svg/friends.svg"
// @ts-ignore
import { ReactComponent as QuestsSVG } from "../../assets/svg/quests.svg"
// @ts-ignore
import { ReactComponent as TrendsSVG } from "../../assets/svg/trends.svg"
// @ts-ignore
import { ReactComponent as AboutSVG } from "../../assets/svg/about.svg"
// @ts-ignore
import { ReactComponent as ApiSVG } from "../../assets/svg/api.svg"
// @ts-ignore
import { ReactComponent as FeedbackSVG } from "../../assets/svg/feedback.svg"
// @ts-ignore
import { ReactComponent as RegistrationSVG } from "../../assets/svg/registration.svg"
// @ts-ignore
import { ReactComponent as TimerSVG } from "../../assets/svg/timer.svg"
// @ts-ignore
import { ReactComponent as Activity } from "../../assets/svg/activity.svg"

import { Link } from "react-router-dom"

const typeToTitleMap = {
    live: "Quick Info",
    servers: "Server Statistics",
    quests: "Quest Activity",
    trends: "Population Trends",
    grouping: "Live LFM Viewer",
    who: "Live Who Panel",
    transfers: "Server Transfers",
    friends: "Friends List",
    registration: "Register Characters",
    timers: "Raid Timers",
    about: "About This Project",
    api: "API",
    suggestions: "Give Feedback",
    activity: "Character Activity",
}

const typeToDescriptionMap = {
    live: "Server status, most populated server, and default server.",
    servers: "Server population, character demographics, and activity trends.",
    quests: "Content popularity, average completion time, and XP/minute.",
    trends: "Long-term trends, daily counts, and important game events.",
    grouping: "Easily find grounds with a live LFM viewer for each server.",
    who: "Explore a list of online players with a live Who panel.",
    transfers:
        "Which servers are gaining players and which servers are losing them.",
    friends: "See what your friends are up to with your own friends list.",
    registration:
        "Add your characters for automatic LFM filtering and raid tracking.",
    timers: "View and manage your current raid timers.",
    about: "Everything you wanted to know about this project and more.",
    api: "Pull back the curtain. Access the data for your own use.",
    suggestions:
        "Your feedback is important. Let me know what you think of the project.",
    activity: "View your verified characters' detailed activity history.",
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
    suggestions: <FeedbackSVG className="shrinkable-icon" />,
    activity: <Activity className="shrinkable-icon" />,
}

interface Props {
    type: string
    badge?: React.ReactNode
}

const NavigationCard = ({ type, badge }: Props) => {
    return (
        <Link to={`/${type}`} className="navigation-card">
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
