import React from "react"
import { act, render } from "@testing-library/react"
import {
    NotificationProvider,
    useNotificationContext,
} from "../NotificationContext"

type Api = ReturnType<typeof useNotificationContext>

const renderProvider = () => {
    const api: { current: Api | null } = { current: null }
    const Probe = () => {
        api.current = useNotificationContext()
        return null
    }
    render(
        <NotificationProvider>
            <Probe />
        </NotificationProvider>
    )
    return api as { current: Api }
}

describe("NotificationContext", () => {
    it("replaces a notification that reuses an id instead of stacking it", () => {
        const api = renderProvider()

        act(() => {
            api.current.createNotification({ id: "x", title: "One", message: "" })
            api.current.createNotification({ id: "x", title: "Two", message: "" })
        })

        expect(api.current.notifications.map((n) => n.title)).toEqual(["Two"])
    })

    it("runs onDismiss when the user dismisses, but not on programmatic removal", () => {
        const api = renderProvider()
        const onDismiss = jest.fn()

        act(() => {
            api.current.createNotification({
                id: "a",
                title: "A",
                message: "",
                onDismiss,
            })
        })
        act(() => api.current.removeNotification("a"))
        expect(onDismiss).not.toHaveBeenCalled()

        act(() => {
            api.current.createNotification({
                id: "a",
                title: "A",
                message: "",
                onDismiss,
            })
        })
        act(() => api.current.dismissNotification("a"))
        expect(onDismiss).toHaveBeenCalledTimes(1)
        expect(api.current.notifications).toHaveLength(0)
    })

    it("runs onDismiss when Escape dismisses it", () => {
        const api = renderProvider()
        const onDismiss = jest.fn()
        act(() => {
            api.current.createNotification({
                id: "a",
                title: "A",
                message: "",
                onDismiss,
            })
        })

        act(() => {
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
        })

        expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it("does not run onDismiss when the ttl expires", () => {
        jest.useFakeTimers()
        try {
            const api = renderProvider()
            const onDismiss = jest.fn()
            act(() => {
                api.current.createNotification({
                    id: "t",
                    title: "T",
                    message: "",
                    ttl: 1000,
                    onDismiss,
                })
            })

            act(() => {
                jest.advanceTimersByTime(1500)
            })

            expect(api.current.notifications).toHaveLength(0)
            expect(onDismiss).not.toHaveBeenCalled()
        } finally {
            jest.useRealTimers()
        }
    })
})
