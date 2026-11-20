import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Link from "../global/Link.tsx"
import {
    ErrorGettingRegisteredCharacters,
    NoRegisteredAndVerifiedCharacters,
    NoVerifiedCharacters,
} from "../global/CommonMessages.tsx"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import useAbortableRequest from "../../hooks/useAbortableRequest.ts"
import useNow from "../../hooks/useNow.ts"
import useMyShardExchangeBids from "../../hooks/useMyShardExchangeBids.ts"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import { LoadingState } from "../../models/Api.ts"
import { useAppContext } from "../../contexts/AppContext.tsx"
import {
    ShardExchangeListing,
    ShardExchangeListingQuery,
    ShardExchangeSort,
    ShardExchangeTab,
} from "../../models/ShardExchange.ts"
import {
    SHARD_EXCHANGE_PAGE_SIZE,
    getCategories,
    getItem,
    getListings,
    listingQueryToApiParams,
} from "../../services/shardExchangeService.ts"
import {
    DEFAULT_LISTING_QUERY,
    filterAndSortListings,
    formatAge,
    formatDateTime,
    historyBucket,
    isStale,
    listingQueryToSearchParams,
    nextSort,
    parseListingQuery,
    shardExchangePath,
    isShardExchangeServer,
} from "../../utils/shardExchangeUtils.ts"
import CategoryTree from "./CategoryTree.tsx"
import {
    getShardExchangePerUnit,
    rememberShardExchangeServer,
    setShardExchangePerUnit,
} from "./shardExchangeStorage.ts"
import ShardExchangeWindow from "./window/ShardExchangeWindow.tsx"
import AuctionFilters from "./window/AuctionFilters.tsx"
import AuctionList, { AuctionListItem } from "./window/AuctionList.tsx"
import PriceHistoryDialog from "./window/PriceHistoryDialog.tsx"
import { GameButton } from "../game-ui/GameControls.tsx"
import { TagIcon } from "../game-ui/GameIcons.tsx"
import "./ShardExchange.css"

// Price sorts and their per-unit twins, swapped when "Price Each" is turned on or off
const UNIT_SORT: Partial<Record<ShardExchangeSort, ShardExchangeSort>> = {
    price: "unit_price",
    buyout: "unit_buyout",
}
const TOTAL_SORT: Partial<Record<ShardExchangeSort, ShardExchangeSort>> = {
    unit_price: "price",
    unit_buyout: "buyout",
}

const ShardExchangeServer = () => {
    const { server: serverParam = "" } = useParams()
    const server = serverParam.toLowerCase()
    const isValidServer = isShardExchangeServer(server)
    const serverName = toSentenceCase(server)
    const now = useNow(30 * 1000)
    const navigate = useNavigate()
    // The same full screen as the LFM panel: the site header hides (App turns it off on
    // navigation), and this page drops its heading and note
    const { isFullScreen, setIsFullScreen } = useAppContext()

    useEffect(() => {
        if (!isFullScreen) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !e.defaultPrevented)
                setIsFullScreen(false)
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [isFullScreen, setIsFullScreen])

    const [searchParams, setSearchParams] = useSearchParams()
    const query = useMemo(() => parseListingQuery(searchParams), [searchParams])
    const tab = query.tab
    const [perUnit, setPerUnit] = useState(getShardExchangePerUnit)
    // The name of the item whose history was just opened, shown until the history loads
    const [historyName, setHistoryName] = useState<string | null>(null)

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

    const { registeredCharacters, isLoaded, isError } =
        useGetRegisteredCharacters()
    const myBids = useMyShardExchangeBids()

    const listingsKey =
        isValidServer && tab === "auctions"
            ? JSON.stringify(listingQueryToApiParams(server, query))
            : null
    const listings = useAbortableRequest(listingsKey, (signal) =>
        getListings(server, query, { signal })
    )
    // The open price history. Its server is the page's unless a bid elsewhere opened it.
    const historyServer = query.historyServer ?? server
    const historyKey =
        isValidServer && query.history
            ? `item:${historyServer}:${query.history}:${query.days}`
            : null
    const historyRequest = useAbortableRequest(historyKey, (signal) =>
        getItem(query.history ?? "", historyServer, {
            days: query.days,
            bucket: historyBucket(query.days),
            signal,
        })
    )
    // The last good data may be for another item; only use it for this one
    const historyItem =
        historyRequest.data &&
        historyRequest.data.slug === query.history &&
        historyRequest.data.server.toLowerCase() === historyServer
            ? historyRequest
            : { ...historyRequest, data: null }

    const categories = useAbortableRequest(
        isValidServer ? `categories:${server}` : null,
        (signal) => getCategories(server, signal)
    )

    // A page past the end (the listings changed since the link was made): go to the last page
    useEffect(() => {
        if (
            tab === "auctions" &&
            listings.state === LoadingState.Loaded &&
            listings.data &&
            query.page > listings.data.pages
        ) {
            updateQuery({ page: listings.data.pages }, true)
        }
    }, [tab, listings.state, listings.data, query.page, updateQuery])

    // Bids from every server, sorted by the column headers (no filters), then split by status
    const bidItems = useMemo((): AuctionListItem[] => {
        if (tab !== "bids") return []
        const sorted = filterAndSortListings(myBids.bids, {
            ...DEFAULT_LISTING_QUERY,
            sort: query.sort,
            dir: query.dir,
        })
        const sections: [string, string][] = [
            ["leading", "Top Bidder"],
            ["outbid", "Outbid"],
            ["ended", "Ended"],
        ]
        return sections.flatMap(([status, title]) => {
            const rows = sorted.filter((b) => b.status === status)
            if (rows.length === 0) return []
            return [
                {
                    kind: "section" as const,
                    key: `section-${status}`,
                    title: `${title} (${rows.length})`,
                },
                ...rows.map((bid) => ({
                    kind: "row" as const,
                    listing: bid,
                    myBid: bid,
                    note:
                        bid.server !== server
                            ? `on ${toSentenceCase(bid.server)}`
                            : undefined,
                })),
            ]
        })
    }, [tab, myBids.bids, query.sort, query.dir, server])

    if (!isValidServer) {
        return (
            <Page
                title="DDO Audit | Shard Exchange"
                description="Browse the Shard Exchange on DDO's servers."
            >
                <ContentClusterGroup>
                    <ContentCluster title="Shard Exchange">
                        <p>
                            {SERVER_NAMES_LOWER.includes(server)
                                ? `We don't have Shard Exchange data for ${serverName}.`
                                : `There's no server named "${serverParam}".`}{" "}
                            <Link to="/shard-exchange">Choose a server</Link>.
                        </p>
                    </ContentCluster>
                </ContentClusterGroup>
            </Page>
        )
    }

    const onPerUnitChange = (next: boolean) => {
        setPerUnit(next)
        setShardExchangePerUnit(next)
        const swapped = (next ? UNIT_SORT : TOTAL_SORT)[query.sort]
        if (swapped) updateQuery({ sort: swapped, page: 1 }, true)
    }

    const onToggleRow = (ref: string) =>
        updateQuery({ open: query.open === ref ? null : ref }, true)

    // Opening the history adds a history entry, so Back closes it
    const openHistory = (listing: ShardExchangeListing, onServer: string) => {
        if (!listing.slug) return
        setHistoryName(listing.name)
        const other = onServer.toLowerCase()
        updateQuery({
            history: listing.slug,
            historyServer: other !== server ? other : null,
            days: DEFAULT_LISTING_QUERY.days,
        })
    }
    const closeHistory = () =>
        updateQuery({
            history: null,
            historyServer: null,
            days: DEFAULT_LISTING_QUERY.days,
        })

    const isFiltered =
        query.q.trim() !== "" ||
        query.minLevel != null ||
        query.maxLevel != null ||
        query.buyoutOnly ||
        query.category != null

    const resetFilters = () =>
        setSearchParams(
            listingQueryToSearchParams({
                ...DEFAULT_LISTING_QUERY,
                sort: query.sort,
                dir: query.dir,
                tab: query.tab,
            })
        )

    const openBid =
        tab === "bids"
            ? myBids.bids.find((b) => b.ref === query.open)
            : undefined
    const openListing =
        tab === "auctions"
            ? listings.data?.data.find((l) => l.ref === query.open)
            : openBid
    const openServer = openBid?.server ?? server
    const historyButton = (
        <GameButton
            disabled={!openListing?.slug}
            title={
                openListing
                    ? "Price history for the selected item"
                    : "Select a listing to see its price history"
            }
            onClick={() => {
                if (openListing) openHistory(openListing, openServer)
            }}
        >
            History
        </GameButton>
    )

    const freshnessFrom = (
        updatedAt: string | null | undefined,
        loaded: boolean
    ) => ({
        text: !loaded ? "…" : updatedAt ? formatAge(updatedAt, now) : "never",
        stale: loaded && isStale(updatedAt, now),
        title: updatedAt
            ? `Listings were last read from the game ${formatDateTime(updatedAt)}. They refresh about once an hour.`
            : undefined,
    })

    const categoryTree = categories.data?.data ?? []
    const tree = (
        <CategoryTree
            categories={categoryTree}
            total={categories.data?.total}
            selected={query.category}
            isLoading={categories.state === LoadingState.Loading}
            onSelect={(category) =>
                updateQuery({ category, page: 1, open: null })
            }
        />
    )
    const filters = (
        <AuctionFilters
            query={query}
            onChange={updateQuery}
            perUnit={perUnit}
            onPerUnitChange={onPerUnitChange}
        />
    )
    const onSort = (sort: ShardExchangeSort) =>
        updateQuery({ ...nextSort(query, sort), open: null })

    let list: ReactNode
    let pager = null
    let status: { label: string; value: string; actions: ReactNode }
    let freshness
    let placeholder: ReactNode = undefined

    if (tab === "auctions") {
        const total = listings.data?.total ?? 0
        const pages = listings.data?.pages ?? 1
        const firstShown =
            total === 0 ? 0 : (query.page - 1) * SHARD_EXCHANGE_PAGE_SIZE + 1
        const lastShown = Math.min(query.page * SHARD_EXCHANGE_PAGE_SIZE, total)
        const isLoading =
            listings.state === LoadingState.Loading ||
            listings.state === LoadingState.Initial
        list = (
            <AuctionList
                server={server}
                mode="auctions"
                items={(listings.data?.data ?? []).map((listing) => ({
                    kind: "row",
                    listing,
                }))}
                sort={query.sort}
                dir={query.dir}
                onSort={onSort}
                perUnit={perUnit}
                openRef={query.open}
                onToggle={onToggleRow}
                now={now}
                myBids={myBids.byRef}
                characterName={myBids.characterName}
                isLoading={isLoading}
                onOpenHistory={openHistory}
                emptyMessage={
                    listings.state === LoadingState.Error ? (
                        <>
                            Couldn't load the listings.{" "}
                            <GameButton small grey onClick={listings.reload}>
                                Try Again
                            </GameButton>
                        </>
                    ) : isFiltered ? (
                        "No listings match your search."
                    ) : (
                        "Nothing is listed on this server right now."
                    )
                }
            />
        )
        pager = {
            page: Math.min(query.page, pages),
            pages,
            disabled: isLoading,
            onPage: (page: number) => updateQuery({ page, open: null }),
        }
        status = {
            label: "Listings",
            value: listings.data
                ? total === 0
                    ? "None"
                    : `${firstShown.toLocaleString()}–${lastShown.toLocaleString()} of ${total.toLocaleString()}`
                : "…",
            actions: (
                <>
                    {historyButton}
                    <GameButton
                        grey
                        disabled={!isFiltered}
                        onClick={resetFilters}
                        title="Clear the level range, search, category and Buyout Only"
                    >
                        Reset
                    </GameButton>
                </>
            ),
        }
        freshness = freshnessFrom(
            listings.data?.updated_at,
            listings.data != null
        )
    } else if (tab === "bids") {
        const isLoading =
            myBids.state === LoadingState.Loading ||
            (myBids.hasVerified && myBids.state === LoadingState.Initial)
        let emptyMessage: ReactNode
        if (!myBids.hasVerified) {
            emptyMessage = isError ? (
                <ErrorGettingRegisteredCharacters />
            ) : !isLoaded ? (
                "Loading…"
            ) : registeredCharacters.length === 0 ? (
                <NoRegisteredAndVerifiedCharacters />
            ) : (
                <NoVerifiedCharacters />
            )
        } else if (myBids.state === LoadingState.Error) {
            emptyMessage = (
                <>
                    Couldn't load your bids.{" "}
                    <GameButton small grey onClick={myBids.reload}>
                        Try Again
                    </GameButton>
                </>
            )
        } else {
            emptyMessage =
                myBids.bids.length === 0
                    ? "Your verified characters haven't bid on anything lately. Bids can take a while to show up here."
                    : "None of your bids match your search."
        }
        const shown = bidItems.filter((i) => i.kind === "row").length
        list = (
            <AuctionList
                server={server}
                mode="bids"
                items={bidItems}
                sort={query.sort}
                dir={query.dir}
                onSort={onSort}
                perUnit={perUnit}
                openRef={query.open}
                onToggle={onToggleRow}
                now={now}
                characterName={myBids.characterName}
                isLoading={isLoading && myBids.bids.length === 0}
                emptyMessage={emptyMessage}
                onOpenHistory={openHistory}
            />
        )
        pager = { page: 1, pages: 1, disabled: true, onPage: () => {} }
        status = {
            label: "Your Bids",
            value: myBids.hasVerified
                ? `${shown.toLocaleString()} of ${myBids.bids.length.toLocaleString()}`
                : "—",
            actions: (
                <>
                    {historyButton}
                    <GameButton
                        grey
                        disabled={!myBids.hasVerified || isLoading}
                        onClick={myBids.reload}
                    >
                        Reload
                    </GameButton>
                </>
            ),
        }
        freshness = myBids.hasVerified
            ? freshnessFrom(
                  myBids.updatedAt,
                  myBids.state === LoadingState.Loaded
              )
            : { text: "—", stale: false }
    } else {
        list = null
        status = { label: "", value: "", actions: null }
        freshness = freshnessFrom(
            categories.data?.updated_at,
            categories.data != null
        )
        placeholder = (
            <div className="gw-panel sxw-post">
                <TagIcon size={64} />
                <h3>Coming Soon</h3>
                <p>
                    This tab will list the auctions your registered characters
                    have posted, with their bids and time left.
                </p>
            </div>
        )
    }

    const exchangeWindow = (
        <ShardExchangeWindow
            isFullScreen={isFullScreen}
            onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
            server={server}
            tab={tab}
            onTab={(next: ShardExchangeTab) =>
                updateQuery({
                    tab: next,
                    open: null,
                    page: 1,
                    history: null,
                    historyServer: null,
                })
            }
            onServer={(next) =>
                navigate({
                    pathname: shardExchangePath(next),
                    search:
                        tab === DEFAULT_LISTING_QUERY.tab ? "" : `?tab=${tab}`,
                })
            }
            onClose={() => navigate("/shard-exchange")}
            filters={tab === "bids" ? null : filters}
            tree={tab === "bids" ? null : tree}
            list={list}
            pager={pager}
            status={status}
            freshness={freshness}
            placeholder={placeholder}
        />
    )

    const historyTitle = query.history
        ? (historyItem.data?.name ?? historyName)
        : null
    const pageTitle = historyTitle
        ? `DDO Audit | ${historyTitle} | ${serverName} Shard Exchange`
        : `DDO Audit | ${serverName} Shard Exchange`
    const historyDialog = query.history ? (
        <PriceHistoryDialog
            name={historyName}
            server={historyServer}
            pageServer={server}
            days={query.days}
            onDays={(days) => updateQuery({ days }, true)}
            onClose={closeHistory}
            item={historyItem}
        />
    ) : null
    const pageDescription = `Search everything for sale on ${serverName}'s Shard Exchange: prices, buyouts, time left, bid history and price history.`

    if (isFullScreen) {
        return (
            <Page
                title={pageTitle}
                description={pageDescription}
                noPadding
                contentMaxWidth
                noBottomMarginOnMobile
            >
                <div className="sx-fullscreen">{exchangeWindow}</div>
                {historyDialog}
            </Page>
        )
    }

    return (
        <Page
            title={pageTitle}
            description={pageDescription}
        >
            <ContentClusterGroup>
                <ContentCluster
                    title={`${serverName} Shard Exchange`}
                    subtitle="Everything listed on the Shard Exchange as of the last update. Select a listing to see its bids."
                >
                    {exchangeWindow}
                    {historyDialog}
                    <p className="sx-subtext sx-note">
                        Prices are in Astral Shards and are what sellers are
                        asking, not what items sold for. Listings refresh about
                        once an hour, so something shown here may already be
                        gone.
                    </p>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default ShardExchangeServer
