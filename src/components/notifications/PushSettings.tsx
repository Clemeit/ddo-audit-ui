import { useAlertContext } from "../../contexts/AlertContext"
import { useNotificationContext } from "../../contexts/NotificationContext"
import { PushStatus } from "../../hooks/usePushSubscription"
import Button from "../global/Button"
import Stack from "../global/Stack"

const STATUS_TEXT: Record<PushStatus, string> = {
    checking: "Checking…",
    working: "One moment…",
    on: "On for this device. You'll get alerts even when DDO Audit is closed.",
    off: "Get alerts on this device even when DDO Audit is closed.",
    denied: "Your browser is blocking notifications from this site. To allow them, click the icon to the left of the address bar, allow notifications, then reload the page.",
    insecure:
        "Push notifications need a secure (HTTPS) connection, so they aren't available on this address.",
    "ios-needs-install":
        "On iPhone and iPad, push notifications only work from the Home Screen: tap Share, then Add to Home Screen, and open DDO Audit from there.",
    unsupported: "This browser doesn't support push notifications.",
    unavailable: "Push notifications aren't available right now.",
}

const PushSettings = () => {
    const { push } = useAlertContext()
    const { createNotification } = useNotificationContext()
    const { status } = push

    const turnOn = async () => {
        try {
            const enabled = await push.enable()
            if (enabled) {
                createNotification({
                    title: "Push notifications on",
                    message:
                        "Send a test alert to check that they arrive on this device.",
                    type: "success",
                    ttl: 5000,
                })
            }
        } catch {
            createNotification({
                title: "Couldn't turn on push notifications",
                message: "Please try again in a moment.",
                type: "error",
                ttl: 5000,
            })
        }
    }

    const showButton =
        status === "on" || status === "off" || status === "working"

    return (
        <Stack direction="column" gap="6px">
            <span className="input-label">Push notifications</span>
            <p className="secondary-text" style={{ margin: 0 }}>
                {STATUS_TEXT[status]}
            </p>
            {showButton && (
                <div>
                    {status === "on" ? (
                        <Button type="secondary" onClick={() => push.disable()}>
                            Turn off
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            onClick={turnOn}
                            disabled={status === "working"}
                        >
                            Turn on push notifications
                        </Button>
                    )}
                </div>
            )}
        </Stack>
    )
}

export default PushSettings
