import React from "react"

interface Props {
    color?: "red" | "green" | "blue" | "orange" | "secondary" | "default"
    children: React.ReactNode
}

const ColoredText = ({ color = "default", children }: Props) => {
    const getTextClass = () => {
        if (color === "default") {
            return ""
        } else {
            return color + "-text"
        }
    }
    return <span className={getTextClass()}>{children}</span>
}

export default ColoredText
