import React from "react"
import ChartContainer from "./ChartContainer"
import GenericLegend from "./GenericLegend"
import TimezoneSelect from "../global/TimezoneSelect"
import FilterSelection from "./FilterSelection"
import {
    RangeEnum,
    ServerFilterEnum,
    DataTypeFilterEnum,
} from "../../models/Common"
import Stack from "../global/Stack"

export interface ChartScaffoldProps {
    // Data & fetch state
    isLoading: boolean
    isError: boolean
    scaffoldName?: string
    // Filters
    range: RangeEnum
    setRange: (r: RangeEnum) => void
    serverFilter?: ServerFilterEnum
    setServerFilter?: (f: ServerFilterEnum) => void
    dataTypeFilter?: DataTypeFilterEnum
    setDataTypeFilter?: (f: DataTypeFilterEnum) => void
    displayType?: string
    setDisplayType?: (v: string) => void
    displayTypeOptions?: string[]
    normalized?: boolean
    setNormalized?: (b: boolean) => void
    rangeOptions?: RangeEnum[]
    // Legend
    showLegend?: boolean
    legendData?: any[]
    excludedSeries?: string[]
    onLegendItemClick?: (id: string) => void
    onLegendItemHover?: (id: string | null) => void
    // Timezone toggle
    showTimezone?: boolean
    // Chart specifics
    height?: number | string
    children: React.ReactNode
}

/**
 * Structural component providing the common layout pattern:
 * 1. FilterSelection
 * 2. ChartContainer wrapping the chart
 * 3. Optional GenericLegend
 * 4. Optional TimezoneSelect
 *
 * Prefer composition via this component over the HOC unless you need to decorate many charts quickly.
 */
export const ChartScaffold: React.FC<ChartScaffoldProps> = ({
    isLoading,
    isError,
    range,
    setRange,
    serverFilter,
    setServerFilter,
    dataTypeFilter,
    setDataTypeFilter,
    displayType,
    setDisplayType,
    displayTypeOptions,
    normalized,
    setNormalized,
    rangeOptions,
    showLegend,
    legendData,
    excludedSeries,
    onLegendItemClick,
    onLegendItemHover,
    showTimezone,
    height = 500,
    scaffoldName,
    children,
}) => {
    return (
        <Stack gap="20px" direction="column">
            <FilterSelection
                range={range}
                setRange={setRange}
                serverFilter={serverFilter}
                setServerFilter={setServerFilter}
                dataTypeFilter={dataTypeFilter}
                setDataTypeFilter={setDataTypeFilter}
                displayType={displayType}
                setDisplayType={setDisplayType}
                displayTypeOptions={displayTypeOptions}
                normalized={normalized}
                setNormalized={setNormalized}
                rangeOptions={rangeOptions}
                scaffoldName={scaffoldName}
            />
            <ChartContainer
                isError={isError}
                isLoading={isLoading}
                height={height}
            >
                {children}
            </ChartContainer>
            {showLegend && legendData && legendData.length > 0 && (
                <GenericLegend
                    nivoData={legendData}
                    excludedSeries={excludedSeries}
                    onItemClick={onLegendItemClick}
                    onItemHover={onLegendItemHover}
                    scaffoldName={scaffoldName}
                />
            )}
            {showLegend && legendData && legendData.length === 0 && (
                <div className="legend-container">
                    <div className="legend-item">&nbsp;</div>
                </div>
            )}
            {showTimezone && <TimezoneSelect />}
        </Stack>
    )
}

/**
 * Higher-order component for rapidly wrapping existing chart components with the ChartScaffold layout.
 * Accepts a function mapping incoming props to scaffold props + chart node.
 */
export function withChartScaffold<P>(
    map: (
        props: P
    ) => Omit<ChartScaffoldProps, "children"> & { chart: React.ReactNode }
) {
    return function ChartWithScaffold(props: P) {
        const { chart, ...scaffold } = map(props)
        return <ChartScaffold {...scaffold}>{chart}</ChartScaffold>
    }
}

export default ChartScaffold
