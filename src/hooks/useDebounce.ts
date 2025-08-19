import { useState, useEffect, useCallback } from "react"

function useDebounce<T>(
    value: T,
    delay: number
): { debouncedValue: T; refreshDebounce: () => void } {
    const [debouncedValue, setDebouncedValue] = useState(value)

    const refreshDebounce = useCallback(() => {
        setDebouncedValue(value)
    }, [value])

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return { debouncedValue, refreshDebounce }
}

export default useDebounce
