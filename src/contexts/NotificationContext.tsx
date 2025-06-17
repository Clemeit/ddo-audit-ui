import React, { createContext, useState, useContext } from "react"
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

    const createNotification = (notification: Notification) => {
        setNotifications((prev) => [...prev, { ...notification, id: uuid() }])
    }

    const dismissNotification = (id?: string) => {
        if (!id) return
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

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
