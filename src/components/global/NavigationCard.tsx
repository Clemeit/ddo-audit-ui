import React from "react"
import PropTypes from "prop-types"
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
    live: <LiveSVG />,
    servers: <ServersSVG />,
    quests: <QuestsSVG />,
    trends: <TrendsSVG />,
    grouping: <GroupingSVG />,
    who: <WhoSVG />,
    transfers: <TransferSVG />,
    friends: <FriendsSVG />,
    registration: <RegistrationSVG />,
    timers: <TimerSVG />,
    about: <AboutSVG />,
    api: <ApiSVG />,
    suggestions: <FeedbackSVG />,
    activity: <Activity />,
}

const NavigationCard = ({ type, badge }) => {
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

NavigationCard.propTypes = {
    type: PropTypes.oneOf([
        "live",
        "servers",
        "quests",
        "trends",
        "grouping",
        "who",
        "transfers",
        "friends",
        "registration",
        "timers",
        "about",
        "api",
        "suggestions",
        "activity",
    ]),
    badge: PropTypes.node,
}

export default NavigationCard
