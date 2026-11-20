// Pushes can arrive late (e.g. the browser was closed when the alert was sent). Below this age a push
// counts as on time and is shown as-is.
const LATE_AFTER_MS = 60_000

/** "4 min ago" for a push that arrived late, or null when it is on time or the time is unknown. */
function latePushAge(
    createdAt: unknown,
    now: number = Date.now()
): string | null {
    if (typeof createdAt !== "string") return null
    const created = Date.parse(createdAt)
    if (Number.isNaN(created)) return null
    const ageMs = now - created
    if (ageMs < LATE_AFTER_MS) return null
    const minutes = Math.floor(ageMs / 60_000)
    if (minutes < 60) return `${minutes} min ago`
    return `${Math.floor(minutes / 60)} h ago`
}

export { latePushAge }
