import React from "react"
import "./Button.css"

interface Props {
    children?: React.ReactNode
    icon?: React.ReactElement | null
    onClick: () => void
    disabled?: boolean
    className?: string
    type?: "primary" | "secondary" | "tertiary" | "donate" | "secondary donate"
    style?: React.CSSProperties
    fullWidth?: boolean
    small?: boolean
}

const Button = ({
    children = null,
    icon = null,
    onClick,
    disabled = false,
    className = "",
    type = "primary",
    style,
    fullWidth = false,
    small = false,
}: Props) => {
    return (
        <button
            onClick={() => !disabled && onClick()}
            disabled={disabled}
            className={`button ${type} ${className} ${disabled ? "disabled" : ""} ${fullWidth ? "fullWidth" : ""} ${small ? "small" : ""}`}
            style={style}
        >
            {icon && <span className="icon">{icon}</span>}
            <span>{children}</span>
        </button>
    )
}

export default Button
