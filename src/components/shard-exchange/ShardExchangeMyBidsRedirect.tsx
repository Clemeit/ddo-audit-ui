import { Navigate } from "react-router-dom"
import {
    shardExchangePath,
    SHARD_EXCHANGE_SERVERS,
} from "../../utils/shardExchangeUtils.ts"
import { getRememberedShardExchangeServer } from "./shardExchangeStorage.ts"

// The old "My bids" page: the Bids tab of the window now shows bids on every server
const ShardExchangeMyBidsRedirect = () => {
    const server =
        getRememberedShardExchangeServer() ?? SHARD_EXCHANGE_SERVERS[0]
    return <Navigate to={`${shardExchangePath(server)}?tab=bids`} replace />
}

export default ShardExchangeMyBidsRedirect
