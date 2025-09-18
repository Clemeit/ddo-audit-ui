import React from "react"

interface ChartContainerProps {
    isError: boolean
    isLoading: boolean
    children: React.ReactNode
    height?: number | string
}

const ChartContainer = ({
    isError,
    isLoading,
    children,
    height = "500px",
}: ChartContainerProps) => {
    return (
        <div style={{ height: height, position: "relative" }}>
            <div
                className="chart-overlay"
                style={{
                    backgroundColor: isError
                        ? "var(--background)"
                        : "transparent",
                    opacity: isError ? 0.6 : 0,
                }}
            />
            {isError && (
                <span className="chart-overlay-text">
                    An error occurred - please try again later.
                </span>
            )}
            {children}
        </div>
    )
}

export default ChartContainer
