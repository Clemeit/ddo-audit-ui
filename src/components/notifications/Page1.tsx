import React, { useState } from "react"
import { ContentCluster } from "../global/ContentCluster.tsx"
import Stack from "../global/Stack.tsx"
import Spacer from "../global/Spacer.tsx"
import Button from "../global/Button.tsx"
import TestNotification from "./TestNotification.tsx"
import PageMessage from "../global/PageMessage.tsx"

interface Props {
    setPage: Function
    isSubscribed: boolean
    onSubscribe: () => Promise<void>
    onUnsubscribe: () => Promise<void>
    fcmToken: string | null
    showPreferencesLink?: boolean
}

const Page1 = ({
    setPage,
    isSubscribed,
    onSubscribe,
    onUnsubscribe,
    fcmToken,
    showPreferencesLink = false,
}: Props) => {
    const [rules, setRules] = useState([])

    const getNotificationStatus = () => {
        if (Notification.permission === "denied") {
            return (
                <PageMessage
                    title="Notifications Blocked"
                    type="error"
                    message="You have blocked notifications. Please enable them in your browser settings."
                />
            )
        } else if (Notification.permission === "granted" && isSubscribed) {
            return (
                <PageMessage
                    title="Notifications Active"
                    type="success"
                    message="Push notifications are enabled and working."
                />
            )
        } else if (Notification.permission === "granted" && !isSubscribed) {
            return (
                <PageMessage
                    title="Notifications Available"
                    type="info"
                    message="You have granted permission for notifications but haven't subscribed yet."
                />
            )
        } else {
            return (
                <PageMessage
                    title="Notifications Not Configured"
                    type="warning"
                    message="You haven't requested notification permissions yet. Enable push notifications below."
                />
            )
        }
    }

    const notificationStatus = getNotificationStatus()

    return (
        <>
            {notificationStatus}
            <ContentCluster title="Push Notifications">
                <p>
                    Enabling push notifications allows you to receive real-time
                    updates about LFMs and friends. You can also visit DDO Audit
                    on a mobile device and enable notifications to receive
                    alerts on your phone or tablet.
                </p>

                <Stack gap="15px" direction="column">
                    {fcmToken && (
                        <details style={{ marginTop: "10px" }}>
                            <summary
                                style={{ cursor: "pointer", color: "#666" }}
                            >
                                FCM Token (for debugging)
                            </summary>
                            <code
                                style={{
                                    fontSize: "12px",
                                    wordBreak: "break-all",
                                    background: "#f5f5f5",
                                    padding: "10px",
                                    display: "block",
                                    marginTop: "5px",
                                    borderRadius: "4px",
                                }}
                            >
                                {fcmToken}
                            </code>
                        </details>
                    )}

                    <Stack gap="10px" fullWidth justify="flex-start">
                        {isSubscribed ? (
                            <Button
                                type="secondary"
                                className="critical"
                                onClick={onUnsubscribe}
                            >
                                Disable Push Notifications
                            </Button>
                        ) : (
                            <Button type="primary" onClick={onSubscribe}>
                                Enable Push Notifications
                            </Button>
                        )}
                        {showPreferencesLink && isSubscribed && (
                            <Button type="secondary" onClick={() => setPage(3)}>
                                Notification Preferences
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </ContentCluster>

            <Spacer size="20px" />

            {isSubscribed && <TestNotification />}

            <ContentCluster title="Notification Rules">
                {rules.length === 0 && (
                    <div>You currently have no notification rules set up.</div>
                )}
                <Spacer size="20px" />
                <Stack gap="10px" fullWidth justify="space-between">
                    <div />
                    <Button
                        type="primary"
                        onClick={() => setPage(2)}
                        disabled={!isSubscribed}
                    >
                        New Rule
                    </Button>
                </Stack>
                {!isSubscribed && (
                    <div
                        style={{
                            color: "#666",
                            fontSize: "14px",
                            marginTop: "10px",
                        }}
                    >
                        Enable push notifications first to create notification
                        rules.
                    </div>
                )}
            </ContentCluster>
        </>
    )
}

export default Page1
