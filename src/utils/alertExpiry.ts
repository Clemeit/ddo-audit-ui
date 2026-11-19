// Alert rules can stop on their own ("for tonight only"). The server ignores rules past expires_at.

type ExpiryPreset = "keep" | "never" | "3h" | "24h" | "7d"

const HOUR_MS = 3_600_000

const PRESET_DURATION_MS: Record<"3h" | "24h" | "7d", number> = {
    "3h": 3 * HOUR_MS,
    "24h": 24 * HOUR_MS,
    "7d": 7 * 24 * HOUR_MS,
}

/** The expires_at to save for a preset; "keep" returns the rule's current value. */
function expiryFromPreset(
    preset: ExpiryPreset,
    current: string | null = null,
    now: number = Date.now()
): string | null {
    if (preset === "keep") return current
    if (preset === "never") return null
    return new Date(now + PRESET_DURATION_MS[preset]).toISOString()
}

function isExpired(
    expiresAt: string | null | undefined,
    now: number = Date.now()
): boolean {
    if (!expiresAt) return false
    const t = Date.parse(expiresAt)
    return !Number.isNaN(t) && t <= now
}

/** "Ends in 3h", "Ends in 2d", "Expired", or null when the rule never ends. */
function formatExpiry(
    expiresAt: string | null | undefined,
    now: number = Date.now()
): string | null {
    if (!expiresAt) return null
    const t = Date.parse(expiresAt)
    if (Number.isNaN(t)) return null
    const left = t - now
    if (left <= 0) return "Expired"
    const minutes = Math.ceil(left / 60_000)
    if (minutes < 60) return `Ends in ${minutes}m`
    const hours = Math.round(left / HOUR_MS)
    if (hours < 48) return `Ends in ${hours}h`
    return `Ends in ${Math.round(left / (24 * HOUR_MS))}d`
}

export { expiryFromPreset, isExpired, formatExpiry }
export type { ExpiryPreset }
