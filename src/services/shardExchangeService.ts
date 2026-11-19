import {
    ShardExchangeCategoriesResponse,
    ShardExchangeItemResponse,
    ShardExchangeListingQuery,
    ShardExchangeListingsResponse,
    ShardExchangeMyBidsResponse,
    ShardExchangePriceBucket,
} from "../models/ShardExchange.ts"
import { getRequest, postRequest } from "./apiHelper.ts"

const SHARD_EXCHANGE_ENDPOINT = "shard-exchange"

export const SHARD_EXCHANGE_PAGE_SIZE = 20

// The query as the API takes it: only the parameters that are set.
export function listingQueryToApiParams(
    server: string,
    query: ShardExchangeListingQuery,
    extra: { item?: string; limit?: number } = {}
): Record<string, string | number> {
    const params: Record<string, string | number> = {
        server: server.toLowerCase(),
        sort: query.sort,
        dir: query.dir,
        page: query.page,
        limit: extra.limit ?? SHARD_EXCHANGE_PAGE_SIZE,
    }
    const q = query.q.trim()
    if (q) params.q = q
    if (query.category) params.category = query.category
    if (query.minLevel != null) params.min_level = query.minLevel
    if (query.maxLevel != null) params.max_level = query.maxLevel
    if (query.buyoutOnly) params.buyout_only = "true"
    if (extra.item) params.item = extra.item
    return params
}

function getListings(
    server: string,
    query: ShardExchangeListingQuery,
    options: { item?: string; limit?: number; signal?: AbortSignal } = {}
) {
    const { signal, ...extra } = options
    return getRequest<ShardExchangeListingsResponse>(
        `${SHARD_EXCHANGE_ENDPOINT}/listings`,
        { params: listingQueryToApiParams(server, query, extra), signal }
    )
}

function getCategories(server?: string, signal?: AbortSignal) {
    return getRequest<ShardExchangeCategoriesResponse>(
        `${SHARD_EXCHANGE_ENDPOINT}/categories`,
        {
            params: server ? { server: server.toLowerCase() } : undefined,
            signal,
        }
    )
}

function getItem(
    slug: string,
    server: string,
    options: {
        days?: number
        bucket?: ShardExchangePriceBucket
        signal?: AbortSignal
    } = {}
) {
    const params: Record<string, string | number> = {
        server: server.toLowerCase(),
    }
    if (options.days != null) params.days = options.days
    if (options.bucket) params.bucket = options.bucket
    return getRequest<ShardExchangeItemResponse>(
        `${SHARD_EXCHANGE_ENDPOINT}/items/${encodeURIComponent(slug)}`,
        { params, signal: options.signal }
    )
}

function getMyBids(accessTokens: string[], signal?: AbortSignal) {
    return postRequest<ShardExchangeMyBidsResponse>(
        `${SHARD_EXCHANGE_ENDPOINT}/my-bids`,
        { data: { access_tokens: accessTokens }, signal }
    )
}

export { getListings, getCategories, getItem, getMyBids }
