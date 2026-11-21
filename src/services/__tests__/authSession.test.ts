import {
    AuthEvent,
    AuthSessionDeps,
    REFRESH_MARGIN_MS,
    RETRY_DELAYS_MS,
    createAuthSession,
} from "../authSession"

jest.mock("../authService", () => ({ postRefresh: jest.fn() }))
// The real axios resolves to its ESM build under this Jest setup; authSession only needs
// isAxiosError, so errors below are plain objects shaped like AxiosError.
jest.mock("axios", () => ({
    __esModule: true,
    default: {
        isAxiosError: (error: unknown) =>
            !!(error as { isAxiosError?: boolean } | null)?.isAxiosError,
    },
}))

// ---------------------------------------------------------------- test doubles

/** Manually driven timers shared by every simulated tab. */
class FakeClock {
    now = 1_000_000
    private nextId = 1
    private timers = new Map<number, { at: number; fn: () => void }>()

    setTimeout = (fn: () => void, ms: number) => {
        const id = this.nextId++
        this.timers.set(id, { at: this.now + ms, fn })
        return id
    }

    clearTimeout = (id: number) => {
        this.timers.delete(id)
    }

    pendingDelays() {
        return Array.from(this.timers.values()).map((t) => t.at - this.now)
    }

    async advance(ms: number) {
        const target = this.now + ms
        for (;;) {
            const due = Array.from(this.timers.entries())
                .filter(([, t]) => t.at <= target)
                .sort((a, b) => a[1].at - b[1].at)[0]
            if (!due) break
            this.timers.delete(due[0])
            this.now = due[1].at
            due[1].fn()
            await flush()
        }
        this.now = target
        await flush()
    }
}

/** A Web Locks stand-in: one holder at a time, FIFO. */
class FakeLocks {
    private tail: Promise<unknown> = Promise.resolve()
    request<T>(_name: string, callback: () => Promise<T>): Promise<T> {
        const run = this.tail.then(callback)
        this.tail = run.catch(() => undefined)
        return run
    }
}

/** In-memory BroadcastChannel: messages reach every other channel on the bus. */
const createBus = () => {
    const channels = new Set<{ onmessage: ((e: MessageEvent) => void) | null }>()
    return () => {
        const channel = {
            onmessage: null as ((e: MessageEvent) => void) | null,
            postMessage(message: unknown) {
                const data = JSON.parse(JSON.stringify(message))
                channels.forEach((other) => {
                    if (other === channel) return
                    queueMicrotask(() =>
                        other.onmessage?.({ data } as MessageEvent)
                    )
                })
            },
            close() {
                channels.delete(channel)
            },
        }
        channels.add(channel)
        return channel
    }
}

const flush = async () => {
    for (let i = 0; i < 10; i++) await Promise.resolve()
}

const deferred = <T>() => {
    let resolve!: (value: T) => void
    let reject!: (reason: unknown) => void
    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })
    return { promise, resolve, reject }
}

const httpError = (
    status: number,
    data: unknown = {},
    headers: Record<string, string> = {}
) =>
    Object.assign(new Error(`HTTP ${status}`), {
        isAxiosError: true,
        response: { status, data, headers },
    })

const networkError = () =>
    Object.assign(new Error("Network Error"), { isAxiosError: true })

const tokenResponse = (accessToken: string, expiresIn = 900) => ({
    data: {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: expiresIn,
        refresh_token: "",
        refresh_expires_in: 0,
    },
})

const loginData = (accessToken: string, expiresIn = 900) =>
    tokenResponse(accessToken, expiresIn).data

// ---------------------------------------------------------------- harness

const setup = (overrides: Partial<AuthSessionDeps> = {}) => {
    const clock = new FakeClock()
    const locks = new FakeLocks()
    const bus = createBus()
    const postRefresh = jest.fn()
    const makeTab = (extra: Partial<AuthSessionDeps> = {}) => {
        const events: AuthEvent[] = []
        const session = createAuthSession({
            postRefresh,
            now: () => clock.now,
            random: () => 0,
            locks,
            createChannel: bus,
            setTimeout: clock.setTimeout,
            clearTimeout: clock.clearTimeout,
            eventTarget: null,
            isDocumentVisible: () => true,
            ...overrides,
            ...extra,
        })
        session.subscribe((_snapshot, event) => events.push(event))
        return { session, events }
    }
    return { clock, postRefresh, makeTab }
}

// ---------------------------------------------------------------- tests

describe("authSession", () => {
    it("refreshes once for several tabs and shares the new token", async () => {
        const { postRefresh, makeTab } = setup()
        const tabA = makeTab()
        const tabB = makeTab()
        // Both tabs hold a token that is inside the refresh margin.
        tabA.session.startSession(loginData("T0", 30))
        await flush()
        expect(tabB.session.getState().accessToken).toBe("T0")

        const response = deferred<unknown>()
        postRefresh.mockReturnValueOnce(response.promise)
        const a = tabA.session.getValidAccessToken()
        const b = tabB.session.getValidAccessToken()
        response.resolve(tokenResponse("T1"))

        await expect(a).resolves.toBe("T1")
        await expect(b).resolves.toBe("T1")
        expect(postRefresh).toHaveBeenCalledTimes(1)
    })

    it("ends the session on a 401 and reports the server's reason", async () => {
        const { postRefresh, makeTab } = setup()
        const tab = makeTab()
        tab.session.startSession(loginData("T0", 30))
        postRefresh.mockRejectedValueOnce(
            httpError(401, { code: "session_expired" })
        )

        await expect(tab.session.getValidAccessToken()).resolves.toBeNull()

        expect(tab.session.getState().accessToken).toBeNull()
        expect(tab.events.at(-1)).toEqual({
            type: "session-ended",
            reason: "invalidated",
            code: "session_expired",
            origin: "local",
        })
    })

    it.each([
        ["a network error", networkError()],
        ["a 500", httpError(500)],
        ["a 429", httpError(429)],
        ["a 403", httpError(403)],
    ])("keeps the session through %s and retries with backoff", async (_label, error) => {
        const { clock, postRefresh, makeTab } = setup()
        const tab = makeTab()
        tab.session.startSession(loginData("T0", 900))
        postRefresh
            .mockRejectedValueOnce(error)
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce(tokenResponse("T1"))

        // Keep-alive fires one margin before expiry.
        await clock.advance(900_000 - REFRESH_MARGIN_MS)
        expect(postRefresh).toHaveBeenCalledTimes(1)
        expect(tab.session.getState().accessToken).toBe("T0")

        await clock.advance(RETRY_DELAYS_MS[0])
        expect(postRefresh).toHaveBeenCalledTimes(2)
        await clock.advance(RETRY_DELAYS_MS[1])
        expect(postRefresh).toHaveBeenCalledTimes(3)

        expect(tab.session.getState().accessToken).toBe("T1")
        expect(
            tab.events.some((e) => e.type === "session-ended")
        ).toBe(false)
    })

    it("honours Retry-After when it is longer than the backoff", async () => {
        const { clock, postRefresh, makeTab } = setup()
        const tab = makeTab()
        tab.session.startSession(loginData("T0", 900))
        postRefresh.mockRejectedValueOnce(
            httpError(429, {}, { "retry-after": "45" })
        )

        await clock.advance(900_000 - REFRESH_MARGIN_MS)

        expect(clock.pendingDelays()).toEqual([45_000])
    })

    it("keeps retrying a failed restore and announces the session when it succeeds", async () => {
        const { clock, postRefresh, makeTab } = setup()
        const tab = makeTab()
        postRefresh
            .mockRejectedValueOnce(networkError())
            .mockResolvedValueOnce(tokenResponse("T1"))

        await expect(tab.session.restore()).resolves.toBe("transient")
        expect(tab.session.getState().accessToken).toBeNull()

        await clock.advance(RETRY_DELAYS_MS[0])

        expect(tab.session.getState().accessToken).toBe("T1")
        expect(tab.events).toContainEqual({
            type: "session-started",
            origin: "restored",
        })
    })

    it("drops a stale refresh result when the user logs in meanwhile", async () => {
        const { postRefresh, makeTab } = setup()
        const tab = makeTab()
        const response = deferred<unknown>()
        postRefresh.mockReturnValueOnce(response.promise)

        const restoring = tab.session.restore()
        await flush() // let the refresh request actually go out
        expect(postRefresh).toHaveBeenCalledTimes(1)
        tab.session.startSession(loginData("FRESH-LOGIN"))
        // The old cookie's session was dead: must not log out the new one.
        response.reject(httpError(401, { code: "session_revoked" }))

        await expect(restoring).resolves.toBe("superseded")
        expect(tab.session.getState().accessToken).toBe("FRESH-LOGIN")
        expect(tab.events.some((e) => e.type === "session-ended")).toBe(false)
    })

    it("retries an authed request once after a 401", async () => {
        const { postRefresh, makeTab } = setup()
        const tab = makeTab()
        tab.session.startSession(loginData("T0"))
        postRefresh.mockResolvedValueOnce(tokenResponse("T1"))
        const request = jest
            .fn()
            .mockRejectedValueOnce(httpError(401))
            .mockResolvedValueOnce("ok")

        await expect(tab.session.authedRequest(request)).resolves.toBe("ok")

        expect(request.mock.calls).toEqual([["T0"], ["T1"]])
    })

    it("passes a second 401 through without logging out", async () => {
        const { postRefresh, makeTab } = setup()
        const tab = makeTab()
        tab.session.startSession(loginData("T0"))
        postRefresh.mockResolvedValueOnce(tokenResponse("T1"))
        const request = jest.fn().mockRejectedValue(httpError(401))

        await expect(tab.session.authedRequest(request)).rejects.toMatchObject({
            response: { status: 401 },
        })
        expect(tab.session.getState().accessToken).toBe("T1")
    })

    it("rejects authed requests when logged out", async () => {
        const { makeTab } = setup()
        const tab = makeTab()

        await expect(
            tab.session.authedRequest(async () => "never")
        ).rejects.toMatchObject({ name: "NotLoggedInError" })
    })

    it("verifies another tab's invalidation before giving up its own session", async () => {
        const { postRefresh, makeTab } = setup()
        const stale = makeTab()
        const fresh = makeTab()
        fresh.session.startSession(loginData("NEW"))
        await flush()
        // The stale tab's refresh was refused (it sent a cookie that `fresh` had
        // already replaced), so it announces an invalidation. `fresh` checks for itself
        // and its own refresh succeeds.
        postRefresh.mockResolvedValueOnce(tokenResponse("NEWER"))
        stale.session.endSession("invalidated", "session_revoked")
        await flush()

        expect(postRefresh).toHaveBeenCalledTimes(1)
        expect(fresh.session.getState().accessToken).toBe("NEWER")
        expect(fresh.events.some((e) => e.type === "session-ended")).toBe(false)
    })

    it("follows another tab's invalidation once its own check is refused too", async () => {
        const { postRefresh, makeTab } = setup()
        const tabA = makeTab()
        const tabB = makeTab()
        tabA.session.startSession(loginData("T0"))
        await flush()
        postRefresh.mockRejectedValueOnce(
            httpError(401, { code: "session_revoked" })
        )

        tabA.session.endSession("invalidated", "session_revoked")
        await flush()

        expect(tabB.session.getState().accessToken).toBeNull()
        expect(tabB.events.at(-1)).toMatchObject({
            type: "session-ended",
            reason: "invalidated",
            code: "session_revoked",
        })
    })

    it("follows an explicit logout in another tab immediately", async () => {
        const { postRefresh, makeTab } = setup()
        const tabA = makeTab()
        const tabB = makeTab()
        tabA.session.startSession(loginData("T0"))
        await flush()

        tabA.session.endSession("user")
        await flush()

        expect(tabB.session.getState().accessToken).toBeNull()
        expect(tabB.events.at(-1)).toEqual({
            type: "session-ended",
            reason: "user",
            code: undefined,
            origin: "remote",
        })
        expect(postRefresh).not.toHaveBeenCalled()
    })

    it("adopts a login from another tab", async () => {
        const { makeTab } = setup()
        const tabA = makeTab()
        const tabB = makeTab()

        tabA.session.startSession(loginData("T0"))
        await flush()

        expect(tabB.session.getState().accessToken).toBe("T0")
        expect(tabB.events).toContainEqual({
            type: "session-started",
            origin: "remote",
        })
    })

    it("works without Web Locks or BroadcastChannel", async () => {
        const { postRefresh, makeTab } = setup({
            locks: null,
            createChannel: null,
        })
        const tab = makeTab()
        postRefresh.mockResolvedValueOnce(tokenResponse("T1"))

        await expect(tab.session.restore()).resolves.toBe("ok")
        expect(tab.session.getState().accessToken).toBe("T1")
    })

    it("stops scheduling after dispose", async () => {
        const { clock, postRefresh, makeTab } = setup()
        const tab = makeTab()
        tab.session.startSession(loginData("T0"))

        tab.session.dispose()
        await clock.advance(900_000)

        expect(postRefresh).not.toHaveBeenCalled()
    })
})
