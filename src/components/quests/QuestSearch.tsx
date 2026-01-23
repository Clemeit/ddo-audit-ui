import React from "react"
import Stack from "../global/Stack"
import { MIN_LEVEL } from "../../constants/game"
import { clamp } from "../../utils/numberUtils"
import Button from "../global/Button"
import Checkbox from "../global/Checkbox"
import { useQuestContext } from "../../contexts/QuestContext"

interface Props {
    questFilter: string
    setQuestFilter: React.Dispatch<React.SetStateAction<string>>
    minimumLevel: number
    setMinimumLevel: React.Dispatch<React.SetStateAction<number>>
    maximumLevel: number
    setMaximumLevel: React.Dispatch<React.SetStateAction<number>>
    isLevelRange: boolean
    setIsLevelRange: React.Dispatch<React.SetStateAction<boolean>>
    showOnlyQuestsWithMetrics: boolean
    setShowOnlyQuestsWithMetrics: React.Dispatch<React.SetStateAction<boolean>>
}

const QuestSearch = ({
    questFilter,
    setQuestFilter,
    minimumLevel,
    setMinimumLevel,
    maximumLevel,
    setMaximumLevel,
    isLevelRange,
    setIsLevelRange,
    showOnlyQuestsWithMetrics,
    setShowOnlyQuestsWithMetrics,
}: Props) => {
    const { maxQuestLevel } = useQuestContext()

    console.log("maxQuestLevel", maxQuestLevel)

    const setToDefaults = () => {
        setQuestFilter("")
        setMinimumLevel(MIN_LEVEL)
        setMaximumLevel(maxQuestLevel)
    }

    return (
        <Stack
            direction="row"
            gap="10px"
            style={{ flexWrap: "wrap", width: "100%", alignItems: "flex-end" }}
        >
            <Stack
                className="full-width-on-smallish-mobile"
                direction="column"
                gap="2px"
                style={{
                    boxSizing: "border-box",
                }}
            >
                <label
                    htmlFor="quest-name"
                    className="label"
                    style={{
                        color: "var(--secondary-text)",
                        fontWeight: "bold",
                    }}
                >
                    Quest Name
                </label>
                <input
                    type="text"
                    placeholder="Search by name/pack..."
                    className="full-width-on-smallish-mobile"
                    id="quest-name"
                    value={questFilter}
                    onChange={(e) => {
                        setQuestFilter(e.target.value || "")
                    }}
                />
            </Stack>
            <Stack
                className="full-width-on-smallish-mobile"
                direction="column"
                gap="2px"
                style={{
                    boxSizing: "border-box",
                }}
            >
                <label
                    htmlFor="quest-min-level"
                    className="label"
                    style={{
                        color: "var(--secondary-text)",
                        fontWeight: "bold",
                    }}
                >
                    {isLevelRange ? "Min Level" : "Quest Level"}
                </label>
                <input
                    type="number"
                    className="full-width-on-smallish-mobile"
                    id="quest-min-level"
                    style={{
                        width: "120px",
                        boxSizing: "border-box",
                    }}
                    value={minimumLevel}
                    onChange={(e) => {
                        const value: number = parseInt(
                            e.target.value || MIN_LEVEL.toString()
                        )
                        setMinimumLevel(clamp(value, MIN_LEVEL, maxQuestLevel))
                    }}
                    min={MIN_LEVEL}
                    max={maxQuestLevel}
                />
            </Stack>
            {isLevelRange && (
                <Stack
                    className="full-width-on-smallish-mobile"
                    direction="column"
                    gap="2px"
                    style={{
                        boxSizing: "border-box",
                    }}
                >
                    <label
                        htmlFor="quest-max-level"
                        className="label"
                        style={{
                            color: "var(--secondary-text)",
                            fontWeight: "bold",
                        }}
                    >
                        Max Level
                    </label>
                    <input
                        type="number"
                        className="full-width-on-smallish-mobile"
                        id="quest-max-level"
                        style={{
                            width: "120px",
                            boxSizing: "border-box",
                        }}
                        value={maximumLevel}
                        onChange={(e) => {
                            const value: number = parseInt(
                                e.target.value || MIN_LEVEL.toString()
                            )
                            setMaximumLevel(
                                clamp(value, MIN_LEVEL, maxQuestLevel)
                            )
                        }}
                        min={MIN_LEVEL}
                        max={maxQuestLevel}
                    />
                </Stack>
            )}
            <Checkbox
                checked={isLevelRange}
                onChange={(e) => setIsLevelRange(e.target.checked)}
            >
                Level Range
            </Checkbox>
            <Checkbox
                checked={showOnlyQuestsWithMetrics}
                onChange={(e) => setShowOnlyQuestsWithMetrics(e.target.checked)}
            >
                Show only quests with metrics
            </Checkbox>
            <Button type="secondary" small onClick={setToDefaults}>
                Clear All
            </Button>
        </Stack>
    )
}

export default QuestSearch
