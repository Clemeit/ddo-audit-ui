import { useCallback, useEffect, useMemo } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Link from "../global/Link.tsx"
import Button from "../global/Button.tsx"
import PaginationSelector from "../global/PaginationSelector.tsx"
import ValidationMessage from "../global/ValidationMessage.tsx"
import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import useAbortableRequest from "../../hooks/useAbortableRequest.ts"
import useNow from "../../hooks/useNow.ts"
import useMyShardExchangeBids from "../../hooks/useMyShardExchangeBids.ts"
import { LoadingState } from "../../models/Api.ts"
import {
    ShardExchangeListingQuery,
    ShardExchangeSort,
} from "../../models/ShardExchange.ts"
import {
    SHARD_EXCHANGE_PAGE_SIZE,
    getCategories,
    getListings,
    listingQueryToApiParams,
} from "../../services/shardExchangeService.ts"
import {
    DEFAULT_LISTING_QUERY,
    categoryLabel,
    filterAndSortListings,
    listingQueryToSearchParams,
    nextSort,
    parseListingQuery,
} from "../../utils/shardExchangeUtils.ts"
import CategoryTree from "./CategoryTree.tsx"
import ListingFilters from "./ListingFilters.tsx"
import ListingsTable from "./ListingsTable.tsx"
import DataFreshness from "./DataFreshness.tsx"
import OutbidNotice, { useOutbids } from "./OutbidNotice.tsx"
import { rememberShardExchangeServer } from "./shardExchangeStorage.ts"
import "./ShardExchange.css"

const ShardExchangeServer = () => {
    const { server: serverParam = "" } = useParams()
    const server = serverParam.toLowerCase()
    const isValidServer = SERVER_NAMES_LOWER.includes(server)
    const serverName = toSentenceCase(server)
    const now = useNow(30 * 1000)

    const [searchParams, setSearchParams] = useSearchParams()
    const query = useMemo(() => parseListingQuery(searchParams), [searchParams])

    useEffect(() => {
        if (isValidServer) rememberShardExchangeServer(server)
    }, [isValidServer, server])

    // Reads the latest URL state, so debounced callers never apply a stale query
    const updateQuery = useCallback(
        (patch: Partial<ShardExchangeListingQuery>, replace = false) => {
            setSearchParams(
                (prev) =>
                    listingQueryToSearchParams({
                        ...parseListingQuery(prev),
                        ...patch,
                    }),
                { replace }
            )
        },
        [setSearchParams]
    )

    const myBids = useMyShardExchangeBids()
    const { outbids, dismiss } = useOutbids(myBids)
    const showMine = query.mine && myBids.hasVerified
    const mineRows = useMemo(
        () =>
            showMine
                ? filterAndSortListings(
                      myBids.bids.filter(
                          (b) => b.server === server && b.status !== "ended"
                      ),
                      query
                  )
                : [],
        [showMine, myBids.bids, server, query]
    )

    const listingsKey =
        isValidServer && !showMine
            ? JSON.stringify(listingQueryToApiParams(server, query))
            : null
    const listings = useAbortableRequest(listingsKey, (signal) =>
        getListings(server, query, { signal })
    )
    const categories = useAbortableRequest(
        isValidServer ? `categories:${server}` : null,
        (signal) => getCategories(server, signal)
    )

    // A page past the end (the listings changed since the link was made): go to the last page
    const pages = listings.data?.pages ?? 1
    useEffect(() => {
        if (
            !showMine &&
            listings.state === LoadingState.Loaded &&
            listings.data &&
            query.page > listings.data.pages
        ) {
            updateQuery({ page: listings.data.pages }, true)
        }
    }, [showMine, listings.state, listings.data, query.page, updateQuery])

    const categoryTree = categories.data?.data ?? []
    const selectedCategoryName = categoryLabel(categoryTree, query.category)
    const categoriesUnavailable =
        categories.data?.total != null &&
        categories.data.total > 0 &&
        categories.data.uncategorized === categories.data.total

    if (!isValidServer) {
        return (
            <Page
                title="DDO Audit | Shard Exchange"
                description="Browse the Shard Exchange on every DDO server."
            >
                <ContentClusterGroup>
                    <ContentCluster title="Shard Exchange">
                        <p>
                            There's no server named "{serverParam}".{" "}
                            <Link to="/shard-exchange">Choose a server</Link>.
                        </p>
                    </ContentCluster>
                </ContentClusterGroup>
            </Page>
        )
    }

    const total = listings.data?.total ?? 0
    const firstShown =
        total === 0 ? 0 : (query.page - 1) * SHARD_EXCHANGE_PAGE_SIZE + 1
    const lastShown = Math.min(query.page * SHARD_EXCHANGE_PAGE_SIZE, total)
    const isLoading = showMine
        ? myBids.state === LoadingState.Loading && myBids.bids.length === 0
        : listings.state === LoadingState.Loading
    const outbidNotice =
        outbids.length > 0 ? (
            <OutbidNotice
                outbids={outbids}
                dismiss={dismiss}
                characterName={myBids.characterName}
                now={now}
            />
        ) : null

    return (
        <Page
            title={`DDO Audit | ${serverName} Shard Exchange`}
            description={`Search everything for sale on ${serverName}'s Shard Exchange: prices, buyouts, time left, and price history.`}
            pageMessages={outbidNotice}
        >
            <ContentClusterGroup>
                <ContentCluster
                    title={`${serverName} Shard Exchange`}
                    subtitle="Everything listed on the Shard Exchange as of the last update."
                >
                    <p className="sx-server-switch">
                        <Link to="/shard-exchange">Change server</Link>
                        {myBids.hasVerified && (
                            <>
                                {" · "}
                                <Link to="/shard-exchange/my-bids">
                                    My bids
                                </Link>
                            </>
                        )}
                    </p>
                    <div className="sx-layout">
                        <aside className="sx-sidebar">
                            <details className="sx-sidebar-details" open>
                                <summary>
                                    Categories
                                    {selectedCategoryName && (
                                        <span className="sx-subtext">
                                            {" "}
                                            ({selectedCategoryName})
                                        </span>
                                    )}
                                </summary>
                                <CategoryTree
                                    categories={categoryTree}
                                    total={categories.data?.total}
                                    selected={query.category}
                                    isLoading={
                                        categories.state ===
                                        LoadingState.Loading
                                    }
                                    onSelect={(category) =>
                                        updateQuery({ category, page: 1 })
                                    }
                                />
                                {categoriesUnavailable && (
                                    <p className="sx-subtext sx-note">
                                        Item categories aren't available for
                                        this server yet, so category filters
                                        will find nothing. Use the search box
                                        instead.
                                    </p>
                                )}
                            </details>
                        </aside>
                        <section className="sx-main" aria-label="Listings">
                            <ListingFilters
                                query={query}
                                showMineToggle={myBids.hasVerified}
                                onChange={updateQuery}
                                onReset={() =>
                                    setSearchParams(
                                        listingQueryToSearchParams({
                                            ...DEFAULT_LISTING_QUERY,
                                            sort: query.sort,
                                            dir: query.dir,
                                        })
                                    )
                                }
                            />
                            <div className="sx-results-bar">
                                <span aria-live="polite">
                                    {showMine
                                        ? `${mineRows.length.toLocaleString()} listing${mineRows.length === 1 ? "" : "s"} you bid on`
                                        : listings.data
                                          ? total === 0
                                              ? "No listings"
                                              : `${firstShown.toLocaleString()}–${lastShown.toLocaleString()} of ${total.toLocaleString()} listings`
                                          : " "}
                                </span>
                                <DataFreshness
                                    updatedAt={
                                        showMine
                                            ? myBids.updatedAt
                                            : listings.data?.updated_at
                                    }
                                    now={now}
                                    isLoaded={
                                        showMine
                                            ? myBids.state ===
                                              LoadingState.Loaded
                                            : listings.data != null
                                    }
                                />
                            </div>
                            {(showMine
                                ? myBids.state === LoadingState.Error
                                : listings.state === LoadingState.Error) && (
                                <div className="sx-error">
                                    <ValidationMessage
                                        type="error"
                                        message="Couldn't load the listings."
                                        visible
                                    />
                                    <Button
                                        type="secondary"
                                        onClick={
                                            showMine
                                                ? myBids.reload
                                                : listings.reload
                                        }
                                    >
                                        Try again
                                    </Button>
                                </div>
                            )}
                            <ListingsTable
                                server={server}
                                listings={
                                    showMine
                                        ? mineRows
                                        : (listings.data?.data ?? [])
                                }
                                myBids={myBids.byRef}
                                characterName={myBids.characterName}
                                emptyMessage={
                                    showMine
                                        ? "None of your characters have an active bid here that matches your search."
                                        : undefined
                                }
                                now={now}
                                sort={query.sort}
                                dir={query.dir}
                                fitViewport
                                isLoading={
                                    isLoading ||
                                    (!showMine &&
                                        listings.state === LoadingState.Initial)
                                }
                                onSort={(sort: ShardExchangeSort) =>
                                    updateQuery(nextSort(query, sort))
                                }
                            />
                            {!showMine && pages > 1 && (
                                <PaginationSelector
                                    className="sx-pagination"
                                    totalPages={pages}
                                    currentPage={Math.min(query.page, pages)}
                                    disabled={isLoading}
                                    onChange={(page) => {
                                        updateQuery({ page })
                                        window.scrollTo({ top: 0 })
                                    }}
                                />
                            )}
                            <p className="sx-subtext sx-note">
                                Prices are in Astral Shards and are what sellers
                                are asking, not what items sold for. Listings
                                refresh about once an hour, so something shown
                                here may already be gone.
                            </p>
                        </section>
                    </div>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default ShardExchangeServer
