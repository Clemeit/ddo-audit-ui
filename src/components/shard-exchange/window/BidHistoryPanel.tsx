import {
    ShardExchangeListing,
    ShardExchangeMyBid,
} from "../../../models/ShardExchange.ts"
import {
    formatAge,
    formatDateTime,
    formatShards,
    unitPrice,
} from "../../../utils/shardExchangeUtils.ts"
import { GameButton, ShardAmount } from "../../game-ui/GameControls.tsx"

interface Props {
    id: string
    server: string
    listing: ShardExchangeListing
    myBid?: ShardExchangeMyBid
    characterName?: (id: number) => string
    now: number
    // Opens the item's price history (on the server the listing is on)
    onOpenHistory?: (listing: ShardExchangeListing, server: string) => void
}

/** The details under an expanded row: every recorded bid, newest first, and the listing's facts. */
const BidHistoryPanel = ({
    id,
    server,
    listing,
    myBid,
    characterName,
    now,
    onOpenHistory,
}: Props) => {
    const bids = [...(listing.bids ?? [])].reverse()
    const each = unitPrice(listing.buyout, listing.quantity)
    const myName = myBid ? characterName?.(myBid.my_bid.character_id) : ""

    const fact = (label: string, value: React.ReactNode) => (
        <>
            <dt>{label}</dt>
            <dd>{value}</dd>
        </>
    )

    return (
        <div className="sxw-details" id={id}>
            <section className="sxw-details-bids" aria-label="Bid history">
                <h3 className="sxw-details-heading">Bid History</h3>
                {bids.length === 0 ? (
                    <p className="sxw-details-empty">
                        No bids yet. Opening bid{" "}
                        <ShardAmount value={listing.min_bid} />
                    </p>
                ) : (
                    <ol className="sxw-bid-timeline">
                        {bids.map((bid, i) => (
                            <li
                                key={`${bid.at}-${bid.amount}`}
                                className={i === 0 ? "latest" : undefined}
                            >
                                <ShardAmount value={bid.amount} />
                                <span
                                    className="sxw-bid-age"
                                    title={`First seen ${formatDateTime(bid.at)}`}
                                >
                                    {formatAge(bid.at, now)}
                                </span>
                                {i === 0 && (
                                    <span className="sxw-bid-tag">top bid</span>
                                )}
                            </li>
                        ))}
                    </ol>
                )}
            </section>
            <section className="sxw-details-facts" aria-label="Listing details">
                <dl>
                    {fact(
                        "Opening bid",
                        <ShardAmount value={listing.min_bid} />
                    )}
                    {fact(
                        "Buyout",
                        listing.buyout == null ? (
                            "None"
                        ) : (
                            <ShardAmount value={listing.buyout} />
                        )
                    )}
                    {each != null &&
                        fact(
                            "Buyout each",
                            <span>
                                {formatShards(each)} × {listing.quantity}
                            </span>
                        )}
                    {listing.min_level != null &&
                        fact("Minimum level", listing.min_level)}
                    {listing.bound && fact("Binding", "Bound")}
                    {fact(
                        "Posted",
                        listing.posted_at ? (
                            <span title={formatDateTime(listing.posted_at)}>
                                {formatAge(listing.posted_at, now)}
                            </span>
                        ) : (
                            "Unknown"
                        )
                    )}
                    {fact(
                        "Ends",
                        listing.expires_at
                            ? formatDateTime(listing.expires_at)
                            : "Unknown"
                    )}
                    {myBid &&
                        fact(
                            "Your bid",
                            <span
                                className={`sxw-mine ${myBid.status === "leading" ? "leading" : "outbid"}`}
                            >
                                <ShardAmount value={myBid.my_bid.amount} />
                                {myName ? ` · ${myName}` : ""}
                                {myBid.status === "leading"
                                    ? " (top bidder)"
                                    : myBid.status === "outbid"
                                      ? " (outbid)"
                                      : " (ended)"}
                            </span>
                        )}
                </dl>
                {listing.slug && onOpenHistory && (
                    <GameButton
                        small
                        className="sxw-history-link"
                        onClick={() => onOpenHistory(listing, server)}
                    >
                        Price History
                    </GameButton>
                )}
            </section>
        </div>
    )
}

export default BidHistoryPanel
