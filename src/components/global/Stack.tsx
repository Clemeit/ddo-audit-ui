import React from "react"
import "./Stack.css"

interface Props {
    direction?: React.CSSProperties["flexDirection"]
    gap?: string
    lineHeight?: string
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
    rest?: any
    fullColumnOnMobile?: boolean
    wrap?: boolean
}

const Stack: React.FC<Props> = ({
    direction = "row",
    gap = "0px",
    lineHeight = "unset",
    children,
    fullWidth = false,
    justify = "flex-start",
    align = "flex-start",
    className = "",
    fullColumnOnMobile = false,
    wrap = false,
    ...rest
}) => {
    return (
        <div
            className={`${className} ${fullColumnOnMobile ? "full-column-on-mobile" : ""}`}
            style={{
                display: "flex",
                flexDirection: direction,
                gap: gap,
                width: fullWidth ? "100%" : "auto",
                justifyContent: justify,
                alignItems: align,
                flexWrap: wrap ? "wrap" : "nowrap",
                lineHeight: lineHeight,
            }}
            {...rest}
        >
            {children}
        </div>
    )
}

export default Stack
