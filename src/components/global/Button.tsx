import React from "react"
import "./Button.css"
import logMessage from "../../utils/logUtils.ts"
import { getElementInnerText } from "../../utils/elementUtils.ts"

interface Props {
    children?: React.ReactNode
    icon?: React.ReactElement | null
    onClick: () => void
    disabled?: boolean
    className?: string
    type?: "primary" | "secondary" | "tertiary" | "donate" | "secondary donate"
    style?: React.CSSProperties
    fullWidth?: boolean
    fullWidthOnMobile?: boolean
    small?: boolean
    asDiv?: boolean // Optional prop to render as a div instead of a button
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
    fullWidthOnMobile = false,
    small = false,
    asDiv = false, // If true, render as a div instead of a button
}: Props) => {
    const handleClick = () => {
        if (!disabled) {
            onClick()
            logMessage("Button clicked", "info", {
                action: "click",
                component: "Button",
                metadata: {
                    label: getElementInnerText(children) || "None",
                },
            })
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`${asDiv ? "div" : "button"} ${type} ${className} ${disabled ? "disabled" : ""} ${fullWidth ? "fullWidth" : ""} ${fullWidthOnMobile ? "full-width-mobile" : ""} ${small ? "small" : ""}`}
            style={style}
        >
            {icon && <span className="icon">{icon}</span>}
            {children}
        </button>
    )
}

export default Button
