import React, { useCallback, useEffect, useMemo } from "react"
import "./Notifications.css"
import { useNotificationContext } from "../../contexts/NotificationContext.tsx"
import { ReactComponent as CloseSVG } from "../../assets/svg/close.svg"
import Stack from "./Stack.tsx"
import Button from "./Button.tsx"

const Notifications = () => {
    const { notifications, dismissNotification, createNotification } =
        useNotificationContext()

    // temp
    useEffect(() => {
        // createNotification({
        //     title: "Something went wrong",
        //     message:
        //         "You should try refreshing the page. If the problem persists, please report it.",
        //     actions: (
        //         <Stack
        //             direction="row"
        //             gap="5px"
        //             justify="flex-end"
        //             fullColumnOnMobile
        //         >
        //             <Button type="primary" onClick={() => {}} fullWidthOnMobile>
        //                 Refresh
        //             </Button>
        //             <Button
        //                 type="secondary"
        //                 onClick={() => {}}
        //                 fullWidthOnMobile
        //             >
        //                 Report
        //             </Button>
        //         </Stack>
        //     ),
        // })
    }, [])

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
                        <h3 style={{ margin: 0 }}>{notification.title}</h3>
                        <p style={{ margin: 0 }}>{notification.message}</p>
                        <div className="notification-actions-container">
                            {notification.actions}
                        </div>
                    </div>
                )
            }),
        [notifications, dismissNotification]
    )

    return <div className="notifications-container">{notificationElements}</div>
}

export default Notifications
