import { useMemo } from "react"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Link from "../global/Link.tsx"
import Button from "../global/Button.tsx"
import ValidationMessage from "../global/ValidationMessage.tsx"
import {
    ErrorGettingRegisteredCharacters,
    NoRegisteredAndVerifiedCharacters,
    NoVerifiedCharacters,
} from "../global/CommonMessages.tsx"
import useNow from "../../hooks/useNow.ts"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import useMyShardExchangeBids from "../../hooks/useMyShardExchangeBids.ts"
import { LoadingState } from "../../models/Api.ts"
import { groupMyBids } from "../../utils/shardExchangeUtils.ts"
import MyBidsTable from "./MyBidsTable.tsx"
import DataFreshness from "./DataFreshness.tsx"
import "./ShardExchange.css"

const ShardExchangeMyBids = () => {
    const now = useNow(30 * 1000)
    const { registeredCharacters, isLoaded, isError } =
        useGetRegisteredCharacters()
    const myBids = useMyShardExchangeBids()
    const groups = useMemo(() => groupMyBids(myBids.bids), [myBids.bids])
    const isLoading =
        myBids.state === LoadingState.Loading ||
        (myBids.hasVerified && myBids.state === LoadingState.Initial)

    const renderSetupMessage = () => {
        if (isError) return <ErrorGettingRegisteredCharacters />
        if (!isLoaded) return <p>Loading…</p>
        if (registeredCharacters.length === 0)
            return <NoRegisteredAndVerifiedCharacters />
        return <NoVerifiedCharacters />
    }

    return (
        <Page
            title="DDO Audit | My Shard Exchange Bids"
            description="See the Shard Exchange listings your verified characters have bid on."
        >
            <ContentClusterGroup>
                <ContentCluster
                    title="My Bids"
                    subtitle="Shard Exchange listings your verified characters have bid on."
                >
                    <p className="sx-server-switch">
                        <Link to="/shard-exchange">← Shard Exchange</Link>
                    </p>
                    {!myBids.hasVerified ? (
                        renderSetupMessage()
                    ) : (
                        <div className="sx-mine-toolbar">
                            <DataFreshness
                                updatedAt={myBids.updatedAt}
                                now={now}
                                isLoaded={myBids.state === LoadingState.Loaded}
                            />
                            <Button
                                type="secondary"
                                small
                                disabled={isLoading}
                                onClick={myBids.reload}
                            >
                                Reload
                            </Button>
                            {myBids.state === LoadingState.Error && (
                                <ValidationMessage
                                    type="error"
                                    message="Couldn't load your bids."
                                    visible
                                />
                            )}
                        </div>
                    )}
                </ContentCluster>
                {myBids.hasVerified && (
                    <>
                        <ContentCluster
                            title={`Leading (${groups.leading.length})`}
                            subtitle="You're the top bidder."
                        >
                            <MyBidsTable
                                bids={groups.leading}
                                now={now}
                                characterName={myBids.characterName}
                                isLoading={isLoading}
                                emptyMessage="You aren't the top bidder on anything right now."
                            />
                        </ContentCluster>
                        <ContentCluster
                            title={`Outbid (${groups.outbid.length})`}
                            subtitle="Still open, but someone else has the top bid."
                        >
                            <MyBidsTable
                                bids={groups.outbid}
                                now={now}
                                characterName={myBids.characterName}
                                isLoading={isLoading}
                                emptyMessage="You haven't been outbid on anything that's still open."
                            />
                        </ContentCluster>
                        <ContentCluster
                            title={`Ended (${groups.ended.length})`}
                            subtitle="Listings you bid on that are no longer open."
                        >
                            <MyBidsTable
                                bids={groups.ended}
                                now={now}
                                characterName={myBids.characterName}
                                isLoading={isLoading}
                                ended
                                emptyMessage="No ended listings."
                            />
                            <p className="sx-subtext sx-note">
                                Bids can take a while to show up here.
                            </p>
                        </ContentCluster>
                    </>
                )}
            </ContentClusterGroup>
        </Page>
    )
}

export default ShardExchangeMyBids
