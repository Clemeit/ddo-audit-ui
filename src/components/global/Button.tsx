import React from "react"
import PropTypes from "prop-types"
import "./Button.css"

const Button = ({ text, icon, onClick, disabled, className, type, style }) => {
    return (
        <button
            onClick={() => !disabled && onClick()}
            disabled={disabled}
            className={`button ${type} ${className} ${disabled ? "disabled" : ""}`}
            style={style}
        >
            {icon && <span className="icon">{icon}</span>}
            <span>{text}</span>
        </button>
    )
}

Button.propTypes = {
    text: PropTypes.string,
    icon: PropTypes.element,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    type: PropTypes.oneOf(["primary", "secondary", "tertiary", "donate"]),
    style: PropTypes.object,
}

Button.defaultProps = {
    text: "Button",
    icon: null,
    onClick: () => {},
    disabled: false,
    className: "",
    type: "primary",
}

export default Button
