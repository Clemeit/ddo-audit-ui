import {
    useCallback,
    useEffect,
    useRef,
    useState,
    startTransition,
} from "react"
import { API_URL } from "../constants/client.ts"
import { LoadingState } from "../models/Api.ts"
import {
    StreamStatus,
    StreamState,
    SnapshotEnvelope,
    DeltaEnvelope,
    initialState,
    applyConnecting,
    applySnapshot,
    applyDelta,
    applyClose,
    applyError,
} from "./serverStream/reducer.ts"
import { StreamMetrics } from "./serverStream/metrics.ts"
// import { checkDrift } from "./serverStream/driftDetector.ts"

export type { StreamStatus }

// ── Constants ─────────────────────────────────────────────────────────────────

const RECONNECT_BASE_MS = 1_000
const RECONNECT_MAX_MS = 30_000
// const DRIFT_CHECK_INTERVAL_MS = 60_000

// ── Types ─────────────────────────────────────────────────────────────────────

interface UseServerStreamOptions {
    enabled?: boolean
}

export interface UseServerStreamReturn<T> {
    data: Map<string, T> | null
    status: StreamStatus
    loadingState: LoadingState
    // metrics: StreamMetrics
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function streamStatusToLoadingState(status: StreamStatus): LoadingState {
    switch (status) {
        case "connecting":
            return LoadingState.Loading
        case "connected":
            return LoadingState.Loaded
        case "closed":
            return LoadingState.Haulted
        case "error":
            return LoadingState.Error
    }
}

function jitteredBackoff(attempt: number): number {
    const base = Math.min(
        RECONNECT_BASE_MS * Math.pow(2, attempt),
        RECONNECT_MAX_MS
    )
    return base + Math.random() * 1_000
}

// ── Hook ──────────────────────────────────────────────────────────────────────

function useServerStream<T>(
    serverName: string,
    type: "characters" | "lfms",
    options: UseServerStreamOptions = {}
): UseServerStreamReturn<T> {
    const { enabled = true } = options

    // React-visible state (triggers renders)
    const [data, setData] = useState<Map<string, T> | null>(null)
    const [status, setStatus] = useState<StreamStatus>("connecting")

    // Synchronously readable state for use inside event-handler closures.
    // Using a ref avoids stale-closure issues without requiring re-renders.
    const streamStateRef = useRef<StreamState<T>>(initialState<T>())

    // Metrics accumulated in a ref; copied to React state on each bump.
    // const metricsRef = useRef<StreamMetrics>(emptyMetrics())
    // const [metrics, setMetrics] = useState<StreamMetrics>(emptyMetrics())

    // Holds the live EventSource so dev handles can close it from outside the effect.
    const eventSourceRef = useRef<EventSource | null>(null)

    // Reconnect control: increment connectionKey to tear down and recreate the EventSource.
    const reconnectAttemptRef = useRef(0)
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [connectionKey, setConnectionKey] = useState(0)

    // Stable dev-panel key
    // const devKey = `${type}/${serverName}`

    // ── Metric helpers ────────────────────────────────────────────────────────

    const bumpMetric = useCallback((field: keyof StreamMetrics) => {
        // Metric logging temporarily disabled.
        // metricsRef.current = {
        //     ...metricsRef.current,
        //     [field]: metricsRef.current[field] + 1,
        // }
        // publishToDevPanel(devKey, metricsRef.current)
        // setMetrics({ ...metricsRef.current })
        void field
    }, [])

    // ── Reconnect scheduling ──────────────────────────────────────────────────

    const scheduleReconnect = useCallback(() => {
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
        const attempt = reconnectAttemptRef.current++
        const delay = jitteredBackoff(attempt)
        reconnectTimerRef.current = setTimeout(() => {
            setConnectionKey((k) => k + 1)
        }, delay)
    }, [])

    // ── Main EventSource effect ───────────────────────────────────────────────

    useEffect(() => {
        if (!enabled) return

        // Reset tracking state before opening a new connection.
        streamStateRef.current = applyConnecting(streamStateRef.current)
        startTransition(() => {
            setData(null)
            setStatus("connecting")
        })

        const url = `${API_URL}/v2/${type}/stream/${serverName}`
        const eventSource = new EventSource(url)
        eventSourceRef.current = eventSource

        // ── snapshot ──────────────────────────────────────────────────────────
        eventSource.addEventListener("snapshot", (e: MessageEvent) => {
            try {
                const envelope = JSON.parse(e.data) as SnapshotEnvelope<T>
                if (typeof envelope?.seq !== "number" || !envelope.epoch) return

                const nextState = applySnapshot(
                    streamStateRef.current,
                    envelope
                )
                streamStateRef.current = nextState

                // Successful snapshot resets the reconnect backoff counter.
                reconnectAttemptRef.current = 0

                // bumpMetric("snapshot_count")
                startTransition(() => {
                    setData(new Map(nextState.data))
                    setStatus("connected")
                })
            } catch {
                // Malformed snapshot — ignore.
            }
        })

        // ── delta ─────────────────────────────────────────────────────────────
        eventSource.addEventListener("delta", (e: MessageEvent) => {
            try {
                const envelope = JSON.parse(e.data) as DeltaEnvelope<T>
                if (typeof envelope?.seq !== "number") return

                const { nextState, result } = applyDelta(
                    streamStateRef.current,
                    envelope
                )

                switch (result) {
                    case "applied":
                        streamStateRef.current = nextState
                        // bumpMetric("applied_delta_count")
                        startTransition(() => setData(new Map(nextState.data)))
                        break

                    case "noop":
                        // Advance seq, but skip data write and render.
                        streamStateRef.current = nextState
                        break

                    case "stale":
                        // bumpMetric("duplicate_or_stale_event_count")
                        break

                    case "not_bootstrapped":
                        // Delta arrived before the first snapshot; discard and wait.
                        break

                    case "gap":
                    case "epoch_changed":
                        // Sequence gap or server restart: close and resync from snapshot.
                        // bumpMetric("gap_resync_count")
                        // bumpMetric("reconnect_count")
                        eventSource.close()
                        scheduleReconnect()
                        break
                }
            } catch {
                // Malformed delta — ignore.
            }
        })

        // ── close (intentional 24h server-side shutdown) ──────────────────────
        eventSource.addEventListener("close", () => {
            streamStateRef.current = applyClose(streamStateRef.current)
            // Non-deferred: "closed" must be visible immediately so the UI
            // shows the "refresh to reconnect" message without delay.
            setData(null)
            setStatus("closed")
        })

        // ── onerror ───────────────────────────────────────────────────────────
        eventSource.onerror = () => {
            if (eventSource.readyState === EventSource.CLOSED) {
                // Browser gave up (e.g., HTTP 400/403 from server).
                streamStateRef.current = applyError(streamStateRef.current)
                setStatus("error")
            }
            // readyState === CONNECTING: browser is auto-reconnecting with its
            // own backoff. The server will send a fresh snapshot on reconnect,
            // which resets seq/epoch tracking — no manual intervention needed.
        }

        return () => {
            eventSource.close()
            eventSourceRef.current = null
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current)
                reconnectTimerRef.current = null
            }
        }
    }, [enabled, serverName, type, connectionKey])

    // ── Dev drift detection (stripped in production builds) ───────────────────

    // useEffect(() => {
    //     if (process.env.NODE_ENV === "production") return
    //     if (!enabled) return

    //     const handle = setInterval(() => {
    //         const current = streamStateRef.current
    //         if (!current.bootstrapped || current.data.size === 0) return
    //         checkDrift(
    //             serverName,
    //             type,
    //             current.data as Map<string, Record<string, unknown>>,
    //             API_URL
    //         )
    //     }, DRIFT_CHECK_INTERVAL_MS)

    //     return () => clearInterval(handle)
    // }, [enabled, serverName, type])

    // ── Dev console handles ───────────────────────────────────────────────────
    // window.__SSE_CLOSE__("characters/cormyr") — simulate server close event
    // window.__SSE_GAP__("characters/cormyr")   — simulate a seq gap → resync

    // useEffect(() => {
    //     if (process.env.NODE_ENV === "production") return
    //     if (!enabled) return

    //     const key = devKey

    //     const prevClose = window.__SSE_CLOSE__
    //     window.__SSE_CLOSE__ = (streamKey: string) => {
    //         if (streamKey === key) {
    //             // Close the live EventSource so no more events arrive,
    //             // then update state to reflect the close.
    //             eventSourceRef.current?.close()
    //             eventSourceRef.current = null
    //             streamStateRef.current = applyClose(streamStateRef.current)
    //             setData(null)
    //             setStatus("closed")
    //             console.info(`[SSE dev] close injected for ${key}`)
    //         } else {
    //             prevClose?.(streamKey)
    //         }
    //     }

    //     const prevGap = window.__SSE_GAP__
    //     window.__SSE_GAP__ = (streamKey: string) => {
    //         if (streamKey === key) {
    //             // Roll lastSeq *back* by 2 so the next real delta (seq = original+1)
    //             // arrives as original+1 > (original-2) but ≠ (original-2)+1,
    //             // triggering the gap path in applyDelta rather than looking stale.
    //             streamStateRef.current = {
    //                 ...streamStateRef.current,
    //                 lastSeq: Math.max(-1, streamStateRef.current.lastSeq - 2),
    //             }
    //             console.info(
    //                 `[SSE dev] seq gap injected for ${key} — next delta will trigger resync`
    //             )
    //         } else {
    //             prevGap?.(streamKey)
    //         }
    //     }

    //     const prevOpen = window.__SSE_OPEN__
    //     window.__SSE_OPEN__ = (streamKey: string) => {
    //         if (streamKey === key) {
    //             reconnectAttemptRef.current = 0
    //             setConnectionKey((k) => k + 1)
    //             console.info(`[SSE dev] reconnect triggered for ${key}`)
    //         } else {
    //             prevOpen?.(streamKey)
    //         }
    //     }

    //     return () => {
    //         window.__SSE_CLOSE__ = prevClose
    //         window.__SSE_GAP__ = prevGap
    //         window.__SSE_OPEN__ = prevOpen
    //     }
    // }, [enabled, devKey])

    return {
        data,
        status,
        loadingState: streamStatusToLoadingState(status),
        // metrics,
    }
}

export default useServerStream
