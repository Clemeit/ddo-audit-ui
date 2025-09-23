import { useEffect, useState } from "react"

/**
 * Returns the current timestamp (ms) that updates on an interval.
 * - Defaults to 1000ms updates
 * - Pauses updates when the document is hidden (saves battery/CPU)
 */
export default function useNow(
    intervalMs: number = 1000,
    onlyWhenVisible = true
) {
    const [now, setNow] = useState<number>(() => Date.now())

    useEffect(() => {
        let id: number | undefined

        const start = () => {
            if (id != null) return
            id = window.setInterval(() => setNow(Date.now()), intervalMs)
        }

        const stop = () => {
            if (id != null) {
                clearInterval(id)
                id = undefined
            }
        }

        const onVisibilityChange = () => {
            if (!onlyWhenVisible) return
            if (document.visibilityState === "visible") {
                setNow(Date.now()) // refresh immediately when visible
                start()
            } else {
                stop()
            }
        }

        if (!onlyWhenVisible || document.visibilityState === "visible") {
            start()
        }

        if (onlyWhenVisible) {
            document.addEventListener("visibilitychange", onVisibilityChange)
        }

        return () => {
            if (onlyWhenVisible) {
                document.removeEventListener(
                    "visibilitychange",
                    onVisibilityChange
                )
            }
            stop()
        }
    }, [intervalMs, onlyWhenVisible])

    return now
}
