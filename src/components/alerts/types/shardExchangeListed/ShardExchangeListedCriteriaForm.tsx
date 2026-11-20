import React, { useEffect, useId, useState } from "react"
import { ShardExchangeListedCriteria } from "../../../../models/Alert"
import { ShardExchangeItemSearchResult } from "../../../../models/ShardExchange"
import { searchItems } from "../../../../services/shardExchangeService"
import Checkbox from "../../../global/Checkbox"
import ServerPills from "../../shared/ServerPills"
import type { CriteriaFormProps } from "../index"

const SEARCH_DEBOUNCE_MS = 250
const MIN_QUERY_LENGTH = 2

function parsePrice(value: string): number | null {
    const digits = value.replace(/[^\d]/g, "")
    if (digits === "") return null
    const n = Number(digits)
    return Number.isFinite(n) ? n : null
}

/** Item search as you type, against the Shard Exchange item names. */
function useItemSearch(query: string) {
    const [results, setResults] = useState<ShardExchangeItemSearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        const q = query.trim()
        if (q.length < MIN_QUERY_LENGTH) {
            setResults([])
            setIsSearching(false)
            return
        }
        const controller = new AbortController()
        setIsSearching(true)
        const timer = setTimeout(() => {
            searchItems(q, controller.signal)
                .then((response) => setResults(response?.data ?? []))
                .catch(() => {
                    if (!controller.signal.aborted) setResults([])
                })
                .finally(() => {
                    if (!controller.signal.aborted) setIsSearching(false)
                })
        }, SEARCH_DEBOUNCE_MS)
        return () => {
            clearTimeout(timer)
            controller.abort()
        }
    }, [query])

    return { results, isSearching }
}

const ShardExchangeListedCriteriaForm = ({
    criteria,
    onChange,
}: CriteriaFormProps<ShardExchangeListedCriteria>) => {
    const [query, setQuery] = useState("")
    const [activeIndex, setActiveIndex] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const listId = useId()
    const { results, isSearching } = useItemSearch(query)

    const set = (patch: Partial<ShardExchangeListedCriteria>) =>
        onChange({ ...criteria, ...patch })

    const showResults = isOpen && query.trim().length >= MIN_QUERY_LENGTH

    const pickItem = (item: ShardExchangeItemSearchResult) => {
        set({ item_slug: item.slug, item_name: item.name })
        setQuery("")
        setActiveIndex(0)
        setIsOpen(false)
    }

    const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setIsOpen(true)
            setActiveIndex((i) =>
                Math.min(i + 1, Math.max(results.length - 1, 0))
            )
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActiveIndex((i) => Math.max(i - 1, 0))
        } else if (e.key === "Enter") {
            const item = results[activeIndex]
            if (showResults && item) {
                e.preventDefault()
                pickItem(item)
            }
        } else if (e.key === "Escape" && showResults) {
            // Close the list without closing the dialog around it.
            e.stopPropagation()
            setIsOpen(false)
        }
    }

    const activeOptionId =
        showResults && results[activeIndex]
            ? `${listId}-${activeIndex}`
            : undefined

    const itemName = criteria.item_name || criteria.item_slug

    return (
        <div className="alert-form">
            <div className="alert-field">
                <label
                    htmlFor={`${listId}-search`}
                    className="alert-field-label"
                >
                    Item
                </label>
                <div className="quest-picker">
                    {criteria.item_slug ? (
                        <ul className="alert-chips" aria-label="Selected item">
                            <li className="alert-chip">
                                {itemName}
                                <button
                                    type="button"
                                    className="alert-chip-remove"
                                    onClick={() =>
                                        set({ item_slug: "", item_name: null })
                                    }
                                    aria-label={`Remove ${itemName}`}
                                >
                                    ✕
                                </button>
                            </li>
                        </ul>
                    ) : (
                        <input
                            id={`${listId}-search`}
                            className="quest-picker-input"
                            type="text"
                            role="combobox"
                            aria-expanded={showResults}
                            aria-controls={listId}
                            aria-autocomplete="list"
                            aria-activedescendant={activeOptionId}
                            placeholder="Search for an item"
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
                    )}
                    {showResults && !criteria.item_slug && (
                        <ul
                            className="quest-picker-results"
                            role="listbox"
                            id={listId}
                        >
                            {results.length === 0 ? (
                                <li className="quest-picker-empty">
                                    {isSearching
                                        ? "Searching…"
                                        : "No matching items."}
                                </li>
                            ) : (
                                results.map((item, i) => (
                                    <li
                                        key={item.slug}
                                        id={`${listId}-${i}`}
                                        role="option"
                                        aria-selected={i === activeIndex}
                                        className={`quest-picker-option ${i === activeIndex ? "active" : ""}`}
                                        // mousedown so the input's blur doesn't close the list first
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            pickItem(item)
                                        }}
                                        onMouseEnter={() => setActiveIndex(i)}
                                    >
                                        <span>{item.name}</span>
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
                <span className="alert-field-hint">
                    One item per alert. Make another alert to watch more items.
                </span>
            </div>

            <ServerPills
                selected={criteria.server_names}
                onChange={(server_names) => set({ server_names })}
            />

            <div className="alert-field">
                <span className="alert-field-label">
                    Price limits{" "}
                    <span className="alert-field-optional">(optional)</span>
                </span>
                <div className="alert-price-limits">
                    <label>
                        <span className="secondary-text">Buyout up to</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Any"
                            aria-label="Maximum buyout"
                            value={
                                criteria.max_buyout?.toLocaleString("en-US") ??
                                ""
                            }
                            onChange={(e) =>
                                set({ max_buyout: parsePrice(e.target.value) })
                            }
                        />
                    </label>
                    <label>
                        <span className="secondary-text">Bid up to</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Any"
                            aria-label="Maximum bid"
                            value={
                                criteria.max_price?.toLocaleString("en-US") ??
                                ""
                            }
                            onChange={(e) =>
                                set({ max_price: parsePrice(e.target.value) })
                            }
                        />
                    </label>
                </div>
                <Checkbox
                    checked={
                        criteria.require_buyout || criteria.max_buyout != null
                    }
                    disabled={criteria.max_buyout != null}
                    onChange={(e) => set({ require_buyout: e.target.checked })}
                >
                    Only listings with a buyout
                </Checkbox>
                <span className="alert-field-hint">
                    Prices are for the whole listing, in shards.
                    &ldquo;Bid&rdquo; is the current bid, or the minimum bid
                    when there is none. The exchange is checked about once an
                    hour.
                </span>
            </div>
        </div>
    )
}

export default ShardExchangeListedCriteriaForm
