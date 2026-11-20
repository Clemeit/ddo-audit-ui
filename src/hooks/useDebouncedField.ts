import { useEffect, useRef, useState } from "react"
import useDebounce from "./useDebounce.ts"

const DEFAULT_DEBOUNCE_MS = 400

/**
 * A text field whose value is sent `delay` ms after the user stops typing, and which follows
 * the value it is given when that changes from outside (back/forward, reset).
 */
export default function useDebouncedField(
    value: string,
    commit: (value: string) => void,
    // What the value becomes once it has been through the URL (so typing "ring " isn't undone)
    normalize: (value: string) => string = (v) => v.trim(),
    delay: number = DEFAULT_DEBOUNCE_MS
) {
    const [text, setText] = useState(value)
    const { debouncedValue, refreshDebounce } = useDebounce(text, delay)
    const lastCommitted = useRef(value)
    const commitRef = useRef(commit)
    commitRef.current = commit
    const normalizeRef = useRef(normalize)
    normalizeRef.current = normalize

    useEffect(() => {
        const normalized = normalizeRef.current(debouncedValue)
        if (normalized !== lastCommitted.current) {
            lastCommitted.current = normalized
            commitRef.current(debouncedValue)
        }
    }, [debouncedValue])

    useEffect(() => {
        if (value !== lastCommitted.current) {
            lastCommitted.current = value
            setText(value)
        }
    }, [value])

    return { text, setText, flush: refreshDebounce }
}
