import { AlertPreferences } from "../models/Alert"

// Quiet hours are enforced by the server (alerts that fire in the window are skipped, not delayed).
// These helpers only validate and describe the window for the settings UI.

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

const DEFAULT_QUIET_START = "23:00"
const DEFAULT_QUIET_END = "07:00"

function defaultQuietHours(timezone: string): AlertPreferences {
    return {
        quiet_enabled: false,
        quiet_start: DEFAULT_QUIET_START,
        quiet_end: DEFAULT_QUIET_END,
        timezone,
    }
}

function isValidTime(value: string): boolean {
    return TIME_PATTERN.test(value)
}

/** Minutes after midnight for an "HH:MM" string, or null if it isn't one. */
function timeToMinutes(value: string): number | null {
    const match = TIME_PATTERN.exec(value)
    return match ? Number(match[1]) * 60 + Number(match[2]) : null
}

/** The window is usable when both times are valid and differ (an empty window is rejected by the server). */
function isValidQuietWindow(start: string, end: string): boolean {
    return isValidTime(start) && isValidTime(end) && start !== end
}

/** "23:00" -> "11:00 PM" */
function formatTime(value: string): string {
    const minutes = timeToMinutes(value)
    if (minutes === null) return value
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    const suffix = hour < 12 ? "AM" : "PM"
    const hour12 = hour % 12 === 0 ? 12 : hour % 12
    return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`
}

/** "11:00 PM to 7:00 AM" */
function describeQuietWindow(start: string, end: string): string {
    return `${formatTime(start)} to ${formatTime(end)}`
}

/** The browser's timezone, or the user's override from settings. */
function effectiveTimezone(timezoneOverride?: string): string {
    return timezoneOverride || Intl.DateTimeFormat().resolvedOptions().timeZone
}

export {
    defaultQuietHours,
    describeQuietWindow,
    effectiveTimezone,
    formatTime,
    isValidQuietWindow,
    isValidTime,
    timeToMinutes,
}
