import {
    SHARD_EXCHANGE_HISTORY_RANGES,
    ShardExchangeHistoryRange,
    ShardExchangeItemResponse,
} from "../../../models/ShardExchange.ts"
import { LoadingState } from "../../../models/Api.ts"
import { toSentenceCase } from "../../../utils/stringUtils.ts"
import {
    historyBucket,
    medianBuyout,
} from "../../../utils/shardExchangeUtils.ts"
import GameDialog from "../../game-ui/GameDialog.tsx"
import { GameButton, ShardAmount } from "../../game-ui/GameControls.tsx"
import PriceHistoryChart from "../PriceHistoryChart.tsx"

interface Props {
    // The name to show until the history has loaded (from the row it was opened from)
    name: string | null
    server: string
    // The server the page is on; the history's server is named when it is another one
    pageServer: string
    days: ShardExchangeHistoryRange
    onDays: (days: ShardExchangeHistoryRange) => void
    onClose: () => void
    // The request for this item, server and range
    item: {
        data: ShardExchangeItemResponse | null
        state: LoadingState
        error: Error | null
        reload: () => void
    }
}

/** An item's price history in a small window over the Shard Exchange. */
const PriceHistoryDialog = ({
    name,
    server,
    pageServer,
    days,
    onDays,
    onClose,
    item,
}: Props) => {
    const points = item.data?.data ?? []
    const latest = points.length ? points[points.length - 1] : null
    const bucket = item.data?.bucket ?? historyBucket(days)
    const isNotFound =
        item.state === LoadingState.Error &&
        (item.error as { response?: { status?: number } } | null)?.response
            ?.status === 404
    const isFirstLoad = item.data == null && item.state !== LoadingState.Error
    const title = item.data?.name ?? name ?? "Price History"
    const otherServer =
        server !== pageServer ? ` on ${toSentenceCase(server)}` : ""

    let body
    if (isNotFound) {
        body = (
            <p className="sxh-message">
                We haven't seen an item by that name on {toSentenceCase(server)}
                's Shard Exchange.
            </p>
        )
    } else if (item.state === LoadingState.Error && !item.data) {
        body = (
            <div className="sxh-message">
                <p>Couldn't load the price history.</p>
                <GameButton small grey onClick={item.reload}>
                    Try Again
                </GameButton>
            </div>
        )
    } else if (isFirstLoad) {
        body = <div className="sxh-loading" aria-label="Loading" />
    } else {
        body = <PriceHistoryChart points={points} bucket={bucket} />
    }

    return (
        <GameDialog
            title={`${title}${otherServer}`}
            onClose={onClose}
            className="sxh"
        >
            <div className="sxh-body">
                <div className="sxh-top">
                    <dl className="sxh-stats">
                        <div>
                            <dt>
                                Lowest buyout each,{" "}
                                {bucket === "day"
                                    ? "latest day"
                                    : "latest hour"}
                            </dt>
                            <dd className="gw-readout">
                                {isFirstLoad ? (
                                    "…"
                                ) : (
                                    <ShardAmount
                                        value={latest?.min_buyout_unit}
                                    />
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt>Median buyout each, {days} days</dt>
                            <dd className="gw-readout">
                                {isFirstLoad ? (
                                    "…"
                                ) : (
                                    <ShardAmount value={medianBuyout(points)} />
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt>Listings, latest</dt>
                            <dd className="gw-readout">
                                {isFirstLoad
                                    ? "…"
                                    : (
                                          latest?.listing_count ?? 0
                                      ).toLocaleString()}
                            </dd>
                        </div>
                    </dl>
                    <div
                        className="sxh-ranges"
                        role="group"
                        aria-label="Time range"
                    >
                        {SHARD_EXCHANGE_HISTORY_RANGES.map((range) => (
                            <GameButton
                                key={range}
                                small
                                className="gw-toggle"
                                aria-pressed={range === days}
                                onClick={() => {
                                    if (range !== days) onDays(range)
                                }}
                            >
                                {range} Days
                            </GameButton>
                        ))}
                    </div>
                </div>
                <div
                    className={`gw-panel sxh-panel${item.state === LoadingState.Loading && item.data ? " loading" : ""}`}
                    aria-busy={item.state === LoadingState.Loading}
                >
                    {body}
                </div>
                <p className="sxh-note">
                    Asking prices per unit. Items that share a name (randomly
                    generated loot, for example) are shown together, so their
                    prices are mixed.
                </p>
            </div>
        </GameDialog>
    )
}

export default PriceHistoryDialog
