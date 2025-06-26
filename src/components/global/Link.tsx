import React from "react"
import { Link as ReactLink } from "react-router-dom"
import logMessage from "../../utils/logUtils.ts"

interface Props {
    to: string
    className?: string
    children: React.ReactNode
}

const Link = ({ to = "/", className = "", children }: Props) => {
    const handleClick = () => {
        logMessage(`Link clicked: ${to}`, "info", "click")
    }

    return (
        <ReactLink
            to={to}
            className={`link ${className ? className : ""}`}
            onClick={handleClick}
        >
            {children}
        </ReactLink>
    )
}

export default Link
