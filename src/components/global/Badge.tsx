import React from "react"
import "./Badge.css"

interface Props {
    text: string
    color?: string
    backgroundColor?: string
    size?: "small" | "medium" | "large"
    type?: "new" | "beta" | "soon" | "default"
    weight?: "normal" | "bold"
}

const Badge = ({
    text = "Badge",
    color = "#000",
    backgroundColor = "#fff",
    size = "medium",
    type = "default",
    weight = "normal",
}: Props) => {
    const displayBackgroundColor = () => {
        switch (type) {
            case "new":
                return "#aaffff"
            case "beta":
                return "#f18ddc"
            case "soon":
                return "#e48e59"
            default:
                return backgroundColor
        }
    }

    const displayColor = () => {
        switch (type) {
            case "new":
            case "beta":
            case "soon":
                return "#000"
            default:
                return color
        }
    }

    return (
        <span
            className={`badge badge-${size}`}
            style={{
                color: displayColor(),
                backgroundColor: displayBackgroundColor(),
                fontWeight: weight,
            }}
        >
            {text}
        </span>
    )
}

export default Badge
