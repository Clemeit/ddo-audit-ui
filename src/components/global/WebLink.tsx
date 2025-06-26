import React from "react"
import logMessage from "../../utils/logUtils.ts"

interface Props {
    href: string
    className?: string
    children: React.ReactNode
}

const WebLink = ({
    href = "www.ddoaudit.com",
    className = "",
    children,
}: Props) => {
    const onClick = () => {
        logMessage(`Web link clicked: ${href}`, "info", "click")
    }

    return (
        <a
            href={href}
            rel="noreferrer"
            target="_blank"
            className={`link ${className ? className : ""}`}
            onClick={onClick}
        >
            {children}
        </a>
    )
}

export default WebLink
