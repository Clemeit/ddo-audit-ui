// What the notifications page shows for this device: the full-page "turn on notifications" gate, or
// the compact device bar in one of its states.

import type { PushStatus } from "../hooks/usePushSubscription"
import type { OsNotificationStatus } from "./alertDelivery"

type BlockedReason = "denied" | "insecure" | "unsupported" | "ios-needs-install"

type DeviceNotificationState =
    | { state: "gate" } // notifications could be turned on; nothing else on the page yet
    | { state: "gate-blocked"; reason: BlockedReason } // they can't be turned on here
    | { state: "off" } // set up, then skipped or turned off; can be turned on
    | { state: "in-tab-only"; reason: BlockedReason } // blocked, user chose in-tab alerts only
    | { state: "on" } // OS notifications while a tab is open; push can be added
    | { state: "on-push" } // push on: alerts arrive even with the site closed

interface Inputs {
    permission: OsNotificationStatus
    osNotifications: boolean
    setupDismissed: boolean
    pushStatus: PushStatus
}

function blockedReason(
    permission: OsNotificationStatus,
    pushStatus: PushStatus
): BlockedReason | null {
    // iOS Safari outside the Home Screen has no Notification API at all; the install hint is the useful one.
    if (pushStatus === "ios-needs-install") return "ios-needs-install"
    if (
        permission === "denied" ||
        permission === "insecure" ||
        permission === "unsupported"
    )
        return permission
    return null
}

function deviceNotificationState({
    permission,
    osNotifications,
    setupDismissed,
    pushStatus,
}: Inputs): DeviceNotificationState {
    if (permission === "granted") {
        // Push on counts as on even if the device toggle was never set (push can be turned on alone).
        if (pushStatus === "on") return { state: "on-push" }
        if (osNotifications) return { state: "on" }
    }
    const reason = blockedReason(permission, pushStatus)
    if (reason) {
        return setupDismissed
            ? { state: "in-tab-only", reason }
            : { state: "gate-blocked", reason }
    }
    return setupDismissed ? { state: "off" } : { state: "gate" }
}

const BLOCKED_REASON_TEXT: Record<BlockedReason, string> = {
    denied: "Your browser is blocking notifications from this site. To allow them, click the icon to the left of the address bar, allow notifications, then reload the page.",
    insecure:
        "Notifications need a secure (HTTPS) connection, so they aren't available on this address.",
    unsupported: "This browser doesn't support notifications.",
    "ios-needs-install":
        "On iPhone and iPad, notifications only work from the Home Screen: tap Share, then Add to Home Screen, and open DDO Audit from there.",
}

export { deviceNotificationState, BLOCKED_REASON_TEXT }
export type { DeviceNotificationState, BlockedReason }
