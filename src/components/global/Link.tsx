import React from "react"
import { Link as ReactLink } from "react-router-dom"
import logMessage from "../../utils/logUtils.ts"
import { getElementInnerText } from "../../utils/elementUtils.ts"

interface Props {
    to: string
    className?: string
    children: React.ReactNode
    noDecoration?: boolean
    disabled?: boolean
    silentDisabled?: boolean
    newTab?: boolean
}

const Link = ({
    to = "/",
    className = "",
    children,
    noDecoration,
    disabled,
    silentDisabled = false,
    newTab = false,
}: Props) => {
    const handleClick = () => {
        logMessage("Link clicked", "info", {
            action: "click",
            component: "Link",
            metadata: { to, label: getElementInnerText(children) },
        })
    }

    return (
        <ReactLink
            to={to}
            className={`link ${className ? className : ""} ${disabled ? "disabled" : ""} ${silentDisabled ? "silent-disabled" : ""}`}
            onClick={handleClick}
            style={{
                textDecoration: noDecoration ? "none" : "",
            }}
            target={newTab ? "_blank" : undefined}
            rel={newTab ? "noopener noreferrer" : undefined}
            aria-disabled={disabled ? "true" : "false"}
            tabIndex={disabled ? -1 : 0}
        >
            {children}
        </ReactLink>
    )
}

export default Link
