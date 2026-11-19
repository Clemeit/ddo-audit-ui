import { useEffect, useRef, useState } from "react"
import { ShardExchangeListingQuery } from "../../models/ShardExchange.ts"
import useDebounce from "../../hooks/useDebounce.ts"
import Checkbox from "../global/Checkbox.tsx"
import Button from "../global/Button.tsx"
import { SHARD_EXCHANGE_MAX_LEVEL } from "../../utils/shardExchangeUtils.ts"

const DEBOUNCE_MS = 400

interface Props {
    query: ShardExchangeListingQuery
    // replace: update the URL without a new history entry (used while typing)
    onChange: (
        patch: Partial<ShardExchangeListingQuery>,
        replace?: boolean
    ) => void
    onReset: () => void
    showMineToggle?: boolean
}

/**
 * A text field whose value is sent `DEBOUNCE_MS` after the user stops typing, and which follows
 * the value it is given when that changes from outside (back/forward, reset).
 */
function useDebouncedField(
    value: string,
    commit: (value: string) => void,
    // What the value becomes once it has been through the URL (so typing "ring " isn't undone)
    normalize: (value: string) => string = (v) => v.trim()
) {
    const [text, setText] = useState(value)
    const { debouncedValue, refreshDebounce } = useDebounce(text, DEBOUNCE_MS)
    const lastCommitted = useRef(value)
    const commitRef = useRef(commit)
    commitRef.current = commit
    const normalizeRef = useRef(normalize)
    normalizeRef.current = normalize

    useEffect(() => {
        const normalized = normalizeRef.current(debouncedValue)
        if (normalized !== lastCommitted.current) {
            lastCommitted.current = normalized
            commitRef.current(debouncedValue)
        }
    }, [debouncedValue])

    useEffect(() => {
        if (value !== lastCommitted.current) {
            lastCommitted.current = value
            setText(value)
        }
    }, [value])

    return { text, setText, flush: refreshDebounce }
}

function toLevel(text: string): number | null {
    if (text.trim() === "") return null
    const level = Math.trunc(Number(text))
    if (Number.isNaN(level)) return null
    return Math.min(Math.max(level, 0), SHARD_EXCHANGE_MAX_LEVEL)
}

const ListingFilters = ({
    query,
    onChange,
    onReset,
    showMineToggle = false,
}: Props) => {
    const search = useDebouncedField(query.q, (q) =>
        onChange({ q, page: 1 }, true)
    )
    const levelText = (text: string) => {
        const level = toLevel(text)
        return level == null ? "" : `${level}`
    }
    const minLevel = useDebouncedField(
        query.minLevel == null ? "" : `${query.minLevel}`,
        (text) => onChange({ minLevel: toLevel(text), page: 1 }, true),
        levelText
    )
    const maxLevel = useDebouncedField(
        query.maxLevel == null ? "" : `${query.maxLevel}`,
        (text) => onChange({ maxLevel: toLevel(text), page: 1 }, true),
        levelText
    )

    const isFiltered =
        query.q.trim() !== "" ||
        query.minLevel != null ||
        query.maxLevel != null ||
        query.buyoutOnly ||
        query.mine ||
        query.category != null

    return (
        <form
            className="sx-filters"
            role="search"
            onSubmit={(e) => {
                e.preventDefault()
                search.flush()
                minLevel.flush()
                maxLevel.flush()
            }}
        >
            <label className="sx-filter sx-filter-search">
                <span className="sx-filter-label">Item name</span>
                <input
                    type="search"
                    value={search.text}
                    maxLength={100}
                    placeholder="Search item names"
                    onChange={(e) => search.setText(e.target.value)}
                />
            </label>
            <fieldset className="sx-filter sx-filter-level">
                <legend className="sx-filter-label">Level</legend>
                <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={SHARD_EXCHANGE_MAX_LEVEL}
                    aria-label="Lowest minimum level"
                    placeholder="Min"
                    value={minLevel.text}
                    onChange={(e) => minLevel.setText(e.target.value)}
                />
                <span aria-hidden="true">–</span>
                <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={SHARD_EXCHANGE_MAX_LEVEL}
                    aria-label="Highest minimum level"
                    placeholder="Max"
                    value={maxLevel.text}
                    onChange={(e) => maxLevel.setText(e.target.value)}
                />
            </fieldset>
            <div className="sx-filter sx-filter-buyout">
                <Checkbox
                    checked={query.buyoutOnly}
                    onChange={(e) =>
                        onChange({ buyoutOnly: e.target.checked, page: 1 })
                    }
                >
                    Buyout only
                </Checkbox>
            </div>
            {showMineToggle && (
                <div className="sx-filter sx-filter-buyout">
                    <Checkbox
                        checked={query.mine}
                        onChange={(e) =>
                            onChange({ mine: e.target.checked, page: 1 })
                        }
                    >
                        My bids only
                    </Checkbox>
                </div>
            )}
            {isFiltered && (
                <Button type="secondary" onClick={onReset}>
                    Clear filters
                </Button>
            )}
            {/* Lets Enter apply the text fields at once */}
            <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
        </form>
    )
}

export default ListingFilters
