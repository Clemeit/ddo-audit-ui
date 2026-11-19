import {
    ShardExchangeListing,
    ShardExchangeMyBid,
    ShardExchangeSort,
    SortDirection,
} from "../../models/ShardExchange.ts"
import {
    formatAge,
    formatDateTime,
    formatShards,
    formatTimeLeft,
    shardExchangePath,
    unitPrice,
} from "../../utils/shardExchangeUtils.ts"
import { useLayoutEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import useWindowSize from "../../hooks/useWindowSize.ts"
import Link from "../global/Link.tsx"
import { ReactComponent as UpSVG } from "../../assets/svg/contract.svg"
import { ReactComponent as DownSVG } from "../../assets/svg/expand.svg"

interface Props {
    server: string
    listings: ShardExchangeListing[]
    now: number
    sort: ShardExchangeSort
    dir: SortDirection
    onSort: (sort: ShardExchangeSort) => void
    isLoading?: boolean
    // Cap the height to the window and scroll inside the table
    fitViewport?: boolean
    // Off on an item's own page, where every row is that item
    linkItems?: boolean
    emptyMessage?: string
    myBids?: Map<string, ShardExchangeMyBid>
    characterName?: (id: number) => string
}

interface Column {
    label: string
    sort?: ShardExchangeSort
    className?: string
    title?: string
}

const COLUMNS: Column[] = [
    { label: "Item", sort: "name" },
    { label: "Level", className: "sx-col-number" },
    { label: "Time left", sort: "time_left" },
    {
        label: "Current price",
        sort: "price",
        className: "sx-col-number",
        title: "The current bid, or the minimum bid when nobody has bid",
    },
    { label: "Buyout", sort: "buyout", className: "sx-col-number" },
    {
        label: "Buyout each",
        sort: "unit_buyout",
        className: "sx-col-number",
        title: "Buyout price per unit, for stacks",
    },
]

const ListingsTable = ({
    server,
    listings,
    now,
    sort,
    dir,
    onSort,
    isLoading = false,
    fitViewport = false,
    linkItems = true,
    emptyMessage = "No listings match your search.",
    myBids,
    characterName,
}: Props) => {
    const { isMobile } = useWindowSize()
    const location = useLocation()
    const containerRef = useRef<HTMLDivElement>(null)

    // Cap the table so the pagination controls below it stay on screen. The
    // height is written straight to the element: going through state would
    // skip the re-render when the value is unchanged, leaving the cleared
    // style in place.
    useLayoutEffect(() => {
        const el = containerRef.current
        if (!fitViewport) {
            if (el) el.style.maxHeight = ""
            return
        }
        const recompute = () => {
            if (!el) return
            // Measure the table unconstrained, then reserve whatever sits
            // below it (pagination, footnote, page padding, footer)
            el.style.maxHeight = ""
            const rect = el.getBoundingClientRect()
            const below =
                document.documentElement.scrollHeight -
                (rect.bottom + window.scrollY)
            const available = Math.max(
                250,
                Math.floor(
                    window.innerHeight - (rect.top + window.scrollY) - below - 4
                )
            )
            el.style.maxHeight = `${available}px`
        }
        recompute()
        window.addEventListener("resize", recompute)
        return () => window.removeEventListener("resize", recompute)
    }, [fitViewport, isMobile, listings])

    const renderHeader = (column: Column) => {
        const isSorted = column.sort === sort
        const ariaSort = isSorted
            ? dir === "asc"
                ? "ascending"
                : "descending"
            : undefined
        return (
            <th
                key={column.label}
                className={column.className}
                aria-sort={ariaSort}
                title={column.title}
            >
                {column.sort ? (
                    <button
                        type="button"
                        className="sx-sort-button"
                        onClick={() => onSort(column.sort as ShardExchangeSort)}
                    >
                        {column.label.replace(/ /g, " ")}
                        {isSorted && (dir === "asc" ? <UpSVG /> : <DownSVG />)}
                    </button>
                ) : (
                    column.label
                )}
            </th>
        )
    }

    const renderName = (listing: ShardExchangeListing) => {
        const name = listing.name ?? "Unknown item"
        if (!linkItems || !listing.slug) return name
        return (
            <Link
                to={shardExchangePath(server, listing.slug)}
                state={{ backSearch: location.search }}
            >
                {name}
            </Link>
        )
    }

    // "3 bids · last 2 hours ago", opening to the bids newest first
    const renderBids = (listing: ShardExchangeListing) => {
        const bids = listing.bids ?? []
        if (bids.length === 0) return null
        const last = bids[bids.length - 1]
        return (
            <details className="sx-bids">
                <summary
                    className="sx-subtext"
                    title={`Last bid first seen ${formatDateTime(last.at)}.`}
                >
                    {bids.length} bid{bids.length === 1 ? "" : "s"} · last{" "}
                    {formatAge(last.at, now)}
                </summary>
                <ul className="sx-bid-list">
                    {[...bids].reverse().map((bid) => (
                        <li key={`${bid.at}-${bid.amount}`}>
                            <span>{formatShards(bid.amount)}</span>{" "}
                            <span
                                className="sx-subtext"
                                title={`First seen ${formatDateTime(bid.at)}`}
                            >
                                {formatAge(bid.at, now)}
                            </span>
                        </li>
                    ))}
                </ul>
            </details>
        )
    }

    const renderMyBid = (listing: ShardExchangeListing) => {
        const mine = myBids?.get(listing.ref)
        if (!mine || mine.status === "ended") return null
        const name = characterName
            ? characterName(mine.my_bid.character_id)
            : ""
        const leading = mine.status === "leading"
        const label = leading ? "Your bid" : "Outbid"
        return (
            <span
                className={`sx-tag sx-my-bid ${leading ? "leading" : "outbid"}`}
                title={`${name ? `${name} bid` : "You bid"} ${formatShards(mine.my_bid.amount)}${leading ? " and is the top bidder" : ", and someone has bid higher"}`}
            >
                {name ? `${label} · ${name}` : label}
            </span>
        )
    }

    const renderRow = (listing: ShardExchangeListing) => {
        const each = unitPrice(listing.buyout, listing.quantity)
        return (
            <tr key={listing.ref}>
                <td>
                    <div className="sx-item-cell">
                        <span className="sx-item-name">
                            {renderName(listing)}
                        </span>
                        {listing.quantity != null && listing.quantity > 1 && (
                            <span
                                className="sx-tag"
                                title={`A stack of ${listing.quantity}`}
                            >
                                ×{listing.quantity.toLocaleString()}
                            </span>
                        )}
                        {listing.bound && (
                            <span className="sx-tag" title="This item is bound">
                                Bound
                            </span>
                        )}
                        {renderMyBid(listing)}
                    </div>
                </td>
                <td className="sx-col-number">{listing.min_level ?? "—"}</td>
                <td className="sx-nowrap">
                    {formatTimeLeft(listing.expires_at, now)}
                </td>
                <td className="sx-col-number">
                    {formatShards(listing.current_price)}
                    {listing.bid == null ? (
                        <div className="sx-subtext">no bids</div>
                    ) : (
                        renderBids(listing)
                    )}
                </td>
                <td className="sx-col-number">
                    {listing.buyout == null ? (
                        <span className="sx-subtext">none</span>
                    ) : (
                        formatShards(listing.buyout)
                    )}
                </td>
                <td className="sx-col-number">
                    {each == null ? "" : formatShards(each)}
                </td>
            </tr>
        )
    }

    return (
        <div className="table-container" ref={containerRef}>
            <table
                className={`sx-listings-table${isLoading ? " loading" : ""}`}
                aria-busy={isLoading}
            >
                <thead>
                    <tr>{COLUMNS.map(renderHeader)}</tr>
                </thead>
                <tbody>
                    {listings.length === 0 ? (
                        <tr>
                            <td
                                className="no-data-row"
                                colSpan={COLUMNS.length}
                            >
                                {isLoading ? "Loading…" : emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        listings.map(renderRow)
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default ListingsTable
