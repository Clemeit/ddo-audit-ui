import React, { useMemo } from "react"
import {
    NivoBarSlice,
    NivoDateSeries,
    NivoNumberSeries,
    NivoPieSlice,
} from "../../utils/nivoUtils.ts"
import Stack from "../global/Stack.tsx"
import { getServerColor } from "../../utils/chartUtils.ts"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import "./GenericLegend.css"

interface GenericLegendProps {
    nivoData:
        | NivoDateSeries[]
        | NivoNumberSeries[]
        | NivoPieSlice[]
        | NivoBarSlice[]
    excludedSeries?: string[]
    onItemClick?: (serverId: string) => void
    onItemHover?: (serverId: string | null) => void
}

const GenericLegend = ({
    nivoData,
    excludedSeries,
    onItemClick,
    onItemHover,
}: GenericLegendProps) => {
    const legendItems = useMemo(() => {
        if (!nivoData || nivoData.length === 0) return []

        return SERVER_NAMES_LOWER.map((serverName) => {
            const series = nivoData.find(
                (s) => String(s.id).toLowerCase() === serverName
            )

            if (!series) return null

            return {
                id: String(series.id),
                serverName,
                series,
                color: getServerColor(String(series.id)),
                displayName: toSentenceCase(String(series.id)),
                isExcluded:
                    excludedSeries?.includes(String(series.id)) || false,
            }
        }).filter(Boolean)
    }, [nivoData, excludedSeries])

    const handleItemClick = (serverId: string) => {
        onItemClick?.(serverId)
    }

    const handleItemMouseEnter = (serverId: string) => {
        onItemHover?.(serverId)
    }

    const handleItemMouseLeave = () => {
        onItemHover?.(null)
    }

    return (
        <div className="legend-container" role="list" aria-label="Chart legend">
            <Stack direction="row" justify="center" wrap>
                {legendItems.map((item) => {
                    if (!item) return null

                    return (
                        <div
                            className={`legend-item ${item.isExcluded ? "excluded" : ""}`}
                            key={item.serverName}
                            role="listitem"
                            tabIndex={onItemClick ? 0 : undefined}
                            onClick={() => handleItemClick(item.id)}
                            onMouseEnter={() => handleItemMouseEnter(item.id)}
                            onMouseLeave={handleItemMouseLeave}
                            onKeyDown={(e) => {
                                if (
                                    (e.key === "Enter" || e.key === " ") &&
                                    onItemClick
                                ) {
                                    e.preventDefault()
                                    handleItemClick(item.id)
                                }
                            }}
                            aria-label={`${item.displayName} server data`}
                        >
                            <Stack direction="row" gap="5px" align="center">
                                <div
                                    className="legend-icon"
                                    style={{
                                        backgroundColor: item.color,
                                    }}
                                    aria-hidden="true"
                                />
                                <span>{item.displayName}</span>
                            </Stack>
                        </div>
                    )
                })}
            </Stack>
        </div>
    )
}

export default React.memo(GenericLegend)
