import { useCallback, useEffect, useMemo, useState } from "react"
import PageMessage from "../global/PageMessage.tsx"
import Link from "../global/Link.tsx"
import { LoadingState } from "../../models/Api.ts"
import { ShardExchangeMyBid } from "../../models/ShardExchange.ts"
import { MyShardExchangeBids } from "../../hooks/useMyShardExchangeBids.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import {
    formatShards,
    formatTimeLeft,
    outbidEventKey,
    pruneDismissed,
    shardExchangePath,
    undismissedOutbids,
} from "../../utils/shardExchangeUtils.ts"
import {
    getDismissedOutbids,
    setDismissedOutbids,
} from "./shardExchangeStorage.ts"

const MAX_SHOWN = 5

export interface OutbidState {
    outbids: ShardExchangeMyBid[]
    dismiss: (keys: string[]) => void
}

export function useOutbids(myBids: MyShardExchangeBids): OutbidState {
    const { bids, state } = myBids
    const [dismissed, setDismissed] = useState<string[]>(getDismissedOutbids)

    useEffect(() => {
        if (state !== LoadingState.Loaded) return
        setDismissed((current) => {
            const pruned = pruneDismissed(current, bids)
            if (pruned.length === current.length) return current
            setDismissedOutbids(pruned)
            return pruned
        })
    }, [bids, state])

    const outbids = useMemo(
        () => undismissedOutbids(bids, dismissed),
        [bids, dismissed]
    )

    const dismiss = useCallback((keys: string[]) => {
        setDismissed((current) => {
            const next = Array.from(new Set([...current, ...keys]))
            setDismissedOutbids(next)
            return next
        })
    }, [])

    return { outbids, dismiss }
}

interface Props {
    outbids: ShardExchangeMyBid[]
    dismiss: (keys: string[]) => void
    characterName: (id: number) => string
    now: number
}

const OutbidNotice = ({ outbids, dismiss, characterName, now }: Props) => {
    if (outbids.length === 0) return null

    const shown = outbids.slice(0, MAX_SHOWN)
    const count = outbids.length

    return (
        <PageMessage
            type="warning"
            title={`You've been outbid on ${count} listing${count === 1 ? "" : "s"}`}
            onDismiss={() => dismiss(outbids.map(outbidEventKey))}
            message={
                <div>
                    <ul className="sx-outbid-list">
                        {shown.map((bid) => {
                            const name = bid.name ?? "Unknown item"
                            return (
                                <li key={bid.ref}>
                                    {bid.slug ? (
                                        <Link
                                            to={shardExchangePath(
                                                bid.server,
                                                bid.slug
                                            )}
                                        >
                                            {name}
                                        </Link>
                                    ) : (
                                        <span>{name}</span>
                                    )}
                                    <span className="sx-subtext">
                                        {toSentenceCase(bid.server)} ·{" "}
                                        {characterName(bid.my_bid.character_id)}{" "}
                                        · now {formatShards(bid.current_price)}{" "}
                                        · {formatTimeLeft(bid.expires_at, now)}{" "}
                                        left
                                    </span>
                                    <button
                                        type="button"
                                        className="sx-dismiss-button"
                                        aria-label={`Dismiss ${name}`}
                                        title="Dismiss"
                                        onClick={() =>
                                            dismiss([outbidEventKey(bid)])
                                        }
                                    >
                                        ×
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                    <div className="sx-outbid-actions">
                        {count > MAX_SHOWN && (
                            <span className="sx-subtext">
                                and {count - MAX_SHOWN} more
                            </span>
                        )}
                        <Link to="/shard-exchange/my-bids">View my bids</Link>
                        <button
                            type="button"
                            className="sx-dismiss-button"
                            onClick={() => dismiss(outbids.map(outbidEventKey))}
                        >
                            Dismiss all
                        </button>
                    </div>
                </div>
            }
        />
    )
}

export default OutbidNotice
