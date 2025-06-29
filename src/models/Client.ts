import React from "react"

interface Notification {
    id?: string
    title: string
    message: string
    subMessage?: string
    lifetime?: number
    type?: "info" | "success" | "warning" | "error"
    icon?: React.ReactNode
    actions?: React.ReactNode
}

export type { Notification }
