import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import "./ServerNavigationCard.css"

const ServerNavigationCard = ({ icon, destination, title, content }) => {
    return (
        <Link to={destination} className="server-navigation-card">
            <span className="server-navigation-card-title">
                {icon}
                {title}
            </span>
            <p className="server-navigation-card-content">{content}</p>
        </Link>
    )
}

ServerNavigationCard.propTypes = {
    icon: PropTypes.element,
    destination: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.node,
}

export default ServerNavigationCard
