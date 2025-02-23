import React from "react"
import { Link } from "react-router-dom"
import "./ServerNavigationCard.css"

interface Props {
    icon?: React.ReactNode
    destination: string
    title: string
    content?: React.ReactNode
    badge?: React.ReactNode
    noLink?: boolean
    onClick?: () => void
}

const ServerNavigationCard = ({
    icon,
    destination,
    title,
    content,
    badge,
    noLink,
    onClick,
}: Props) => {
    return !noLink ? (
        <Link to={destination} className="server-navigation-card">
            <span className="server-navigation-card-title">
                {icon}
                {title}
                {badge}
            </span>
            <p className="server-navigation-card-content">{content}</p>
        </Link>
    ) : (
        <button onClick={onClick} className="server-navigation-card">
            <span className="server-navigation-card-title">
                {icon}
                {title}
                {badge}
            </span>
            <p className="server-navigation-card-content">{content}</p>
        </button>
    )
}

export default ServerNavigationCard
