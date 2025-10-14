import React from "react"
import Stack from "../global/Stack.tsx"
import Select from "../global/Select.tsx"
import { RaidTimerCharacterSortEnum } from "../../models/Common.ts"
import useIsMobile from "../../hooks/useIsMobile.ts"

export interface SortState {
    type: RaidTimerCharacterSortEnum
    order: string
}

interface Props {
    value: SortState
    onChange: (next: SortState) => void
}

const TimerSortControls = ({ value, onChange }: Props) => {
    const disableOrder = value.type === RaidTimerCharacterSortEnum.RECENT_RAID
    const isMobile = useIsMobile()
    return (
        <Stack gap="10px">
            <Stack
                className="full-width-on-small-mobile"
                direction="column"
                gap="2px"
                style={{ width: "100%" }}
            >
                <label
                    htmlFor="sortCharacterByType"
                    style={{
                        color: "var(--secondary-text)",
                        fontWeight: "bolder",
                    }}
                >
                    Sort Characters By
                </label>
                <Stack
                    direction="row"
                    gap="3px"
                    style={{ width: "100%", flexWrap: "wrap" }}
                >
                    <Select
                        id="sortCharacterByType"
                        className="full-width-on-small-mobile"
                        value={value.type}
                        onChange={(e) =>
                            onChange({
                                type: e.target
                                    .value as RaidTimerCharacterSortEnum,
                                order: "asc",
                            })
                        }
                        style={{ width: "175px" }}
                    >
                        {Object.values(RaidTimerCharacterSortEnum).map(
                            (opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            )
                        )}
                    </Select>
                    {!disableOrder && (
                        <Select
                            id="sortCharacterByOrder"
                            className="full-width-on-small-mobile"
                            value={value.order}
                            onChange={(e) =>
                                onChange({ ...value, order: e.target.value })
                            }
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </Select>
                    )}
                </Stack>
            </Stack>
        </Stack>
    )
}

export default TimerSortControls
