import { isShardExchangeServer } from "../../utils/shardExchangeUtils.ts"

// The last server browsed, so the server list can offer it first. Storage can be unavailable
// (private windows, blocked site data); everything here then simply does nothing.
const LAST_SERVER_KEY = "shard-exchange-last-server"

export function rememberShardExchangeServer(server: string) {
    try {
        localStorage.setItem(LAST_SERVER_KEY, server.toLowerCase())
    } catch {
        // ignore
    }
}

// The window always fills the page's width. Its height fits the browser window; a height the
// user drags to lasts only until the page is left or reloaded.
export const WINDOW_MIN_WIDTH = 760
export const WINDOW_MIN_HEIGHT = 480
export const WINDOW_MAX_HEIGHT = 2000
// Used before the rest of the page has been measured
export const WINDOW_SCREEN_MARGIN = 24

export function clampWindowHeight(height: number): number {
    return Math.min(
        WINDOW_MAX_HEIGHT,
        Math.max(WINDOW_MIN_HEIGHT, Math.round(height))
    )
}

// The tallest the window can be without the page scrolling: the browser window's height less
// everything else on the page. Never below the minimum (short screens then scroll).
export function fitWindowHeight(
    viewportHeight: number,
    restOfPage: number | null
): number {
    return clampWindowHeight(
        viewportHeight - (restOfPage ?? WINDOW_SCREEN_MARGIN * 2)
    )
}

// Earlier versions saved a dragged height here. It isn't kept any more; clear what's left.
// Also the old outbid notice's dismissals (outbid alerts now live on /notifications).
const OLD_WINDOW_SIZE_KEYS = [
    "shard-exchange-window-height",
    "shard-exchange-window-size",
    "shard-exchange-dismissed-outbids",
]

export function forgetStoredWindowHeight() {
    try {
        OLD_WINDOW_SIZE_KEYS.forEach((key) => localStorage.removeItem(key))
    } catch {
        // ignore
    }
}

const PER_UNIT_KEY = "shard-exchange-per-unit"

export function getShardExchangePerUnit(): boolean {
    try {
        return localStorage.getItem(PER_UNIT_KEY) === "1"
    } catch {
        return false
    }
}

export function setShardExchangePerUnit(perUnit: boolean) {
    try {
        if (perUnit) localStorage.setItem(PER_UNIT_KEY, "1")
        else localStorage.removeItem(PER_UNIT_KEY)
    } catch {
        // ignore
    }
}

export function getRememberedShardExchangeServer(): string | null {
    try {
        const server = localStorage.getItem(LAST_SERVER_KEY)
        return server && isShardExchangeServer(server) ? server : null
    } catch {
        return null
    }
}
