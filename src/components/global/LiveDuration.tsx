import React, { useMemo } from "react"
import useNow from "../../hooks/useNow"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils"

interface Props {
    start: Date | number | string
    /**
     * If provided, the duration is end - start. If omitted, the duration is now - start and updates every second.
     */
    end?: Date | number | string
    /**
     * Update frequency in ms for the live clock. Defaults to 1000ms.
     */
    intervalMs?: number
    /**
     * Whether to suppress updates while the document is hidden. Defaults to true.
     */
    onlyWhenVisible?: boolean
    /**
     * Whether to include seconds and abbreviated units in the pretty string (keeps parity with existing util usage).
     */
    compact?: boolean
}

const toMs = (d: Date | number | string) =>
    d instanceof Date ? d.getTime() : new Date(d).getTime()

const LiveDuration: React.FC<Props> = ({
    start,
    end,
    intervalMs = 1000,
    onlyWhenVisible = true,
    compact = true,
}) => {
    const now = useNow(intervalMs, onlyWhenVisible)

    const durationMs = useMemo(() => {
        const startMs = toMs(start)
        const endMs = end != null ? toMs(end) : now
        return Math.max(0, endMs - startMs)
    }, [start, end, now])

    return (
        <>
            {convertMillisecondsToPrettyString({
                millis: durationMs,
                commaSeparated: true,
                useFullWords: !compact,
                onlyIncludeLargest: compact,
                largestCount: compact ? 2 : undefined,
                nonBreakingSpace: true,
            })}
        </>
    )
}

export default LiveDuration
