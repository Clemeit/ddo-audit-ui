import React from "react"
import "./Stack.css"

type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse"
type FlexJustify =
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly"
type FlexAlign = "flex-start" | "flex-end" | "center" | "baseline" | "stretch"

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
    direction?: FlexDirection
    gap?: React.CSSProperties["gap"]
    children?: React.ReactNode
    width?: React.CSSProperties["width"]
    justify?: FlexJustify
    align?: FlexAlign
    className?: string
    wrap?: boolean
    style?: React.CSSProperties
}

const Stack: React.FC<StackProps> = ({
    direction = "row",
    gap,
    children,
    width,
    justify = "flex-start",
    align = "flex-start",
    className = "",
    wrap = false,
    style,
    ...rest
}) => {
    return (
        <div
            className={className}
            style={{
                display: "flex",
                flexDirection: direction,
                gap,
                width,
                justifyContent: justify,
                alignItems: align,
                flexWrap: wrap ? "wrap" : "nowrap",
                ...style,
            }}
            {...rest}
        >
            {children}
        </div>
    )
}

export default Stack
