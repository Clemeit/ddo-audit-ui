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
}

const Link = ({
    to = "/",
    className = "",
    children,
    noDecoration,
    disabled,
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
            className={`link ${className ? className : ""} ${disabled ? "disabled" : ""}`}
            onClick={handleClick}
            style={{
                textDecoration: noDecoration ? "none" : "",
            }}
        >
            {children}
        </ReactLink>
    )
}

export default Link
