import React from "react"
import PropTypes from "prop-types"
import "./NavigationCard.css"
import { ReactComponent as LiveSVG } from "../../assets/svg_icons/live.svg"
import { ReactComponent as TransferSVG } from "../../assets/svg_icons/transfer.svg"
import { ReactComponent as ServersSVG } from "../../assets/svg_icons/servers.svg"
import { ReactComponent as GroupingSVG } from "../../assets/svg_icons/grouping.svg"
import { ReactComponent as WhoSVG } from "../../assets/svg_icons/who.svg"
import { ReactComponent as FriendsSVG } from "../../assets/svg_icons/friends.svg"
import { ReactComponent as QuestsSVG } from "../../assets/svg_icons/quests.svg"
import { ReactComponent as TrendsSVG } from "../../assets/svg_icons/trends.svg"
import { ReactComponent as AboutSVG } from "../../assets/svg_icons/about.svg"
import { ReactComponent as ApiSVG } from "../../assets/svg_icons/api.svg"
import { ReactComponent as FeedbackSVG } from "../../assets/svg_icons/feedback.svg"
import { ReactComponent as RegisterSVG } from "../../assets/svg_icons/register.svg"
import { ReactComponent as TimerSVG } from "../../assets/svg_icons/timer.svg"

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
    registration: <RegisterSVG />,
    timers: <TimerSVG />,
    about: <AboutSVG />,
    api: <ApiSVG />,
    suggestions: <FeedbackSVG />,
}

const NavigationCard = ({ type }) => {
    return (
        <button className="navigation-card">
            <h4>
                {typeToIconMap[type]}
                {typeToTitleMap[type]}
            </h4>
            <p>{typeToDescriptionMap[type]}</p>
        </button>
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
    ]),
}

export default NavigationCard