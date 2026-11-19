import { useMemo, useState } from "react"
import { useLocation, useParams, useSearchParams } from "react-router-dom"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Link from "../global/Link.tsx"
import Button from "../global/Button.tsx"
import Stack from "../global/Stack.tsx"
import Skeleton from "../global/Skeleton.tsx"
import PaginationSelector from "../global/PaginationSelector.tsx"
import ValidationMessage from "../global/ValidationMessage.tsx"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import useAbortableRequest from "../../hooks/useAbortableRequest.ts"
import useNow from "../../hooks/useNow.ts"
import { LoadingState } from "../../models/Api.ts"
import {
    ShardExchangeListingQuery,
    ShardExchangePriceBucket,
} from "../../models/ShardExchange.ts"
import {
    getCategories,
    getItem,
    getListings,
} from "../../services/shardExchangeService.ts"
import {
    DEFAULT_LISTING_QUERY,
    categoryLabel,
    formatShards,
    nextSort,
    shardExchangePath,
} from "../../utils/shardExchangeUtils.ts"
import ListingsTable from "./ListingsTable.tsx"
import PriceHistoryChart from "./PriceHistoryChart.tsx"
import DataFreshness from "./DataFreshness.tsx"
import OutbidNotice, { useOutbids } from "./OutbidNotice.tsx"
import useMyShardExchangeBids from "../../hooks/useMyShardExchangeBids.ts"
import "./ShardExchange.css"

const RANGES = [7, 30, 90, 180] as const
type Range = (typeof RANGES)[number]
const DEFAULT_RANGE: Range = 30

const ITEM_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

function parseRange(value: string | null): Range {
    const days = Number(value)
    return (RANGES as readonly number[]).includes(days)
        ? (days as Range)
        : DEFAULT_RANGE
}

// Hourly points for a week, daily ones beyond that
const bucketFor = (days: Range): ShardExchangePriceBucket =>
    days <= 7 ? "hour" : "day"

const ShardExchangeItem = () => {
    const { server: serverParam = "", item: itemParam = "" } = useParams()
    const server = serverParam.toLowerCase()
    const slug = itemParam.toLowerCase()
    const isValid = SERVER_NAMES_LOWER.includes(server) && ITEM_SLUG.test(slug)
    const serverName = toSentenceCase(server)
    const now = useNow(30 * 1000)
    const myBids = useMyShardExchangeBids()
    const { outbids, dismiss } = useOutbids(myBids)

    const location = useLocation()
    const backSearch: string =
        (location.state as { backSearch?: string } | null)?.backSearch ?? ""

    const [searchParams, setSearchParams] = useSearchParams()
    const days = parseRange(searchParams.get("days"))
    const bucket = bucketFor(days)

    const [listingQuery, setListingQuery] = useState<ShardExchangeListingQuery>(
        { ...DEFAULT_LISTING_QUERY, sort: "unit_buyout" }
    )

    const item = useAbortableRequest(
        isValid ? `item:${server}:${slug}:${days}` : null,
        (signal) => getItem(slug, server, { days, bucket, signal })
    )
    const listings = useAbortableRequest(
        isValid
            ? `listings:${server}:${slug}:${JSON.stringify(listingQuery)}`
            : null,
        (signal) => getListings(server, listingQuery, { item: slug, signal })
    )
    // The category names (the tree without counts is the same for every server)
    const categories = useAbortableRequest("categories", (signal) =>
        getCategories(undefined, signal)
    )

    const points = item.data?.data ?? []
    const latest = points.length ? points[points.length - 1] : null
    const medianOfRange = useMemo(() => {
        const values = points
            .map((p) => p.median_buyout_unit)
            .filter((v): v is number => v != null)
            .sort((a, b) => a - b)
        if (!values.length) return null
        const mid = Math.floor(values.length / 2)
        return values.length % 2
            ? values[mid]
            : (values[mid - 1] + values[mid]) / 2
    }, [points])

    const itemName = item.data?.name ?? listings.data?.data[0]?.name ?? null
    const category = categoryLabel(
        categories.data?.data ?? [],
        item.data?.category
    )
    const isNotFound =
        item.state === LoadingState.Error &&
        (item.error as { response?: { status?: number } } | null)?.response
            ?.status === 404

    if (!isValid || isNotFound) {
        return (
            <Page
                title="DDO Audit | Shard Exchange"
                description="Shard Exchange prices and listings."
            >
                <ContentClusterGroup>
                    <ContentCluster title="Item not found">
                        <p>
                            We haven't seen an item by that name on the Shard
                            Exchange.{" "}
                            <Link
                                to={
                                    SERVER_NAMES_LOWER.includes(server)
                                        ? shardExchangePath(server)
                                        : "/shard-exchange"
                                }
                            >
                                Back to the Shard Exchange
                            </Link>
                        </p>
                    </ContentCluster>
                </ContentClusterGroup>
            </Page>
        )
    }

    const pages = listings.data?.pages ?? 1
    const title = itemName ?? "Item"

    return (
        <Page
            title={`DDO Audit | ${title} | ${serverName} Shard Exchange`}
            description={`Price history and current listings for ${title} on ${serverName}'s Shard Exchange.`}
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
                <ContentCluster title={title}>
                    <p className="sx-server-switch">
                        <Link to={`${shardExchangePath(server)}${backSearch}`}>
                            ← {serverName} Shard Exchange
                        </Link>
                        {category && (
                            <span className="sx-subtext"> · {category}</span>
                        )}
                    </p>
                    <div className="sx-stats">
                        <Stat
                            label={
                                bucket === "day"
                                    ? "Lowest buyout each, latest day"
                                    : "Lowest buyout each, latest hour"
                            }
                            value={latest?.min_buyout_unit}
                            isLoading={
                                item.state === LoadingState.Loading &&
                                !item.data
                            }
                        />
                        <Stat
                            label={`Median buyout each, ${days} days`}
                            value={medianOfRange}
                            isLoading={
                                item.state === LoadingState.Loading &&
                                !item.data
                            }
                        />
                        <Stat
                            label="Listed now"
                            value={listings.data?.total}
                            isLoading={
                                listings.state === LoadingState.Loading &&
                                !listings.data
                            }
                            plain
                        />
                    </div>
                </ContentCluster>
                <ContentCluster
                    title="Price History"
                    subtitle="Asking prices per unit. Items that share a name (randomly generated loot, for example) are shown together, so their prices are mixed."
                >
                    <Stack direction="column" gap="10px">
                        <div
                            className="sx-range-buttons"
                            role="group"
                            aria-label="Time range"
                        >
                            {RANGES.map((range) => (
                                <Button
                                    key={range}
                                    type={
                                        range === days ? "primary" : "secondary"
                                    }
                                    onClick={() =>
                                        setSearchParams(
                                            range === DEFAULT_RANGE
                                                ? {}
                                                : { days: `${range}` },
                                            { replace: true }
                                        )
                                    }
                                >
                                    {range} days
                                </Button>
                            ))}
                        </div>
                        {item.state === LoadingState.Error ? (
                            <div className="sx-error">
                                <ValidationMessage
                                    type="error"
                                    message="Couldn't load the price history."
                                    visible
                                />
                                <Button type="secondary" onClick={item.reload}>
                                    Try again
                                </Button>
                            </div>
                        ) : (
                            <PriceHistoryChart
                                points={points}
                                bucket={bucket}
                                isLoading={item.state !== LoadingState.Loaded}
                            />
                        )}
                    </Stack>
                </ContentCluster>
                <ContentCluster title="Listed Now">
                    <div className="sx-results-bar">
                        <span>
                            {listings.data
                                ? `${listings.data.total.toLocaleString()} listing${listings.data.total === 1 ? "" : "s"}`
                                : " "}
                        </span>
                        <DataFreshness
                            updatedAt={listings.data?.updated_at}
                            now={now}
                            isLoaded={listings.data != null}
                        />
                    </div>
                    {listings.state === LoadingState.Error && (
                        <div className="sx-error">
                            <ValidationMessage
                                type="error"
                                message="Couldn't load the listings."
                                visible
                            />
                            <Button type="secondary" onClick={listings.reload}>
                                Try again
                            </Button>
                        </div>
                    )}
                    <ListingsTable
                        server={server}
                        listings={listings.data?.data ?? []}
                        now={now}
                        sort={listingQuery.sort}
                        dir={listingQuery.dir}
                        linkItems={false}
                        myBids={myBids.byRef}
                        characterName={myBids.characterName}
                        isLoading={
                            listings.state !== LoadingState.Loaded &&
                            listings.state !== LoadingState.Error
                        }
                        emptyMessage="Nothing by this name is listed right now."
                        onSort={(sort) =>
                            setListingQuery((q) => nextSort(q, sort))
                        }
                    />
                    {pages > 1 && (
                        <PaginationSelector
                            className="sx-pagination"
                            totalPages={pages}
                            currentPage={Math.min(listingQuery.page, pages)}
                            onChange={(page) =>
                                setListingQuery((q) => ({ ...q, page }))
                            }
                        />
                    )}
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

interface StatProps {
    label: string
    value: number | null | undefined
    isLoading?: boolean
    // A count, not a price
    plain?: boolean
}

const Stat = ({
    label,
    value,
    isLoading = false,
    plain = false,
}: StatProps) => (
    <div className="sx-stat">
        <span className="sx-stat-label">{label}</span>
        <span className="sx-stat-value">
            {isLoading ? (
                <Skeleton width="80px" height="28px" variant="text" />
            ) : value == null ? (
                "—"
            ) : plain ? (
                value.toLocaleString()
            ) : (
                `${formatShards(value)} shards`
            )}
        </span>
    </div>
)

export default ShardExchangeItem
