import { SERVER_NAMES_LOWER } from "../../constants/servers.ts"

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

const DISMISSED_OUTBIDS_KEY = "shard-exchange-dismissed-outbids"

export function getDismissedOutbids(): string[] {
    try {
        const parsed = JSON.parse(
            localStorage.getItem(DISMISSED_OUTBIDS_KEY) || "[]"
        )
        return Array.isArray(parsed)
            ? parsed.filter((v): v is string => typeof v === "string")
            : []
    } catch {
        return []
    }
}

export function setDismissedOutbids(keys: string[]) {
    try {
        if (keys.length === 0) localStorage.removeItem(DISMISSED_OUTBIDS_KEY)
        else localStorage.setItem(DISMISSED_OUTBIDS_KEY, JSON.stringify(keys))
    } catch {
        // ignore
    }
}

export function getRememberedShardExchangeServer(): string | null {
    try {
        const server = localStorage.getItem(LAST_SERVER_KEY)
        return server && SERVER_NAMES_LOWER.includes(server) ? server : null
    } catch {
        return null
    }
}
