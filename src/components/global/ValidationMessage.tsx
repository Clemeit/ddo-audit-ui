import React from "react"
import PropTypes from "prop-types"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import "./ValidationMessage.css"

const typeToColorMap = {
    error: "red",
    warning: "yellow",
    info: "blue",
    success: "green",
}

const ValidationMessage = ({ type, message, visible }) => {
    if (!visible) return null

    return (
        <div
            className="validation-message"
            style={{
                color: typeToColorMap[type],
            }}
        >
            {type === "error" && <X />}
            <div style={{ color: "inherit" }}>{message}</div>
        </div>
    )
}

ValidationMessage.propTypes = {
    type: PropTypes.oneOf(["error", "warning", "info", "success"]),
    message: PropTypes.string,
    visible: PropTypes.bool,
}

ValidationMessage.defaultProps = {
    type: "error",
    message: "Error",
    visible: false,
}

export default ValidationMessage
