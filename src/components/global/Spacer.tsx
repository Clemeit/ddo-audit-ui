import React from "react"
import PropTypes from "prop-types"

const Spacer = ({ size }) => {
    return <div style={{ width: size, height: size }} />
}

Spacer.propTypes = {
    size: PropTypes.string,
}

export default Spacer
