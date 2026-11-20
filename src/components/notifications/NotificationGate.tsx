import React from "react"
import Button from "../global/Button"
import { BLOCKED_REASON_TEXT } from "../../utils/deviceNotificationState"
import { ReactComponent as BellSVG } from "../../assets/svg/notifications.svg"
import type { DeviceNotifications } from "./useDeviceNotifications"

interface Props {
    device: DeviceNotifications
}

/** The first step on this device: until notifications are on (or skipped), it's the whole page. */
const NotificationGate = ({ device }: Props) => {
    const { device: state, turnOn, dismissSetup } = device

    if (state.state === "gate-blocked") {
        return (
            <div className="notification-gate">
                <BellSVG
                    className="notification-gate-icon blocked"
                    aria-hidden
                />
                <h2>Notifications aren't available here</h2>
                <p>{BLOCKED_REASON_TEXT[state.reason]}</p>
                <p className="secondary-text">
                    You can still get alerts as pop-ups and a sound while DDO
                    Audit is open in a tab.
                </p>
                <Button type="text" onClick={dismissSetup}>
                    Continue with in-tab alerts only →
                </Button>
            </div>
        )
    }

    return (
        <div className="notification-gate">
            <BellSVG className="notification-gate-icon" aria-hidden />
            <h2>Turn on notifications</h2>
            <p>
                DDO Audit can tell you the moment something you care about
                happens, like an LFM for your favorite raid or a friend logging
                in. First, allow notifications on this device.
            </p>
            <div className="notification-gate-actions">
                <Button type="primary" onClick={turnOn}>
                    Turn on notifications
                </Button>
                <Button type="text" onClick={dismissSetup}>
                    Not now
                </Button>
            </div>
            <p className="secondary-text notification-gate-footnote">
                Your browser will ask for permission. You can turn this off at
                any time.
            </p>
        </div>
    )
}

export default NotificationGate
