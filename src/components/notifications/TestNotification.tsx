import React from "react"
import Button from "../global/Button"
import firebaseMessaging from "../../services/firebaseMessaging.ts"

const TestNotification = () => {
    const sendTestSystemNotification = async () => {
        // This sends a local system notification (not through Firebase)
        await firebaseMessaging.sendTestNotification()
    }

    const openFirebaseConsole = () => {
        // Open Firebase Console for sending real FCM messages
        window.open("https://console.firebase.google.com/", "_blank")
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

                <Button type="secondary" onClick={openFirebaseConsole}>
                    Open Firebase Console
                </Button>
            </div>

            <div style={{ marginTop: "15px", fontSize: "12px", color: "#888" }}>
                <strong>To test Firebase push notifications:</strong>
                <ol style={{ margin: "5px 0", paddingLeft: "20px" }}>
                    <li>Copy your FCM token from above</li>
                    <li>Open Firebase Console → Cloud Messaging</li>
                    <li>Click "Send your first message"</li>
                    <li>Enter title/body and paste your token</li>
                    <li>Send the notification</li>
                </ol>
                <p style={{ marginTop: "10px" }}>
                    The notification will appear as a system notification even
                    if the browser tab is closed!
                </p>
            </div>
        </div>
    )
}

export default TestNotification
