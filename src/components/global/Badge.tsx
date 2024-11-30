import React from "react"
import PropTypes from "prop-types"
import "./Badge.css"

const Badge = ({ text, color }: { text: string; color: string }) => {
    return (
        <span
            className="badge"
            style={{
                backgroundColor: color,
            }}
        >
            {text}
        </span>
    )
}

Badge.propTypes = {
    text: PropTypes.string.isRequired,
    color: PropTypes.string,
}

Badge.defaultProps = {
    text: "Badge",
    color: "#000",
}

export default Badge
