import React from "react"
import PropTypes from "prop-types"
import "./Badge.css"

const Badge = ({ text, color }) => {
    return (
        <span className="badge" style={{ backgroundColor: color }}>
            {text}
        </span>
    )
}

Badge.propTypes = {
    text: PropTypes.string.isRequired,
    color: PropTypes.string,
}

export default Badge
