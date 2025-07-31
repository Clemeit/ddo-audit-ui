import React from "react"
import logMessage from "../../utils/logUtils.ts"
import { getElementInnerText } from "../../utils/elementUtils.ts"

interface Props {
    href: string
    className?: string
    children: React.ReactNode
    noDecoration?: boolean
    disabled?: boolean
}

const WebLink = ({
    href = "www.ddoaudit.com",
    className = "",
    children,
    noDecoration,
    disabled = false,
}: Props) => {
    const onClick = () => {
        logMessage("Web link clicked", "info", {
            action: "click",
            component: "WebLink",
            metadata: { href, label: getElementInnerText(children) },
        })
    }

    return (
        <a
            href={href}
            rel="noreferrer"
            target="_blank"
            className={`link ${className ? className : ""} ${disabled ? "disabled" : ""}`}
            onClick={onClick}
            style={{
                textDecoration: noDecoration ? "none" : "",
            }}
        >
            {children}
        </a>
    )
}

export default WebLink
