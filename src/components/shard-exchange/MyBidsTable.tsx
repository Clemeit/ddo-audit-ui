import { ShardExchangeMyBid } from "../../models/ShardExchange.ts"
import {
    formatAge,
    formatDateTime,
    formatShards,
    formatTimeLeft,
    shardExchangePath,
} from "../../utils/shardExchangeUtils.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import Link from "../global/Link.tsx"

interface Props {
    bids: ShardExchangeMyBid[]
    now: number
    characterName: (id: number) => string
    ended?: boolean
    isLoading?: boolean
    emptyMessage: string
}

const MyBidsTable = ({
    bids,
    now,
    characterName,
    ended = false,
    isLoading = false,
    emptyMessage,
}: Props) => {
    const columns = [
        { label: "Item" },
        { label: "Server" },
        { label: "Character" },
        { label: "My bid", className: "sx-col-number" },
        {
            label: ended ? "Final price" : "Current price",
            className: "sx-col-number",
        },
        { label: "Buyout", className: "sx-col-number" },
        { label: ended ? "Ended" : "Time left" },
    ]

    const renderRow = (bid: ShardExchangeMyBid) => {
        const name = bid.name ?? "Unknown item"
        const endedAt = bid.ended_at ?? bid.expires_at
        return (
            <tr key={bid.ref}>
                <td>
                    <div className="sx-item-cell">
                        <span className="sx-item-name">
                            {bid.slug ? (
                                <Link
                                    to={shardExchangePath(bid.server, bid.slug)}
                                >
                                    {name}
                                </Link>
                            ) : (
                                name
                            )}
                        </span>
                        {bid.quantity != null && bid.quantity > 1 && (
                            <span className="sx-tag">
                                ×{bid.quantity.toLocaleString()}
                            </span>
                        )}
                    </div>
                </td>
                <td className="sx-nowrap">{toSentenceCase(bid.server)}</td>
                <td className="sx-nowrap">
                    {characterName(bid.my_bid.character_id)}
                </td>
                <td className="sx-col-number">
                    {formatShards(bid.my_bid.amount)}
                    {bid.my_bid.at && (
                        <div
                            className="sx-subtext"
                            title={formatDateTime(bid.my_bid.at)}
                        >
                            {formatAge(bid.my_bid.at, now)}
                        </div>
                    )}
                </td>
                <td className="sx-col-number">
                    {formatShards(bid.current_price)}
                </td>
                <td className="sx-col-number">
                    {bid.buyout == null ? (
                        <span className="sx-subtext">none</span>
                    ) : (
                        formatShards(bid.buyout)
                    )}
                </td>
                <td className="sx-nowrap">
                    {ended ? (
                        <span title={formatDateTime(endedAt)}>
                            {endedAt ? formatAge(endedAt, now) : "—"}
                        </span>
                    ) : (
                        formatTimeLeft(bid.expires_at, now)
                    )}
                </td>
            </tr>
        )
    }

    return (
        <div className="table-container">
            <table
                className={`sx-listings-table${isLoading ? " loading" : ""}`}
                aria-busy={isLoading}
            >
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.label} className={column.className}>
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {bids.length === 0 ? (
                        <tr>
                            <td
                                className="no-data-row"
                                colSpan={columns.length}
                            >
                                {isLoading ? "Loading…" : emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        bids.map(renderRow)
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default MyBidsTable
