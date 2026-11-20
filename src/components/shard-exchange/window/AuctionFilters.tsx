import { ShardExchangeListingQuery } from "../../../models/ShardExchange.ts"
import useDebouncedField from "../../../hooks/useDebouncedField.ts"
import { SHARD_EXCHANGE_MAX_LEVEL } from "../../../utils/shardExchangeUtils.ts"
import { GameButton, GameCheckbox } from "../../game-ui/GameControls.tsx"

interface Props {
    query: ShardExchangeListingQuery
    // replace: update the URL without a new history entry (used while typing)
    onChange: (
        patch: Partial<ShardExchangeListingQuery>,
        replace?: boolean
    ) => void
    perUnit: boolean
    onPerUnitChange: (perUnit: boolean) => void
}

function toLevel(text: string): number | null {
    if (text.trim() === "") return null
    const level = Math.trunc(Number(text))
    if (Number.isNaN(level)) return null
    return Math.min(Math.max(level, 0), SHARD_EXCHANGE_MAX_LEVEL)
}

const levelText = (text: string) => {
    const level = toLevel(text)
    return level == null ? "" : `${level}`
}

/**
 * The bar across the top of the window: Level Range, Buyout Only, the search box, and Search.
 * Fields apply on their own shortly after typing stops; Search (or Enter) applies them at once.
 */
const AuctionFilters = ({
    query,
    onChange,
    perUnit,
    onPerUnitChange,
}: Props) => {
    const search = useDebouncedField(query.q, (q) =>
        onChange({ q, page: 1, open: null }, true)
    )
    const minLevel = useDebouncedField(
        query.minLevel == null ? "" : `${query.minLevel}`,
        (text) =>
            onChange({ minLevel: toLevel(text), page: 1, open: null }, true),
        levelText
    )
    const maxLevel = useDebouncedField(
        query.maxLevel == null ? "" : `${query.maxLevel}`,
        (text) =>
            onChange({ maxLevel: toLevel(text), page: 1, open: null }, true),
        levelText
    )

    return (
        <form
            className="sxw-filters"
            role="search"
            onSubmit={(e) => {
                e.preventDefault()
                search.flush()
                minLevel.flush()
                maxLevel.flush()
            }}
        >
            <div className="gw-panel sxw-filter-box sxw-filter-level">
                <span className="sxw-filter-label" id="sxw-level-label">
                    Level Range
                </span>
                <input
                    className="gw-box"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={SHARD_EXCHANGE_MAX_LEVEL}
                    aria-label="Lowest minimum level"
                    placeholder="1"
                    value={minLevel.text}
                    onChange={(e) => minLevel.setText(e.target.value)}
                />
                <span className="sxw-filter-to" aria-hidden="true">
                    to
                </span>
                <input
                    className="gw-box"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={SHARD_EXCHANGE_MAX_LEVEL}
                    aria-label="Highest minimum level"
                    placeholder={`${SHARD_EXCHANGE_MAX_LEVEL}`}
                    value={maxLevel.text}
                    onChange={(e) => maxLevel.setText(e.target.value)}
                />
                <GameCheckbox
                    className="sxw-filter-check"
                    checked={query.buyoutOnly}
                    onChange={(e) =>
                        onChange({
                            buyoutOnly: e.target.checked,
                            page: 1,
                            open: null,
                        })
                    }
                >
                    Buyout Only
                </GameCheckbox>
            </div>
            <div className="gw-panel sxw-filter-box sxw-filter-search">
                <div className="gw-search">
                    <input
                        type="search"
                        value={search.text}
                        maxLength={100}
                        aria-label="Search item names"
                        placeholder="Search item names"
                        onChange={(e) => search.setText(e.target.value)}
                    />
                    <button
                        type="button"
                        className="gw-search-clear"
                        aria-label="Clear search"
                        title="Clear search"
                        disabled={search.text === ""}
                        onClick={() => search.setText("")}
                    >
                        X
                    </button>
                </div>
                <GameCheckbox
                    className="sxw-filter-check"
                    checked={perUnit}
                    title="Show and sort stack prices per unit"
                    onChange={(e) => onPerUnitChange(e.target.checked)}
                >
                    Price Each
                </GameCheckbox>
            </div>
            <GameButton type="submit" className="sxw-search-button">
                Search
            </GameButton>
        </form>
    )
}

export default AuctionFilters
