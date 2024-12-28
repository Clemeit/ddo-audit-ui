import React from "react"
import PropTypes from "prop-types"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { ReactComponent as Warning } from "../../assets/svg/warning.svg"
import "./ValidationMessage.css"

const typeToColorMap = {
    error: "red",
    warning: "orange",
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
            {type === "error" && <X style={{ fill: "red" }} />}
            {type === "warning" && <Warning style={{ fill: "orange" }} />}
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
