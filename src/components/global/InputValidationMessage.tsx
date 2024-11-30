import React from "react"
import PropTypes from "prop-types"

const typeToColorMap = {
    error: "red",
    warning: "yellow",
    info: "blue",
    success: "green",
}

const InputValidationMessage = ({ type, text }) => {
    return (
        <div
            className="validation-message"
            style={{
                color: typeToColorMap[type],
            }}
        >
            {text}
        </div>
    )
}

InputValidationMessage.propTypes = {
    type: PropTypes.oneOf(["error", "warning", "info", "success"]),
    text: PropTypes.string,
}

InputValidationMessage.defaultProps = {
    type: "error",
    text: "Error",
}

export default InputValidationMessage
