import React from "react"
import PropTypes from "prop-types"

const Spacer = ({ size, className = "" }) => {
    return <div className={className} style={{ width: size, height: size }} />
}

Spacer.propTypes = {
    size: PropTypes.string,
    className: PropTypes.string,
}

export default Spacer
