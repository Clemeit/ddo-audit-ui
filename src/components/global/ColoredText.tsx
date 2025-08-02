import React from "react"

type Color = "red" | "green" | "blue" | "orange" | "secondary" | "default"

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
    color?: Color
    children: React.ReactNode
    className?: string
}

const ColoredText = ({
    color = "default",
    children,
    className = "",
    ...rest
}: Props) => {
    const colorClass = color === "default" ? "" : `${color}-text`
    return (
        <span className={`${colorClass} ${className}`.trim()} {...rest}>
            {children}
        </span>
    )
}
export default ColoredText
