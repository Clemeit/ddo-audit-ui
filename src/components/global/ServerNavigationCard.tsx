import React from "react"
import { Link } from "react-router-dom"
import "./ServerNavigationCard.css"

interface Props {
    icon: React.ReactNode
    destination: string
    title: string
    content: React.ReactNode
    badge?: React.ReactNode
}

const ServerNavigationCard = ({
    icon,
    destination,
    title,
    content,
    badge,
}: Props) => {
    return (
        <Link to={destination} className="server-navigation-card">
            <span className="server-navigation-card-title">
                {icon}
                {title}
                {badge}
            </span>
            <p className="server-navigation-card-content">{content}</p>
        </Link>
    )
}

export default ServerNavigationCard
