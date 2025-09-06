import React from "react"
import Stack from "../global/Stack.tsx"
import {
    DataTypeFilterEnum,
    RangeEnum,
    ServerFilterEnum,
} from "../../models/Population.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"

interface Props {
    range: RangeEnum
    setRange: (range: RangeEnum) => void
    serverFilter: ServerFilterEnum
    setServerFilter: (filter: ServerFilterEnum) => void
    dataTypeFilter: DataTypeFilterEnum
    setDataTypeFilter: (filter: DataTypeFilterEnum) => void
}

const FilterSelection = ({
    range,
    setRange,
    serverFilter,
    setServerFilter,
    dataTypeFilter,
    setDataTypeFilter,
}: Props) => {
    const RANGE_OPTIONS = Object.values(RangeEnum) as string[]
    const SERVER_FILTER_OPTIONS = Object.values(ServerFilterEnum) as string[]
    const DATA_TYPE_FILTER_OPTIONS = Object.values(
        DataTypeFilterEnum
    ) as string[]

    return (
        <Stack
            direction="row"
            gap="10px"
            className="full-column-on-small-mobile"
        >
            {[
                {
                    label: "Range",
                    id: "hourlyPopulationDistributionRange",
                    value: range,
                    onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                        setRange(e.target.value as RangeEnum),
                    options: RANGE_OPTIONS,
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
            ].map((config) => (
                <Stack
                    className="full-width-on-small-mobile"
                    direction="column"
                    gap="2px"
                    key={config.id}
                    style={{ width: "150px" }}
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
        </Stack>
    )
}

export default FilterSelection
