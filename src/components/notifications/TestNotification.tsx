import React from "react"
import Button from "../global/Button"

const TestNotification = () => {
    const sendTestSystemNotification = async () => {
        if (Notification.permission !== "granted") {
            await Notification.requestPermission()
        }
        if (Notification.permission === "granted") {
            new Notification("DDO Audit Test", {
                body: "This is a test system notification",
                icon: "/icons/logo-192px.png",
                tag: "test-notification",
                requireInteraction: false,
            })
        }
    }

    return (
        <div
            style={{
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                margin: "20px 0",
            }}
        >
            <h3>Test System Notifications</h3>
            <p
                style={{
                    color: "#666",
                    fontSize: "14px",
                    marginBottom: "15px",
                }}
            >
                Test different types of system-level notifications:
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Button type="secondary" onClick={sendTestSystemNotification}>
                    Test Local System Notification
                </Button>

                {/* Firebase console button removed (Firebase unused) */}
            </div>

            {/* Firebase push notification instructions removed */}
        </div>
    )
}

export default TestNotification
