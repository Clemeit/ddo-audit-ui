import { useState } from "react"
import { useAlertContext } from "../../contexts/AlertContext"
import { useNotificationContext } from "../../contexts/NotificationContext"
import { NotificationPreferences } from "../../models/Notification"
import {
    osNotificationPermission,
    playAlertChime,
} from "../../utils/alertDelivery"
import { ContentCluster } from "../global/ContentCluster"
import Checkbox from "../global/Checkbox"
import Stack from "../global/Stack"
import Button from "../global/Button"
import PushSettings from "./PushSettings"

const DeviceSettings = () => {
    const { preferences, setPreferences, sendTest, isListening, push } =
        useAlertContext()
    const { createNotification } = useNotificationContext()
    const [permission, setPermission] = useState(() =>
        osNotificationPermission()
    )
    const [isSendingTest, setIsSendingTest] = useState(false)

    const update = (patch: Partial<NotificationPreferences>) =>
        setPreferences({ ...preferences, ...patch })

    const toggleOsNotifications = async () => {
        if (preferences.osNotifications) {
            update({ osNotifications: false })
            return
        }
        if (permission === "unsupported" || permission === "insecure") return
        // Only ever ask from this click, never on page load.
        let result: NotificationPermission = Notification.permission
        if (result === "default") {
            try {
                result = await Notification.requestPermission()
            } catch {
                result = Notification.permission
            }
        }
        setPermission(result)
        if (result === "granted") update({ osNotifications: true })
    }

    const toggleSound = () => {
        const sound = !preferences.sound
        update({ sound })
        // Playing from the click also unlocks audio for later alerts in this tab.
        if (sound) playAlertChime()
    }

    const sendTestAlert = async () => {
        setIsSendingTest(true)
        try {
            await sendTest()
            createNotification({
                title: "Test alert sent",
                message: "It should arrive within a few seconds.",
                type: "success",
                ttl: 4000,
            })
        } catch {
            createNotification({
                title: "Couldn't send a test alert",
                message: "Please try again in a moment.",
                type: "error",
                ttl: 5000,
            })
        } finally {
            setIsSendingTest(false)
        }
    }

    const osChecked = preferences.osNotifications && permission === "granted"

    return (
        <ContentCluster
            title="This device"
            subtitle="How alerts reach you on this browser."
        >
            <Stack direction="column" gap="16px">
                {!isListening && (
                    <p className="secondary-text" style={{ margin: 0 }}>
                        Create an alert (or resume a paused one) to start
                        listening.
                    </p>
                )}
                <PushSettings />
                <Stack direction="column" gap="10px">
                    <span className="input-label">
                        While DDO Audit is open in a tab
                    </span>
                    {push.status !== "on" && (
                        <Checkbox
                            checked={osChecked}
                            disabled={
                                permission === "unsupported" ||
                                permission === "insecure" ||
                                permission === "denied"
                            }
                            onChange={toggleOsNotifications}
                        >
                            Show desktop notifications when DDO Audit isn't the
                            active tab
                        </Checkbox>
                    )}
                    {push.status !== "on" && permission === "denied" && (
                        <p className="secondary-text" style={{ margin: 0 }}>
                            Your browser is blocking notifications from this
                            site. To allow them, click the icon to the left of
                            the address bar, allow notifications, then reload
                            the page.
                        </p>
                    )}
                    {push.status !== "on" && permission === "insecure" && (
                        <p className="secondary-text" style={{ margin: 0 }}>
                            Desktop notifications need a secure (HTTPS)
                            connection, so they aren't available on this
                            address.
                        </p>
                    )}
                    {push.status !== "on" && permission === "unsupported" && (
                        <p className="secondary-text" style={{ margin: 0 }}>
                            This browser doesn't support desktop notifications.
                        </p>
                    )}
                    <Checkbox
                        checked={preferences.sound}
                        onChange={toggleSound}
                    >
                        Play a sound
                    </Checkbox>
                    <Checkbox
                        checked={preferences.titleFlash}
                        onChange={() =>
                            update({ titleFlash: !preferences.titleFlash })
                        }
                    >
                        Flash the tab title
                    </Checkbox>
                </Stack>
                <div>
                    <Button
                        type="secondary"
                        onClick={sendTestAlert}
                        disabled={isSendingTest}
                    >
                        Send test alert
                    </Button>
                </div>
            </Stack>
        </ContentCluster>
    )
}

export default DeviceSettings
