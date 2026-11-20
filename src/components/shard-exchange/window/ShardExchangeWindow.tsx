import { SHARD_EXCHANGE_SERVERS } from "../../../utils/shardExchangeUtils.ts"
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react"
import GameWindow from "../../game-ui/GameWindow.tsx"
import SideTabs, { SideTab } from "../../game-ui/SideTabs.tsx"
import { GameButton } from "../../game-ui/GameControls.tsx"
import {
    GavelIcon,
    PaddleIcon,
    ShardIcon,
    TagIcon,
} from "../../game-ui/GameIcons.tsx"
import { ShardExchangeTab } from "../../../models/ShardExchange.ts"
import { toSentenceCase } from "../../../utils/stringUtils.ts"
import {
    WINDOW_MAX_HEIGHT,
    WINDOW_MIN_HEIGHT,
    WINDOW_MIN_WIDTH,
    clampWindowHeight,
    fitWindowHeight,
    forgetStoredWindowHeight,
} from "../shardExchangeStorage.ts"
import "./ShardExchangeWindow.css"

const TABS: SideTab<ShardExchangeTab>[] = [
    { id: "auctions", label: "Auctions", icon: <GavelIcon size={64} /> },
    { id: "bids", label: "Bids", icon: <PaddleIcon size={64} /> },
    { id: "post", label: "Post", icon: <TagIcon size={64} /> },
]

// Below this container width the window switches to its narrow layout
const COMPACT_WIDTH = WINDOW_MIN_WIDTH
const PANEL_ID = "sxw-panel"

export interface PagerProps {
    page: number
    pages: number
    disabled?: boolean
    onPage: (page: number) => void
}

interface Props {
    server: string
    tab: ShardExchangeTab
    onTab: (tab: ShardExchangeTab) => void
    onServer: (server: string) => void
    onClose: () => void
    isFullScreen: boolean
    onToggleFullScreen: () => void
    // Left out (null) on tabs without filters: the list then takes their room
    filters: ReactNode | null
    tree: ReactNode | null
    list: ReactNode
    pager: PagerProps | null
    // The strip under the list: a label, a readout and up to two buttons
    status: { label: string; value: string; actions: ReactNode }
    // The footer readout: when the data was last updated
    freshness: { text: string; stale: boolean; title?: string }
    // Shown instead of filters, tree and list (the Post tab)
    placeholder?: ReactNode
}

const px = (value: string) => parseFloat(value) || 0

/**
 * How much of the page's height isn't the window: everything above it, plus everything that
 * follows it in each of its ancestors (later siblings, padding, gaps). The page here scrolls
 * a fixed-height body, so the body's or document's height can't be used for this.
 */
function measureRestOfPage(el: HTMLElement): number {
    const scrolled =
        (document.scrollingElement?.scrollTop ?? 0) + document.body.scrollTop
    const above = el.getBoundingClientRect().top + scrolled
    let below = 0
    for (
        let node: HTMLElement | null = el;
        node && node !== document.body;
        node = node.parentElement
    ) {
        let following = 0
        for (
            let sib = node.nextElementSibling as HTMLElement | null;
            sib;
            sib = sib.nextElementSibling as HTMLElement | null
        ) {
            const style = window.getComputedStyle(sib)
            if (
                style.display === "none" ||
                style.position === "absolute" ||
                style.position === "fixed"
            )
                continue
            below +=
                sib.offsetHeight + px(style.marginTop) + px(style.marginBottom)
            following++
        }
        const parent = node.parentElement
        if (parent && parent !== document.body) {
            const style = window.getComputedStyle(parent)
            below += px(style.paddingBottom) + px(style.borderBottomWidth)
            if (/flex|grid/.test(style.display))
                below += px(style.rowGap) * following
        }
        below += px(window.getComputedStyle(node).marginBottom)
    }
    return Math.ceil(above + below)
}

const Pager = ({ page, pages, disabled, onPage }: PagerProps) => (
    <nav className="sxw-pager" aria-label="Pages">
        <GameButton
            small
            disabled={disabled || page <= 1}
            onClick={() => onPage(page - 1)}
        >
            &lt; Previous Page
        </GameButton>
        <span className="sxw-page-number" aria-live="polite">
            {page} / {pages}
        </span>
        <GameButton
            small
            disabled={disabled || page >= pages}
            onClick={() => onPage(page + 1)}
        >
            Next Page &gt;
        </GameButton>
    </nav>
)

/**
 * The Shard Exchange window: tabs on the left, the filter bar on top, categories and the list
 * below it, and the strips at the bottom. It can be resized from the corner; the size is kept.
 */
const ShardExchangeWindow = ({
    server,
    tab,
    onTab,
    onServer,
    onClose,
    isFullScreen,
    onToggleFullScreen,
    filters,
    tree,
    list,
    pager,
    status,
    freshness,
    placeholder,
}: Props) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [containerWidth, setContainerWidth] = useState<number | null>(null)
    // A height the user dragged to, for this visit only; null: fit the browser window
    const [manualHeight, setManualHeight] = useState<number | null>(null)

    useEffect(() => forgetStoredWindowHeight(), [])
    // The browser window's height, and how much of the page isn't this window (header, title,
    // note, footer). Their difference is the tallest the window can be without a page scrollbar.
    const [viewportHeight, setViewportHeight] = useState(
        () => window.innerHeight
    )
    const [restOfPage, setRestOfPage] = useState<number | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    useLayoutEffect(() => {
        const el = containerRef.current
        if (!el) return
        const measure = () => {
            setViewportHeight(window.innerHeight)
            const rest = measureRestOfPage(el)
            setRestOfPage((prev) => (prev === rest ? prev : rest))
        }
        measure()
        // Whatever sits around the window can change size (a notice appears, the header
        // wraps). Watch every ancestor; the window's own height doesn't change the result,
        // so this settles after one pass.
        const observer = new ResizeObserver(measure)
        for (
            let node = el.parentElement;
            node && node !== document.body;
            node = node.parentElement
        ) {
            observer.observe(node)
        }
        window.addEventListener("resize", measure)
        return () => {
            observer.disconnect()
            window.removeEventListener("resize", measure)
        }
    }, [])

    useLayoutEffect(() => {
        const el = containerRef.current
        if (!el) return
        const update = () => setContainerWidth(el.clientWidth)
        update()
        const observer = new ResizeObserver(update)
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const isCompact = containerWidth != null && containerWidth < COMPACT_WIDTH

    // Close the drawer when leaving the narrow layout or picking a category
    useEffect(() => {
        if (!isCompact) setDrawerOpen(false)
    }, [isCompact])

    const onResize = (next: number) => setManualHeight(clampWindowHeight(next))

    const onResetSize = () => setManualHeight(null)

    // The narrow layout stacks more, so it never goes below a phone-friendly height
    const fitted = fitWindowHeight(viewportHeight, restOfPage)
    const height = isCompact
        ? Math.max(manualHeight ?? fitted, 760)
        : (manualHeight ?? fitted)

    const hasFilters = filters != null
    const showTree = tree != null && (!isCompact || drawerOpen)

    return (
        <div ref={containerRef} className="sxw-container">
            <GameWindow
                title="The Shard Exchange"
                className={`sxw${isCompact ? " compact" : ""}${hasFilters ? "" : " no-filters"}`}
                height={height}
                minHeight={WINDOW_MIN_HEIGHT}
                maxHeight={WINDOW_MAX_HEIGHT}
                onResize={onResize}
                onResetSize={onResetSize}
                resizable={!isCompact}
                onClose={onClose}
                isFullScreen={isFullScreen}
                onToggleFullScreen={onToggleFullScreen}
                closeLabel="Close (choose another server)"
            >
                <SideTabs
                    tabs={TABS}
                    selected={tab}
                    onSelect={onTab}
                    panelId={PANEL_ID}
                    label="Shard Exchange sections"
                />
                <div
                    className="gw-content sxw-content"
                    id={PANEL_ID}
                    role="tabpanel"
                    aria-labelledby={`${PANEL_ID}-tab-${tab}`}
                >
                    {placeholder ? (
                        <div className="sxw-placeholder">{placeholder}</div>
                    ) : (
                        <>
                            {hasFilters && (
                                <div className="sxw-top">
                                    {isCompact && tree != null ? (
                                        <FiltersWithDrawerButton
                                            filters={filters}
                                            onOpen={() =>
                                                setDrawerOpen((o) => !o)
                                            }
                                            open={drawerOpen}
                                        />
                                    ) : (
                                        filters
                                    )}
                                </div>
                            )}
                            {showTree && (
                                <div
                                    className={`gw-panel sxw-tree-panel gw-scroll${isCompact ? " drawer" : ""}`}
                                    onClick={(e) => {
                                        // Picking a category closes the drawer
                                        if (
                                            isCompact &&
                                            (e.target as HTMLElement).closest(
                                                ".sxw-tree-name"
                                            )
                                        )
                                            setDrawerOpen(false)
                                    }}
                                >
                                    {tree}
                                </div>
                            )}
                            <div className="gw-panel sxw-list-panel">
                                {list}
                                <div className="sxw-pager-row">
                                    {pager && <Pager {...pager} />}
                                </div>
                                <div className="sxw-status">
                                    <span className="sxw-status-label">
                                        {status.label}
                                    </span>
                                    <span className="gw-readout">
                                        {status.value}
                                    </span>
                                    <span className="sxw-status-actions">
                                        {status.actions}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                    <footer className="sxw-footer">
                        <label className="sxw-server">
                            <span className="gw-label">Server</span>
                            <select
                                className="gw-readout sxw-server-select"
                                value={server}
                                onChange={(e) => onServer(e.target.value)}
                            >
                                {SHARD_EXCHANGE_SERVERS.map((name) => (
                                    <option key={name} value={name}>
                                        {toSentenceCase(name)}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <span className="sxw-freshness" title={freshness.title}>
                            <span className="gw-label sxw-freshness-label">
                                Last Update
                            </span>
                            <ShardIcon size={30} className="sxw-big-shard" />
                            <span
                                className={`gw-readout${freshness.stale ? " stale" : ""}`}
                            >
                                {freshness.text}
                            </span>
                        </span>
                    </footer>
                </div>
            </GameWindow>
        </div>
    )
}

const FiltersWithDrawerButton = ({
    filters,
    onOpen,
    open,
}: {
    filters: ReactNode
    onOpen: () => void
    open: boolean
}) => (
    <div className="sxw-compact-top">
        <GameButton
            small
            grey={!open}
            aria-expanded={open}
            className="sxw-categories-button"
            onClick={onOpen}
        >
            Categories
        </GameButton>
        {filters}
    </div>
)

export default ShardExchangeWindow
