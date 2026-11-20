import { useMemo } from "react"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Skeleton from "../global/Skeleton.tsx"
import ServerNavigationCard from "../global/ServerNavigationCard.tsx"
import Badge from "../global/Badge.tsx"
import Link from "../global/Link.tsx"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import {
    shardExchangePath,
    SHARD_EXCHANGE_SERVERS,
} from "../../utils/shardExchangeUtils.ts"
import useNow from "../../hooks/useNow.ts"
import useAbortableRequest from "../../hooks/useAbortableRequest.ts"
import { getServerSummaries } from "../../services/shardExchangeService.ts"
import { LoadingState } from "../../models/Api.ts"
import useMyShardExchangeBids from "../../hooks/useMyShardExchangeBids.ts"
import { getRememberedShardExchangeServer } from "./shardExchangeStorage.ts"
import OutbidNotice, { useOutbids } from "./OutbidNotice.tsx"
import ServerSummary from "./ServerSummary.tsx"
import "./ShardExchange.css"

const ShardExchange = () => {
    const lastServer = useMemo(() => getRememberedShardExchangeServer(), [])
    const now = useNow(30 * 1000)
    const myBids = useMyShardExchangeBids()
    const { outbids, dismiss } = useOutbids(myBids)
    const summaries = useAbortableRequest("server-summaries", (signal) =>
        getServerSummaries(signal)
    )
    const summaryOf = (server: string) =>
        summaries.data?.data.find((summary) => summary.server === server)

    const cardSummary = (server: string) => {
        const summary = summaryOf(server)
        if (summary && summaries.data) {
            return (
                <ServerSummary
                    summary={summary}
                    activityHours={summaries.data.activity_hours}
                    endingSoonMinutes={summaries.data.ending_soon_minutes}
                    trendDays={summaries.data.trend_days}
                    now={now}
                />
            )
        }
        // Without a summary (it failed, or this server isn't in it) the card is just a link
        if (summaries.data || summaries.state === LoadingState.Error)
            return null
        return (
            <span className="sx-summary">
                <Skeleton width="80%" />
                <Skeleton width="60%" />
                <Skeleton height="28px" variant="rectangular" />
            </span>
        )
    }

    const cardContent = (server: string) => (
        <>
            {cardSummary(server)}
            <span className="sx-card-action" aria-hidden="true">
                Browse listings ›
            </span>
        </>
    )

    return (
        <Page
            title="DDO Audit | Shard Exchange"
            description="Search the Shard Exchange on DDO's 64-bit servers: what's for sale, current bids, buyout prices, time left, and price history."
            pageMessages={
                outbids.length > 0 ? (
                    <OutbidNotice
                        outbids={outbids}
                        dismiss={dismiss}
                        characterName={myBids.characterName}
                        now={now}
                    />
                ) : null
            }
        >
            <ContentClusterGroup>
                <ContentCluster
                    title="Shard Exchange"
                    subtitle="Browse what's for sale on each server's Shard Exchange, with buyout prices and price history. Listings refresh about once an hour."
                >
                    {myBids.hasVerified && (
                        <p className="sx-server-switch">
                            <Link to="/shard-exchange/my-bids">
                                View my bids
                            </Link>
                        </p>
                    )}
                    <div className="sx-server-cards">
                        {SHARD_EXCHANGE_SERVERS.map((server) => (
                            <ServerNavigationCard
                                key={server}
                                destination={shardExchangePath(server)}
                                title={toSentenceCase(server)}
                                badge={
                                    server === lastServer ? (
                                        <Badge
                                            text="Last viewed"
                                            size="small"
                                        />
                                    ) : undefined
                                }
                                content={cardContent(server)}
                                miniature
                            />
                        ))}
                    </div>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default ShardExchange
