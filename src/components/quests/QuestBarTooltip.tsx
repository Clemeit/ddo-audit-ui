import React from "react"
import { BarTooltipProps } from "@nivo/bar"
import Stack from "../global/Stack"
import { toSentenceCase } from "../../utils/stringUtils"
import "../charts/GenericTooltip.css"

interface QuestBarTooltipProps extends BarTooltipProps<any> {
    titleFormatter?: (indexValue: string | number) => string
    valueFormatter?: (value: number) => string
}

const QuestBarTooltip: React.FC<QuestBarTooltipProps> = ({
    indexValue,
    id,
    value,
    color,
    titleFormatter = (value) => String(value),
    valueFormatter = (val) => val.toLocaleString(),
}) => {
    const numericValue = Number(value ?? 0)

    return (
        <div className="tooltip-container">
            <div className="tooltip-header">
                {titleFormatter(indexValue)}
                <hr style={{ margin: "4px 0 10px 0" }} />
            </div>
            <div className="tooltip-content">
                <Stack justify="space-between" gap="10px">
                    <Stack direction="row" gap="5px">
                        <span
                            className="tooltip-series-color"
                            style={{ backgroundColor: color || "var(--text)" }}
                            aria-hidden="true"
                        />
                        <span>{toSentenceCase(String(id))}</span>
                    </Stack>
                    <span style={{ fontWeight: 600 }}>
                        {valueFormatter(numericValue)}
                    </span>
                </Stack>
            </div>
        </div>
    )
}

export default QuestBarTooltip
