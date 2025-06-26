import React from "react"
import Link from "./Link.tsx"
import "./ServerNavigationCard.css"

interface Props {
    icon?: React.ReactNode
    destination: string
    title: string
    content?: React.ReactNode
    badge?: React.ReactNode
    noLink?: boolean
    onClick?: () => void
    miniature?: boolean
    fullWidth?: boolean
}

const ServerNavigationCard = ({
    icon,
    destination,
    title,
    content,
    badge,
    noLink,
    onClick,
    miniature,
    fullWidth,
}: Props) => {
    return !noLink ? (
        <Link
            to={destination}
            className={`server-navigation-card${miniature ? " miniature" : ""}${fullWidth ? " full-width" : ""}`}
        >
            <span className="server-navigation-card-title">
                {icon}
                {title}
                {badge}
            </span>
            {content && (
                <p className="server-navigation-card-content">{content}</p>
            )}
        </Link>
    ) : (
        <button
            onClick={onClick}
            className={`server-navigation-card${miniature ? " miniature" : ""}${fullWidth ? " full-width" : ""}`}
        >
            <span className="server-navigation-card-title">
                {icon}
                {title}
                {badge}
            </span>
            {content && (
                <p className="server-navigation-card-content">{content}</p>
            )}
        </button>
    )
}

export default ServerNavigationCard
