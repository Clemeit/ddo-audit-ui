import React from "react"

interface Props {
    direction?: React.CSSProperties["flexDirection"]
    gap?: string
    children?: React.ReactNode
    fullWidth?: boolean
    justify?:
        | "flex-start"
        | "flex-end"
        | "center"
        | "space-between"
        | "space-around"
        | "space-evenly"
    align?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch"
    className?: string
}

const Badge: React.FC<Props> = ({
    direction = "row",
    gap = "0px",
    children,
    fullWidth = false,
    justify = "flex-start",
    align = "flex-start",
    className = "",
}) => {
    return (
        <div
            className={className}
            style={{
                display: "flex",
                flexDirection: direction,
                gap: gap,
                width: fullWidth ? "100%" : "auto",
                justifyContent: justify,
                alignItems: align,
            }}
        >
            {children}
        </div>
    )
}

export default Badge
