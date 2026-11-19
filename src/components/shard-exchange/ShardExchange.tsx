import { useMemo } from "react"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import ServerNavigationCard from "../global/ServerNavigationCard.tsx"
import Badge from "../global/Badge.tsx"
import Link from "../global/Link.tsx"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import { shardExchangePath } from "../../utils/shardExchangeUtils.ts"
import useNow from "../../hooks/useNow.ts"
import useMyShardExchangeBids from "../../hooks/useMyShardExchangeBids.ts"
import { getRememberedShardExchangeServer } from "./shardExchangeStorage.ts"
import OutbidNotice, { useOutbids } from "./OutbidNotice.tsx"
import "./ShardExchange.css"

const ShardExchange = () => {
    const lastServer = useMemo(() => getRememberedShardExchangeServer(), [])
    const now = useNow(30 * 1000)
    const myBids = useMyShardExchangeBids()
    const { outbids, dismiss } = useOutbids(myBids)

    return (
        <Page
            title="DDO Audit | Shard Exchange"
            description="Search the Shard Exchange on every DDO server: what's for sale, current bids, buyout prices, time left, and price history."
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
                    <NavCardCluster>
                        {SERVER_NAMES_LOWER.map((server) => (
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
                                miniature
                            />
                        ))}
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default ShardExchange
