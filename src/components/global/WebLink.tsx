import React from "react"
import logMessage from "../../utils/logUtils.ts"
import { getElementInnerText } from "../../utils/elementUtils.ts"

interface Props extends React.HTMLAttributes<HTMLAnchorElement> {
    href: string
    children: React.ReactNode
    noDecoration?: boolean
    disabled?: boolean
}

const WebLink = ({
    href = "www.ddoaudit.com",
    children,
    noDecoration,
    disabled = false,
    ...rest
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
            className={`link ${rest.className || ""} ${disabled ? "disabled" : ""}`}
            onClick={onClick}
            style={{
                textDecoration: noDecoration ? "none" : "",
            }}
            {...rest}
        >
            {children}
        </a>
    )
}

export default WebLink
