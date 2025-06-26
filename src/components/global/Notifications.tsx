import React, { useMemo } from "react"
import "./Notifications.css"
import { useNotificationContext } from "../../contexts/NotificationContext.tsx"
import { ReactComponent as CloseSVG } from "../../assets/svg/close.svg"
import { ReactComponent as X } from "../../assets/svg/x.svg"
import { ReactComponent as Warning } from "../../assets/svg/warning.svg"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { ReactComponent as Info } from "../../assets/svg/info.svg"

const Notifications = () => {
    const { notifications, dismissNotification } = useNotificationContext()

    const getIcon = (type?: string) => {
        switch (type) {
            case "success":
                return <Checkmark />
            case "info":
                return <Info style={{ fill: "var(--blue1)" }} />
            case "warning":
                return <Warning style={{ fill: "var(--orange4)" }} />
            case "error":
                return <X />
            default:
                return null
        }
    }

    const notificationElements = useMemo(
        () =>
            notifications.map((notification) => {
                return (
                    <div key={notification.id} className="notification">
                        <div
                            className="notification-close"
                            onClick={() => dismissNotification(notification.id)}
                        >
                            <CloseSVG />
                        </div>
                        <h3
                            style={{
                                margin: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                            }}
                        >
                            {getIcon(notification.type)}
                            {notification.title}
                        </h3>
                        <p style={{ margin: 0 }}>{notification.message}</p>
                        {notification.subMessage && (
                            <p
                                style={{
                                    margin: 0,
                                    color: "var(--secondary-text)",
                                }}
                            >
                                {notification.subMessage}
                            </p>
                        )}
                        {notification.actions && (
                            <div className="notification-actions-container">
                                {notification.actions}
                            </div>
                        )}
                    </div>
                )
            }),
        [notifications, dismissNotification]
    )

    return <div className="notifications-container">{notificationElements}</div>
}

export default Notifications
