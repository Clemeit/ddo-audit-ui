import React from "react"
import Stack from "../global/Stack.tsx"
import {
    DataTypeFilterEnum,
    RangeEnum,
    ServerFilterEnum,
} from "../../models/Common.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import { DAYS_OF_WEEK } from "../../constants/dates.ts"

interface Props {
    range?: RangeEnum
    setRange?: (range: RangeEnum) => void
    serverFilter?: ServerFilterEnum
    setServerFilter?: (filter: ServerFilterEnum) => void
    dataTypeFilter?: DataTypeFilterEnum
    setDataTypeFilter?: (filter: DataTypeFilterEnum) => void
    threshold?: number
    setThreshold?: (value: number) => void
    dayFilter?: string
    setDayFilter?: (value: string) => void
    displayType?: string
    setDisplayType?: (value: string) => void
    rangeOptions?: RangeEnum[]
}

const FilterSelection = ({
    range,
    setRange,
    serverFilter,
    setServerFilter,
    dataTypeFilter,
    setDataTypeFilter,
    threshold,
    setThreshold,
    dayFilter,
    setDayFilter,
    displayType,
    setDisplayType,
    rangeOptions = Object.values(RangeEnum) as RangeEnum[],
}: Props) => {
    const SERVER_FILTER_OPTIONS = Object.values(ServerFilterEnum) as string[]
    const DATA_TYPE_FILTER_OPTIONS = Object.values(
        DataTypeFilterEnum
    ) as string[]
    const DAY_FILTER_OPTIONS = ["All", ...DAYS_OF_WEEK]
    const DISPLAY_TYPES = ["Stacked", "Grouped"]

    return (
        <Stack
            direction="row"
            gap="10px"
            className="full-column-on-small-mobile"
            style={{
                flexWrap: "wrap",
                boxSizing: "border-box",
            }}
        >
            {[
                {
                    label: "Range",
                    id: "hourlyPopulationDistributionRange",
                    value: range,
                    onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                        setRange(e.target.value as RangeEnum),
                    options: rangeOptions,
                    optionLabel: (opt: string) => toSentenceCase(opt),
                },
                {
                    label: "Server filter",
                    id: "hourlyPopulationDistributionServerFilter",
                    value: serverFilter,
                    onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                        setServerFilter(e.target.value as ServerFilterEnum),
                    options: SERVER_FILTER_OPTIONS,
                    optionLabel: (opt: string) => opt,
                },
                {
                    label: "Data type",
                    id: "hourlyPopulationDistributionDataTypeFilter",
                    value: dataTypeFilter,
                    onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                        setDataTypeFilter(e.target.value as DataTypeFilterEnum),
                    options: DATA_TYPE_FILTER_OPTIONS,
                    optionLabel: (opt: string) => opt,
                },
                {
                    label: "Day",
                    id: "dayFilter",
                    value: dayFilter,
                    onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                        setDayFilter(e.target.value),
                    options: DAY_FILTER_OPTIONS,
                    optionLabel: (opt: string) => opt,
                },
                {
                    label: "Display type",
                    id: "displayTypeFilter",
                    value: displayType,
                    onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                        setDisplayType(e.target.value),
                    options: DISPLAY_TYPES,
                    optionLabel: (opt: string) => opt,
                },
            ]
                .filter((config) => !!config.value)
                .map((config) => (
                    <Stack
                        className="full-width-on-small-mobile"
                        direction="column"
                        gap="2px"
                        key={config.id}
                        style={{
                            width: "150px",
                        }}
                    >
                        <label
                            htmlFor={config.id}
                            style={{
                                color: "var(--secondary-text)",
                                fontWeight: "bolder",
                            }}
                        >
                            {config.label}
                        </label>
                        <select
                            id={config.id}
                            value={config.value}
                            onChange={config.onChange}
                            style={{ width: "100%" }}
                        >
                            {config.options.map((opt) => (
                                <option key={opt} value={opt}>
                                    {config.optionLabel(opt)}
                                </option>
                            ))}
                        </select>
                    </Stack>
                ))}
            {!!threshold && (
                <Stack
                    className="full-width-on-small-mobile"
                    direction="column"
                    gap="2px"
                    key="thresholdFilter"
                    style={{ width: "150px" }}
                >
                    <label
                        htmlFor="thresholdFilter"
                        style={{
                            color: "var(--secondary-text)",
                            fontWeight: "bolder",
                        }}
                    >
                        Threshold
                    </label>
                    <input
                        id="thresholdFilter"
                        type="number"
                        step={0.05}
                        min={0.25}
                        max={0.95}
                        value={threshold}
                        onChange={(e) => setThreshold(Number(e.target.value))}
                        style={{ width: "100%", boxSizing: "border-box" }}
                    />
                </Stack>
            )}
        </Stack>
    )
}

export default FilterSelection
