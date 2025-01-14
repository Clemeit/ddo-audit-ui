import React from "react"
import "./Badge.css"

interface Props {
    text: string
    color?: string
    backgroundColor?: string
    size?: "small" | "medium" | "large"
}

const Badge = ({
    text = "Badge",
    color = "#000",
    backgroundColor = "#fff",
    size = "medium",
}: Props) => {
    return (
        <span
            className={`badge badge-${size}`}
            style={{
                color: color,
                backgroundColor: backgroundColor,
            }}
        >
            {text}
        </span>
    )
}

export default Badge
