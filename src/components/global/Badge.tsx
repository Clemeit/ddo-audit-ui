import React from "react"
import "./Badge.css"

interface Props {
    text: string
    color?: string
}

const Badge = ({ text = "Badge", color = "#000" }: Props) => {
    return (
        <span
            className="badge"
            style={{
                backgroundColor: color,
            }}
        >
            {text}
        </span>
    )
}

export default Badge
