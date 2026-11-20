import { ReactNode, useEffect, useLayoutEffect, useRef } from "react"
import {
    ShardExchangeListing,
    ShardExchangeMyBid,
    ShardExchangeSort,
    SortDirection,
} from "../../../models/ShardExchange.ts"
import {
    formatAge,
    formatShards,
    formatTimeLeftLong,
    unitPrice,
} from "../../../utils/shardExchangeUtils.ts"
import { CategoryGlyph } from "../../game-ui/GameIcons.tsx"
import { ShardAmount } from "../../game-ui/GameControls.tsx"
import BidHistoryPanel from "./BidHistoryPanel.tsx"

export type AuctionListItem =
    | { kind: "section"; key: string; title: string }
    | {
          kind: "row"
          listing: ShardExchangeListing
          myBid?: ShardExchangeMyBid
          // Extra line under the name, e.g. the server of a bid elsewhere
          note?: string
      }

interface Props {
    server: string
    items: AuctionListItem[]
    // "auctions": the fourth column is the buyout; "bids": it is your bid
    mode: "auctions" | "bids"
    sort: ShardExchangeSort
    dir: SortDirection
    onSort: (sort: ShardExchangeSort) => void
    perUnit: boolean
    openRef: string | null
    onToggle: (ref: string) => void
    now: number
    myBids?: Map<string, ShardExchangeMyBid>
    characterName?: (id: number) => string
    isLoading?: boolean
    emptyMessage: ReactNode
    onOpenHistory?: (listing: ShardExchangeListing, server: string) => void
}

interface Column {
    label: string
    sort?: ShardExchangeSort
    title?: string
}

const perUnitValue = (
    value: number | null,
    listing: ShardExchangeListing,
    perUnit: boolean
) => (perUnit ? (unitPrice(value, listing.quantity) ?? value) : value)

const AuctionList = ({
    server,
    items,
    mode,
    sort,
    dir,
    onSort,
    perUnit,
    openRef,
    onToggle,
    now,
    myBids,
    characterName,
    isLoading = false,
    emptyMessage,
    onOpenHistory,
}: Props) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const rootRef = useRef<HTMLDivElement>(null)

    const columns: Column[] = [
        { label: "Name", sort: "name" },
        { label: "Duration", sort: "time_left" },
        {
            label: perUnit ? "Price Each" : "Current Price",
            sort: perUnit ? "unit_price" : "price",
            title: "The top bid, or the opening bid when nobody has bid",
        },
        mode === "auctions"
            ? {
                  label: perUnit ? "Buyout Each" : "Buyout",
                  sort: perUnit ? "unit_buyout" : "buyout",
              }
            : { label: "Your Bid" },
    ]

    // The header spans the scrollbar, the rows don't: line the columns up by its width
    useLayoutEffect(() => {
        const scroller = scrollRef.current
        const root = rootRef.current
        if (!scroller || !root) return
        const update = () => {
            const width = scroller.offsetWidth - scroller.clientWidth
            root.style.setProperty("--sxw-scrollbar", `${width}px`)
        }
        update()
        const observer = new ResizeObserver(update)
        observer.observe(scroller)
        return () => observer.disconnect()
    }, [])

    // Back to the top when the rows are replaced (new page, sort or filter)
    const firstRow = items.find((i) => i.kind === "row")
    const firstKey = firstRow?.kind === "row" ? firstRow.listing.ref : ""
    const openRefRef = useRef(openRef)
    openRefRef.current = openRef
    useEffect(() => {
        if (!openRefRef.current) scrollRef.current?.scrollTo({ top: 0 })
    }, [firstKey, sort, dir])

    // Bring a row opened from the URL into view
    useEffect(() => {
        if (!openRef) return
        const el = scrollRef.current?.querySelector<HTMLElement>(
            `[data-ref="${CSS.escape(openRef)}"]`
        )
        el?.scrollIntoView({ block: "nearest" })
    }, [openRef, firstKey])

    const renderHeader = (column: Column) => {
        const isSorted = column.sort != null && column.sort === sort
        const ariaSort = isSorted
            ? dir === "asc"
                ? "ascending"
                : "descending"
            : undefined
        return (
            <div
                key={column.label}
                role="columnheader"
                aria-sort={ariaSort}
                className={`sxw-col-head${isSorted ? " sorted" : ""}`}
                title={column.title}
            >
                {column.sort ? (
                    <button
                        type="button"
                        onClick={() => onSort(column.sort as ShardExchangeSort)}
                    >
                        {isSorted && (
                            <span
                                className={`sxw-sort-arrow ${dir}`}
                                aria-hidden="true"
                            />
                        )}
                        {column.label}
                    </button>
                ) : (
                    <span>{column.label}</span>
                )}
            </div>
        )
    }

    const renderMyBidLine = (mine: ShardExchangeMyBid | undefined) => {
        if (!mine) return null
        const name = characterName?.(mine.my_bid.character_id)
        const status =
            mine.status === "leading"
                ? "Top bid"
                : mine.status === "outbid"
                  ? "Outbid"
                  : "Ended"
        return (
            <span className={`sxw-mine ${mine.status}`}>
                {status}
                {name ? ` · ${name}` : ""}
            </span>
        )
    }

    const renderRow = (
        item: Extract<AuctionListItem, { kind: "row" }>,
        index: number
    ) => {
        const { listing, note } = item
        const mine = item.myBid ?? myBids?.get(listing.ref)
        const isOpen = openRef === listing.ref
        const detailsId = `sxw-details-${index}`
        const bidCount = listing.bids?.length ?? 0
        const price = perUnitValue(listing.current_price, listing, perUnit)
        const ended = mine?.status === "ended"
        const durationText = ended
            ? `Ended ${formatAge(mine?.ended_at ?? listing.expires_at, now)}`
            : formatTimeLeftLong(listing.expires_at, now)

        let fourth: ReactNode
        if (mode === "auctions") {
            const buyout = perUnitValue(listing.buyout, listing, perUnit)
            fourth = (
                <>
                    {buyout != null && <ShardAmount value={buyout} />}
                    {renderMyBidLine(mine)}
                </>
            )
        } else {
            fourth = mine ? (
                <>
                    <ShardAmount value={mine.my_bid.amount} />
                    {renderMyBidLine(mine)}
                </>
            ) : null
        }

        return (
            <li
                key={listing.ref}
                className={`sxw-item${isOpen ? " open" : ""}`}
                data-ref={listing.ref}
            >
                <button
                    type="button"
                    className={`sxw-row${isOpen ? " selected" : ""}${ended ? " ended" : ""}`}
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? detailsId : undefined}
                    onClick={() => onToggle(listing.ref)}
                >
                    <span className="sxw-cell sxw-cell-name">
                        <span
                            className={`sxw-icon-frame${listing.bound ? " bound" : ""}`}
                            title={listing.bound ? "Bound" : undefined}
                        >
                            <CategoryGlyph category={listing.category} />
                            {listing.quantity != null &&
                                listing.quantity > 1 && (
                                    <span className="sxw-stack">
                                        {listing.quantity.toLocaleString()}
                                    </span>
                                )}
                        </span>
                        <span className="sxw-name">
                            <span className="sxw-name-text">
                                {listing.name ?? "Unknown item"}
                            </span>
                            {note && (
                                <span className="sxw-name-note">{note}</span>
                            )}
                        </span>
                    </span>
                    <span className="sxw-cell sxw-cell-duration">
                        {durationText}
                    </span>
                    <span className="sxw-cell sxw-cell-price">
                        <ShardAmount value={price} />
                        {bidCount > 0 ? (
                            <span className="sxw-bid-count">
                                {bidCount} bid{bidCount === 1 ? "" : "s"}
                            </span>
                        ) : (
                            <span className="sxw-bid-count none">no bids</span>
                        )}
                    </span>
                    <span className="sxw-cell sxw-cell-price">{fourth}</span>
                    <span className="gw-visually-hidden">
                        {isOpen ? "Hide bid history" : "Show bid history"}
                    </span>
                </button>
                {isOpen && (
                    <BidHistoryPanel
                        id={detailsId}
                        server={item.myBid?.server ?? server}
                        listing={listing}
                        myBid={mine}
                        characterName={characterName}
                        now={now}
                        onOpenHistory={onOpenHistory}
                    />
                )}
            </li>
        )
    }

    const rowCount = items.filter((i) => i.kind === "row").length

    return (
        <div
            ref={rootRef}
            className={`sxw-list${isLoading ? " loading" : ""}`}
            aria-busy={isLoading}
        >
            <div className="sxw-list-head" role="row">
                {columns.map(renderHeader)}
            </div>
            <div ref={scrollRef} className="sxw-list-scroll gw-scroll">
                {rowCount === 0 ? (
                    <div className="sxw-list-empty">
                        {isLoading ? "Loading…" : emptyMessage}
                    </div>
                ) : (
                    <ul className="sxw-rows" aria-label="Listings">
                        {items.map((item, i) =>
                            item.kind === "section" ? (
                                <li key={item.key} className="sxw-section">
                                    <h3>{item.title}</h3>
                                </li>
                            ) : (
                                renderRow(item, i)
                            )
                        )}
                    </ul>
                )}
            </div>
        </div>
    )
}

export const formatListingCount = (n: number) =>
    `${formatShards(n)} listing${n === 1 ? "" : "s"}`

export default AuctionList
