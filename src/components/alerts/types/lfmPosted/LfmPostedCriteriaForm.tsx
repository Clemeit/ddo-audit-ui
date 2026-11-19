import React, { useId, useMemo, useState } from "react"
import { LFM_DIFFICULTIES, LfmPostedCriteria } from "../../../../models/Alert"
import { Quest } from "../../../../models/Lfm"
import { SERVERS_64_BITS } from "../../../../constants/servers"
import { useQuestContext } from "../../../../contexts/QuestContext"
import PillToggleGroup from "../../../global/PillToggleGroup"
import type { CriteriaFormProps } from "../index"

const MAX_SEARCH_RESULTS = 10
const MAX_QUESTS = 20

// Only the 64-bit servers are still played on.
const SERVER_OPTIONS = [...SERVERS_64_BITS]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value }))

function parseLevel(value: string): number | null {
    if (value.trim() === "") return null
    const n = Number(value)
    return Number.isFinite(n) ? n : null
}

/** "Raid · Level 20 · Epic 32", from the public quest fields. */
function questDetails(quest: Quest): string {
    const parts: string[] = []
    if (quest.group_size === "Raid") parts.push("Raid")
    if (quest.heroic_normal_cr) parts.push(`Level ${quest.heroic_normal_cr}`)
    if (quest.epic_normal_cr) parts.push(`Epic ${quest.epic_normal_cr}`)
    return parts.join(" · ")
}

const LfmPostedCriteriaForm = ({
    criteria,
    onChange,
}: CriteriaFormProps<LfmPostedCriteria>) => {
    const { quests } = useQuestContext()
    const [query, setQuery] = useState("")
    const [activeIndex, setActiveIndex] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const listId = useId()

    const set = (patch: Partial<LfmPostedCriteria>) =>
        onChange({ ...criteria, ...patch })

    const atLimit = criteria.quest_ids.length >= MAX_QUESTS

    const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return []
        return Object.values(quests)
            .filter(
                (quest) =>
                    quest.name &&
                    quest.name.toLowerCase().includes(q) &&
                    !criteria.quest_ids.includes(quest.id)
            )
            .sort((a, b) => {
                // Names that start with the query first, then alphabetical.
                const aStarts = a.name!.toLowerCase().startsWith(q) ? 0 : 1
                const bStarts = b.name!.toLowerCase().startsWith(q) ? 0 : 1
                return aStarts - bStarts || a.name!.localeCompare(b.name!)
            })
            .slice(0, MAX_SEARCH_RESULTS)
    }, [quests, query, criteria.quest_ids])

    const showResults = isOpen && query.trim().length > 0 && !atLimit

    const addQuest = (quest: Quest) => {
        set({ quest_ids: [...criteria.quest_ids, quest.id] })
        setQuery("")
        setActiveIndex(0)
    }

    const removeQuest = (id: number) =>
        set({ quest_ids: criteria.quest_ids.filter((q) => q !== id) })

    const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setIsOpen(true)
            setActiveIndex((i) =>
                Math.min(i + 1, Math.max(searchResults.length - 1, 0))
            )
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActiveIndex((i) => Math.max(i - 1, 0))
        } else if (e.key === "Enter") {
            const quest = searchResults[activeIndex]
            if (showResults && quest) {
                e.preventDefault()
                addQuest(quest)
            }
        } else if (e.key === "Escape" && showResults) {
            // Close the list without closing the dialog around it.
            e.stopPropagation()
            setIsOpen(false)
        } else if (
            e.key === "Backspace" &&
            query === "" &&
            criteria.quest_ids.length > 0
        ) {
            removeQuest(criteria.quest_ids[criteria.quest_ids.length - 1])
        }
    }

    const activeOptionId =
        showResults && searchResults[activeIndex]
            ? `${listId}-${searchResults[activeIndex].id}`
            : undefined

    return (
        <div className="alert-form">
            <div className="alert-field">
                <label
                    htmlFor={`${listId}-search`}
                    className="alert-field-label"
                >
                    Quests and raids
                </label>
                <div className="quest-picker">
                    {criteria.quest_ids.length > 0 && (
                        <ul
                            className="alert-chips"
                            aria-label="Selected quests"
                        >
                            {criteria.quest_ids.map((id) => {
                                const name = quests[id]?.name ?? `Quest #${id}`
                                return (
                                    <li key={id} className="alert-chip">
                                        {name}
                                        <button
                                            type="button"
                                            className="alert-chip-remove"
                                            onClick={() => removeQuest(id)}
                                            aria-label={`Remove ${name}`}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                    <input
                        id={`${listId}-search`}
                        className="quest-picker-input"
                        type="text"
                        role="combobox"
                        aria-expanded={showResults}
                        aria-controls={listId}
                        aria-autocomplete="list"
                        aria-activedescendant={activeOptionId}
                        placeholder={
                            atLimit
                                ? `Up to ${MAX_QUESTS} quests per alert`
                                : criteria.quest_ids.length
                                  ? "Add another…"
                                  : "Search for a quest or raid"
                        }
                        disabled={atLimit}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setActiveIndex(0)
                            setIsOpen(true)
                        }}
                        onFocus={() => setIsOpen(true)}
                        onBlur={() => setIsOpen(false)}
                        onKeyDown={onSearchKeyDown}
                        autoComplete="off"
                    />
                    {showResults && (
                        <ul
                            className="quest-picker-results"
                            role="listbox"
                            id={listId}
                        >
                            {searchResults.length === 0 ? (
                                <li className="quest-picker-empty">
                                    No matching quests.
                                </li>
                            ) : (
                                searchResults.map((quest, i) => (
                                    <li
                                        key={quest.id}
                                        id={`${listId}-${quest.id}`}
                                        role="option"
                                        aria-selected={i === activeIndex}
                                        className={`quest-picker-option ${i === activeIndex ? "active" : ""}`}
                                        // mousedown so the input's blur doesn't close the list first
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            addQuest(quest)
                                        }}
                                        onMouseEnter={() => setActiveIndex(i)}
                                    >
                                        <span>{quest.name}</span>
                                        <span className="quest-picker-details">
                                            {questDetails(quest)}
                                        </span>
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
            </div>

            <div className="alert-field">
                <span className="alert-field-label">Servers</span>
                <PillToggleGroup
                    ariaLabel="Servers"
                    anyLabel="Any server"
                    options={SERVER_OPTIONS}
                    selected={criteria.server_names}
                    onChange={(server_names) => set({ server_names })}
                />
            </div>

            <div className="alert-field">
                <span className="alert-field-label">Difficulty</span>
                <PillToggleGroup
                    ariaLabel="Difficulty"
                    anyLabel="Any"
                    options={LFM_DIFFICULTIES.map((value) => ({
                        value: value as string,
                    }))}
                    selected={criteria.difficulties}
                    onChange={(difficulties) => set({ difficulties })}
                />
            </div>

            <div className="alert-field">
                <span className="alert-field-label">
                    Your level range{" "}
                    <span className="alert-field-optional">(optional)</span>
                </span>
                <div className="alert-level-range">
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
                    />
                    <span className="secondary-text">to</span>
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
                    />
                </div>
                <span className="alert-field-hint">
                    Only alert when the LFM's level range overlaps yours.
                </span>
            </div>
        </div>
    )
}

export default LfmPostedCriteriaForm
