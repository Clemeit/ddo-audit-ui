import React from "react"
import { ComputedDatum } from "@nivo/pie"
import { NivoPieSlice } from "../../utils/nivoUtils"

interface PieChartTooltipProps {
    datum: ComputedDatum<NivoPieSlice>
    total?: number
    descriptionFormatter?: (value: number, total: number) => string
}

const PieChartTooltip = ({
    datum,
    total,
    descriptionFormatter = (value: number, total: number) => value.toString(),
}: PieChartTooltipProps) => {
    return (
        <div
            style={{
                background: "var(--soft-highlight)",
                padding: "8px 12px",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.55)",
                color: "var(--text)",
                fontSize: "14px",
                minWidth: "0",
                width: "fit-content",
                position: "relative",
                wordWrap: "break-word",
                overflow: "hidden",
                boxSizing: "border-box",
                whiteSpace: "nowrap",
            }}
        >
            <strong>{datum.label}</strong>:{" "}
            {descriptionFormatter(datum.value, total ?? 1)}
        </div>
    )
}

export default PieChartTooltip
