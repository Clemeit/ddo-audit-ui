import { useEffect, useRef, useState } from "react"

interface UsePeriodicCallbackOptions {
    callback: () => void
    intervalMs: number
    ttlMs?: number
    startTime?: Date
}

interface ReturnProps {
    isActive: boolean
}

/**
 * Call the provided function on the specified interval. Provide an optional TTL.
 * @returns {isActive: boolean} - Indicates if the interval is still active.
 */
const useLimitedInterval = ({
    callback,
    intervalMs,
    ttlMs = -1,
    startTime = new Date(),
}: UsePeriodicCallbackOptions): ReturnProps => {
    const callbackRef = useRef(callback)
    const startTimeRef = useRef(startTime)
    const [isActive, setIsActive] = useState<boolean>(true)

    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    useEffect(() => {
        const updateInterval = setInterval(() => {
            const elapsed =
                new Date().getTime() - startTimeRef.current.getTime()
            if (ttlMs !== -1 && elapsed > ttlMs) {
                setIsActive(false)
                return
            }
            callbackRef.current()
        }, intervalMs)

        return () => clearInterval(updateInterval)
    }, [intervalMs, ttlMs])

    return {
        isActive,
    }
}

export default useLimitedInterval
