import React from "react"

interface Notification {
    id?: string
    title: string
    message: string
    icon?: React.ReactNode
    actions?: React.ReactNode
}

export { Notification }
