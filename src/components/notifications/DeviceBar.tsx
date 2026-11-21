import React from "react"
import ExpandableContainer from "../global/ExpandableContainer"
import Button from "../global/Button"
import Checkbox from "../global/Checkbox"
import {
    BLOCKED_REASON_TEXT,
    BlockedReason,
} from "../../utils/deviceNotificationState"
import QuietHours, { activeQuietWindow } from "./QuietHours"
import type { DeviceNotifications } from "./useDeviceNotifications"
import type { QuietHours as QuietHoursState } from "./useQuietHours"

interface Props {
    device: DeviceNotifications
    quietHours: QuietHoursState
}

const SHORT_BLOCKED_TEXT: Record<BlockedReason, string> = {
    denied: "notifications are blocked in your browser",
    insecure: "this address isn't secure (HTTPS)",
    unsupported: "this browser doesn't support notifications",
    "ios-needs-install": "add DDO Audit to your Home Screen for notifications",
}

/**
 * Notifications, once the first step is done: a one-line status that expands into the controls for this
 * device and for the account's quiet hours.
 */
const DeviceBar = ({ device, quietHours }: Props) => {
    const {
        device: state,
        pushStatus,
        sound,
        isSendingTest,
        turnOn,
        turnOff,
        enablePush,
        disablePush,
        setSound,
        sendTestAlert,
    } = device
    const pushBusy = pushStatus === "working"

    let tone: "on" | "off" | "warn" = "off"
    let headline: string
    let status: React.ReactNode
    let actions: React.ReactNode = null

    switch (state.state) {
        case "on-push":
            tone = "on"
            headline = "Push notifications are on"
            status = "Alerts reach this device even when DDO Audit is closed."

            actions = (
                <>
                    <Button
                        type="secondary"
                        small
                        disabled={pushBusy}
                        onClick={disablePush}
                    >
                        Disable push
                    </Button>
                    <Button
                        type="text"
                        small
                        disabled={pushBusy}
                        onClick={turnOff}
                    >
                        Turn off
                    </Button>
                </>
            )
            break
        case "on":
            tone = "on"
            headline = "Notifications are on"
            status =
                pushStatus === "off" || pushBusy
                    ? "You'll get notifications while DDO Audit is open. Enable push to get them when it's closed, too."
                    : "You'll get notifications while DDO Audit is open."

            actions = (
                <>
                    {(pushStatus === "off" || pushBusy) && (
                        <Button
                            type="primary"
                            small
                            disabled={pushBusy}
                            onClick={enablePush}
                        >
                            {pushBusy ? "One moment…" : "Enable push"}
                        </Button>
                    )}
                    <Button
                        type="text"
                        small
                        disabled={pushBusy}
                        onClick={turnOff}
                    >
                        Turn off
                    </Button>
                </>
            )
            break
        case "off":
            headline = "Notifications are off"
            status =
                "You'll only see alerts as pop-ups while DDO Audit is open."

            actions = (
                <Button type="primary" small onClick={turnOn}>
                    Turn on
                </Button>
            )
            break
        case "in-tab-only":
            tone = "warn"
            headline = `In-tab alerts only: ${SHORT_BLOCKED_TEXT[state.reason]}`
            status = BLOCKED_REASON_TEXT[state.reason]

            break
        default:
            return null
    }

    const quietWindow = activeQuietWindow(quietHours.preferences)

    return (
        <ExpandableContainer
            className={`device-bar device-bar-${tone}`}
            aria-label="Notifications"
            icon={<span className="device-bar-dot" aria-hidden />}
            title={
                <>
                    {headline}
                    {quietWindow && (
                        <span className="device-bar-quiet">
                            {" "}
                            · Quiet hours {quietWindow}
                        </span>
                    )}
                </>
            }
        >
            <div className="device-bar-panel">
                <p className="device-bar-status">{status}</p>
                <div className="device-bar-actions">
                    {actions}
                    <Button
                        type="secondary"
                        small
                        disabled={isSendingTest}
                        onClick={sendTestAlert}
                    >
                        Send test
                    </Button>
                    <Checkbox checked={sound} onChange={() => setSound(!sound)}>
                        Sound
                    </Checkbox>
                </div>
                <QuietHours quietHours={quietHours} />
            </div>
        </ExpandableContainer>
    )
}

export default DeviceBar
