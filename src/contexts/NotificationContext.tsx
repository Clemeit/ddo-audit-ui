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
    createNotification: (notification: Notification) => void
    dismissNotification: (id?: string) => void
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
    undefined
)

interface Props {
    children: React.ReactNode
}

export const NotificationProvider = ({ children }: Props) => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

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
        const nofiticationId = notification.id || uuid()
        setNotifications((prev) => [
            ...prev,
            { ...notification, id: nofiticationId },
        ])
        if (notification.ttl) {
            timeoutNotification(nofiticationId, notification.ttl)
        }
    }, [])

    const dismissNotification = useCallback((id?: string) => {
        if (!id) return

        // Clear the timeout if it exists
        const timeoutId = timeoutRefs.current.get(id)
        if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutRefs.current.delete(id)
        }

        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, [])

    useEffect(() => {
        // event listener for closing modal on escape key press
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                // dismiss the first notification in the list
                setNotifications((prev) => {
                    if (prev.length > 0) {
                        const firstNotification = prev[0]
                        // Clear timeout for the dismissed notification
                        const timeoutId = timeoutRefs.current.get(
                            firstNotification.id
                        )
                        if (timeoutId) {
                            clearTimeout(timeoutId)
                            timeoutRefs.current.delete(firstNotification.id)
                        }
                        return prev.slice(1)
                    }
                    return prev
                })
            }
        }
        document.addEventListener("keydown", handleKeyDown)

        // Cleanup function to clear all timeouts when component unmounts
        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            // Clear all pending timeouts
            timeoutRefs.current.forEach((timeoutId) => {
                clearTimeout(timeoutId)
            })
            timeoutRefs.current.clear()
        }
    }, [])

    return (
        <NotificationContext.Provider
            value={{ notifications, createNotification, dismissNotification }}
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
