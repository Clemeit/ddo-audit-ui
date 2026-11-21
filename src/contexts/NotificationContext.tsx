import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useCallback,
    useRef,
} from "react"
import { Notification } from "../models/Client"
import { v4 as uuid } from "uuid"

interface NotificationContextProps {
    notifications: Notification[]
    /** Show a notification. Reusing an id replaces that notification instead of stacking. */
    createNotification: (notification: Notification) => void
    /** The user dismissed it (close button, Escape): runs its onDismiss. */
    dismissNotification: (id?: string) => void
    /** Take it down programmatically, without running onDismiss. */
    removeNotification: (id?: string) => void
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
    undefined
)

interface Props {
    children: React.ReactNode
}

export const NotificationProvider = ({ children }: Props) => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const notificationsRef = useRef<Notification[]>([])
    notificationsRef.current = notifications
    const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

    const clearNotificationTimeout = (id: string) => {
        const timeoutId = timeoutRefs.current.get(id)
        if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutRefs.current.delete(id)
        }
    }

    const timeoutNotification = (id: string, ttl: number) => {
        const timeoutId = setTimeout(() => {
            setNotifications((prev) =>
                prev.filter((notification) => notification.id !== id)
            )
            timeoutRefs.current.delete(id)
        }, ttl)
        timeoutRefs.current.set(id, timeoutId)
    }

    const createNotification = useCallback((notification: Notification) => {
        const notificationId = notification.id || uuid()
        const next = { ...notification, id: notificationId }
        clearNotificationTimeout(notificationId)
        setNotifications((prev) =>
            prev.some((n) => n.id === notificationId)
                ? prev.map((n) => (n.id === notificationId ? next : n))
                : [...prev, next]
        )
        if (notification.ttl) {
            timeoutNotification(notificationId, notification.ttl)
        }
    }, [])

    const removeNotification = useCallback((id?: string) => {
        if (!id) return
        clearNotificationTimeout(id)
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, [])

    const dismissNotification = useCallback(
        (id?: string) => {
            if (!id) return
            const dismissed = notificationsRef.current.find((n) => n.id === id)
            removeNotification(id)
            dismissed?.onDismiss?.()
        },
        [removeNotification]
    )

    useEffect(() => {
        // Escape dismisses the oldest notification.
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                const first = notificationsRef.current[0]
                if (first) dismissNotification(first.id)
            }
        }
        document.addEventListener("keydown", handleKeyDown)

        const timeouts = timeoutRefs.current
        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            timeouts.forEach((timeoutId) => clearTimeout(timeoutId))
            timeouts.clear()
        }
    }, [dismissNotification])

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                createNotification,
                dismissNotification,
                removeNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotificationContext = () => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error(
            "useNotificationContext must be used within a NotificationContext"
        )
    }
    return context
}
