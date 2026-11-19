import { useMemo, useState } from "react"
import { LFM_DIFFICULTIES, LfmPostedCriteria } from "../../../../models/Alert"
import { SERVER_NAMES } from "../../../../constants/servers"
import { useQuestContext } from "../../../../contexts/QuestContext"
import Checkbox from "../../../global/Checkbox"
import Stack from "../../../global/Stack"
import type { CriteriaFormProps } from "../index"

const MAX_SEARCH_RESULTS = 12

function parseLevel(value: string): number | null {
    if (value.trim() === "") return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
}

function toggle<T>(list: T[], item: T): T[] {
    return list.includes(item)
        ? list.filter((x) => x !== item)
        : [...list, item]
}

const LfmPostedCriteriaForm = ({
    criteria,
    onChange,
}: CriteriaFormProps<LfmPostedCriteria>) => {
    const { quests } = useQuestContext()
    const [query, setQuery] = useState("")

    const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (q.length < 2) return []
        return Object.values(quests)
            .filter(
                (quest) =>
                    quest.name &&
                    quest.name.toLowerCase().includes(q) &&
                    !criteria.quest_ids.includes(quest.id)
            )
            .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
            .slice(0, MAX_SEARCH_RESULTS)
    }, [quests, query, criteria.quest_ids])

    const set = (patch: Partial<LfmPostedCriteria>) =>
        onChange({ ...criteria, ...patch })

    return (
        <Stack direction="column" gap="20px" className="alert-criteria-form">
            <Stack direction="column" gap="6px">
                <label htmlFor="alert-quest-search" className="input-label">
                    Quests
                </label>
                {criteria.quest_ids.length > 0 && (
                    <div className="alert-chips">
                        {criteria.quest_ids.map((id) => (
                            <button
                                key={id}
                                type="button"
                                className="alert-chip"
                                onClick={() =>
                                    set({
                                        quest_ids: criteria.quest_ids.filter(
                                            (q) => q !== id
                                        ),
                                    })
                                }
                                aria-label={`Remove ${quests[id]?.name ?? `quest ${id}`}`}
                            >
                                {quests[id]?.name ?? `Quest #${id}`} ✕
                            </button>
                        ))}
                    </div>
                )}
                <input
                    id="alert-quest-search"
                    type="text"
                    placeholder="Search for a quest or raid"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                    style={{ width: "100%", boxSizing: "border-box" }}
                />
                {searchResults.length > 0 && (
                    <ul className="alert-search-results">
                        {searchResults.map((quest) => (
                            <li key={quest.id}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        set({
                                            quest_ids: [
                                                ...criteria.quest_ids,
                                                quest.id,
                                            ],
                                        })
                                        setQuery("")
                                    }}
                                >
                                    {quest.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {query.trim().length >= 2 && searchResults.length === 0 && (
                    <span className="secondary-text">No matching quests.</span>
                )}
            </Stack>

            <Stack direction="column" gap="6px">
                <span className="input-label">
                    Servers{" "}
                    <span className="secondary-text">(none = any server)</span>
                </span>
                <div className="alert-checkbox-grid">
                    {SERVER_NAMES.map((server) => (
                        <Checkbox
                            key={server}
                            checked={criteria.server_names.includes(server)}
                            onChange={() =>
                                set({
                                    server_names: toggle(
                                        criteria.server_names,
                                        server
                                    ),
                                })
                            }
                        >
                            {server}
                        </Checkbox>
                    ))}
                </div>
            </Stack>

            <Stack direction="column" gap="6px">
                <span className="input-label">
                    Your level range{" "}
                    <span className="secondary-text">
                        (alerts when the LFM's levels overlap it)
                    </span>
                </span>
                <Stack direction="row" gap="10px" align="center">
                    <input
                        type="number"
                        aria-label="Minimum level"
                        placeholder="Min"
                        min={1}
                        max={50}
                        value={criteria.min_level ?? ""}
                        onChange={(e) =>
                            set({ min_level: parseLevel(e.target.value) })
                        }
                        style={{ width: "80px" }}
                    />
                    <span>to</span>
                    <input
                        type="number"
                        aria-label="Maximum level"
                        placeholder="Max"
                        min={1}
                        max={50}
                        value={criteria.max_level ?? ""}
                        onChange={(e) =>
                            set({ max_level: parseLevel(e.target.value) })
                        }
                        style={{ width: "80px" }}
                    />
                </Stack>
            </Stack>

            <Stack direction="column" gap="6px">
                <span className="input-label">
                    Difficulties{" "}
                    <span className="secondary-text">(none = any)</span>
                </span>
                <div className="alert-checkbox-grid">
                    {LFM_DIFFICULTIES.map((difficulty) => (
                        <Checkbox
                            key={difficulty}
                            checked={criteria.difficulties.includes(difficulty)}
                            onChange={() =>
                                set({
                                    difficulties: toggle(
                                        criteria.difficulties,
                                        difficulty
                                    ),
                                })
                            }
                        >
                            {difficulty}
                        </Checkbox>
                    ))}
                </div>
            </Stack>
        </Stack>
    )
}

export default LfmPostedCriteriaForm
