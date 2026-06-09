/**
 * Pure (no-React) stream state machine for SSE-based character and LFM streams.
 *
 * Wire-format envelopes mirror the server (ddo-audit-service/sanic/services/sse.py):
 *   snapshot  → { type, seq, epoch, server, sent_at, data }
 *   delta     → { type, seq, epoch, server, sent_at, updates, removals }
 *
 * All functions are pure: they take the current state and an envelope, and
 * return a new state along with an apply-result code. No side-effects.
 */

// ── Wire-format envelope types ────────────────────────────────────────────────

export interface SnapshotEnvelope<T> {
    type: "snapshot"
    seq: number
    epoch: string
    server: string
    sent_at: string
    data: Record<string, T>
}

export interface DeltaEnvelope<T> {
    type: "delta"
    seq: number
    epoch: string
    server: string
    sent_at: string
    updates: Array<T & { id: string | number }>
    removals: Array<string | number>
}

// ── Stream state ──────────────────────────────────────────────────────────────

export type StreamStatus = "connecting" | "connected" | "closed" | "error"

export interface StreamState<T> {
    data: Map<string, T>
    /** Monotonic seq of the last successfully applied event. -1 = none yet. */
    lastSeq: number
    /** Epoch UUID of the current server process. null = none received yet. */
    epoch: string | null
    /** True once the first snapshot has been applied. */
    bootstrapped: boolean
    status: StreamStatus
}

// ── Delta apply-result codes ──────────────────────────────────────────────────

export type DeltaApplyResult =
    | "applied"
    | "noop" // zero updates + zero removals
    | "stale" // seq <= lastSeq (duplicate / out-of-order)
    | "not_bootstrapped" // delta arrived before first snapshot
    | "gap" // seq > lastSeq + 1 (missed events — needs resync)
    | "epoch_changed" // server restarted mid-stream — needs resync

export interface DeltaOutcome<T> {
    nextState: StreamState<T>
    result: DeltaApplyResult
}

// ── State factories ───────────────────────────────────────────────────────────

export function initialState<T>(): StreamState<T> {
    return {
        data: new Map(),
        lastSeq: -1,
        epoch: null,
        bootstrapped: false,
        status: "connecting",
    }
}

// ── Pure state transitions ────────────────────────────────────────────────────

/** Reset tracking on each (re)connect before the first snapshot arrives. */
export function applyConnecting<T>(state: StreamState<T>): StreamState<T> {
    return {
        ...state,
        status: "connecting",
        bootstrapped: false,
        lastSeq: -1,
        epoch: null,
        data: new Map(),
    }
}

/**
 * Apply a snapshot envelope.
 * Always succeeds — snapshots are unconditional resets that clear stale state.
 */
export function applySnapshot<T>(
    _state: StreamState<T>,
    envelope: SnapshotEnvelope<T>
): StreamState<T> {
    const data = new Map<string, T>(Object.entries(envelope.data))
    return {
        data,
        lastSeq: envelope.seq,
        epoch: envelope.epoch,
        bootstrapped: true,
        status: "connected",
    }
}

/**
 * Apply a delta envelope.
 * Returns a result code so the caller can handle side-effects (reconnect, metrics, etc.)
 * without needing any logic in this module.
 */
export function applyDelta<T>(
    state: StreamState<T>,
    envelope: DeltaEnvelope<T>
): DeltaOutcome<T> {
    const { seq, epoch, updates = [], removals = [] } = envelope

    if (!state.bootstrapped) {
        return { nextState: state, result: "not_bootstrapped" }
    }

    if (state.epoch !== null && epoch !== state.epoch) {
        return { nextState: state, result: "epoch_changed" }
    }

    if (seq <= state.lastSeq) {
        return { nextState: state, result: "stale" }
    }

    if (seq > state.lastSeq + 1) {
        return { nextState: state, result: "gap" }
    }

    if (updates.length === 0 && removals.length === 0) {
        // Advance seq but skip data mutation and downstream render
        return {
            nextState: { ...state, lastSeq: seq },
            result: "noop",
        }
    }

    // Idempotent upsert / delete-if-present
    const data = new Map(state.data)
    for (const entry of updates) {
        const id = String(entry.id ?? "")
        data.set(id, { ...data.get(id), ...entry })
    }
    for (const id of removals) {
        data.delete(String(id))
    }

    return {
        nextState: { ...state, data, lastSeq: seq, epoch },
        result: "applied",
    }
}

/** Intentional server-side close (24h lifetime). UI shows "refresh to reconnect". */
export function applyClose<T>(state: StreamState<T>): StreamState<T> {
    return { ...state, status: "closed", data: new Map() }
}

/** Browser gave up reconnecting (e.g. HTTP 400). */
export function applyError<T>(state: StreamState<T>): StreamState<T> {
    return { ...state, status: "error" }
}
