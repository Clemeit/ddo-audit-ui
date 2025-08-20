// Chart configuration constants and utilities for line charts

export const LINE_CHART_MARGIN = {
    bottom: 60,
    left: 40,
    right: 10,
    top: 30,
}

export const OVER_WEEK_LINE_CHART_MARGIN = {
    ...LINE_CHART_MARGIN,
    bottom: 120, // More space for date labels
}

export const OVER_MONTH_LINE_CHART_MARGIN = {
    ...LINE_CHART_MARGIN,
    bottom: 100, // More space for date labels
}

export const LINE_CHART_Y_SCALE = {
    type: "linear" as const,
    min: 0,
    max: "auto" as const,
    stacked: false,
    reverse: false,
}

export const LINE_CHART_X_SCALE = {
    type: "time" as const,
    format: "%Y-%m-%dT%H:%M:%SZ",
    useUTC: true,
    precision: "minute" as const,
}

export const OVER_WEEK_CHART_X_SCALE = {
    type: "time" as const,
    format: "%Y-%m-%dT%H:%M:%SZ",
    useUTC: true,
    precision: "hour" as const,
}

export const OVER_MONTH_CHART_X_SCALE = {
    type: "time" as const,
    format: "%Y-%m-%dT%H:%M:%SZ",
    useUTC: true,
    precision: "day" as const,
}

// x will just be a number representing the hour of the day (0-23)
export const BY_HOUR_CHART_X_SCALE = {
    type: "linear" as const,
    min: 0,
    max: 23,
    stacked: false,
    reverse: false,
}

export const LINE_CHART_THEME = {
    axis: {
        ticks: {
            text: {
                fill: "var(--text)",
                fontSize: 14,
            },
        },
        legend: {
            text: {
                fill: "var(--text)",
                fontSize: 14,
            },
        },
    },
    crosshair: {
        line: {
            stroke: "white",
            strokeWidth: 2,
            strokeDasharray: "6 6",
        },
    },
}

export const LINE_CHART_AXIS_BOTTOM = {
    tickSize: 5,
    tickPadding: 5,
    tickRotation: -45,
    legend: "Time",
    legendOffset: 50,
    format: "%H:%M",
    tickValues: "every 1 hour",
}

export const OVER_WEEK_LINE_CHART_AXIS_BOTTOM = {
    ...LINE_CHART_AXIS_BOTTOM,
    legendOffset: 110,
    format: "%Y-%m-%d %H:%M",
    tickValues: "every 8 hour",
}

export const OVER_MONTH_LINE_CHART_AXIS_BOTTOM = {
    ...LINE_CHART_AXIS_BOTTOM,
    legendOffset: 80,
    format: "%Y-%m-%d",
    tickValues: "every 1 day",
}

export const BY_HOUR_LINE_CHART_AXIS_BOTTOM = {
    tickSize: 5,
    tickPadding: 5,
    tickRotation: 0,
    legend: "Hour of Day",
    legendOffset: 50,
    format: (value: number) => `${value}:00`,
    tickValues: Array.from({ length: 24 }, (_, i) => i), // 0 to 23
}

export const LINE_CHART_DEFAULTS = {
    enableGridX: true,
    enablePoints: false,
    lineWidth: 3,
    enableSlices: "x" as const,
    useMesh: true,
    curve: "catmullRom" as const,
    xFormat: "time:%Y-%m-%d %H:%M",
}
