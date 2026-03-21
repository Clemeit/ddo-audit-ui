import {
    getAccessTokens,
    setAccessTokens,
    addAccessToken,
    removeAccessToken,
    getBooleanFlag,
    setBooleanFlag,
    removeBooleanFlag,
    clearBooleanFlags,
    getFriends,
    setFriends,
    addFriend,
    removeFriend,
    getFriendIds,
    getIgnores,
    setIgnores,
    getIgnoreIds,
    getTimezone,
    setTimezone,
    subscribeToLocalStorageWrites,
    isPersistentKey,
    getPersistentDataByKeys,
    setPersistentData,
} from "../localStorage"

// Mock logUtils to prevent actual API calls
jest.mock("../logUtils", () => ({
    __esModule: true,
    default: jest.fn(),
}))

describe("localStorage", () => {
    beforeEach(() => {
        localStorage.clear()
        jest.restoreAllMocks()
    })

    describe("isPersistentKey", () => {
        it("returns true for known persistent keys", () => {
            expect(isPersistentKey("access-tokens")).toBe(true)
            expect(isPersistentKey("friends")).toBe(true)
            expect(isPersistentKey("lfm-settings")).toBe(true)
        })

        it("returns false for unknown keys", () => {
            expect(isPersistentKey("unknown-key")).toBe(false)
        })
    })

    describe("access tokens", () => {
        it("returns empty array when no tokens stored", () => {
            expect(getAccessTokens()).toEqual([])
        })

        it("sets and gets access tokens", () => {
            const tokens = [{ character_id: 1, access_token: "abc" }] as any
            setAccessTokens(tokens)
            expect(getAccessTokens()).toEqual(tokens)
        })

        it("adds a token without duplicates", () => {
            const token = { character_id: 1, access_token: "abc" } as any
            addAccessToken(token)
            addAccessToken(token) // should not duplicate
            expect(getAccessTokens()).toHaveLength(1)
        })

        it("removes a token", () => {
            const token = { character_id: 1, access_token: "abc" } as any
            addAccessToken(token)
            removeAccessToken(token)
            expect(getAccessTokens()).toEqual([])
        })
    })

    describe("boolean flags", () => {
        it("returns null for unset flag", () => {
            expect(getBooleanFlag("test-flag")).toBeNull()
        })

        it("sets and gets a boolean flag", () => {
            setBooleanFlag("test-flag", true)
            expect(getBooleanFlag("test-flag")).toBe(true)
        })

        it("removes a flag", () => {
            setBooleanFlag("test-flag", true)
            removeBooleanFlag("test-flag")
            expect(getBooleanFlag("test-flag")).toBeNull()
        })

        it("clears all boolean flags", () => {
            setBooleanFlag("flag-a", true)
            setBooleanFlag("flag-b", false)
            clearBooleanFlags()
            expect(getBooleanFlag("flag-a")).toBeNull()
            expect(getBooleanFlag("flag-b")).toBeNull()
        })
    })

    describe("friends", () => {
        it("returns empty array when no friends stored", () => {
            expect(getFriends()).toEqual([])
        })

        it("sets and gets friends", () => {
            const friends = [{ id: 1, name: "Player1" }] as any
            setFriends(friends)
            expect(getFriends()).toEqual(friends)
        })

        it("adds a friend without duplicates", () => {
            addFriend({ id: 1, name: "Player1" } as any)
            addFriend({ id: 1, name: "Player1" } as any)
            expect(getFriends()).toHaveLength(1)
        })

        it("removes a friend", () => {
            addFriend({ id: 1, name: "Player1" } as any)
            removeFriend({ id: 1, name: "Player1" } as any)
            expect(getFriends()).toEqual([])
        })

        it("getFriendIds returns array of numeric ids", () => {
            setFriends([{ id: 1 }, { id: 2 }] as any)
            expect(getFriendIds()).toEqual([1, 2])
        })
    })

    describe("ignores", () => {
        it("returns empty array when no ignores stored", () => {
            expect(getIgnores()).toEqual([])
        })

        it("sets and gets ignores", () => {
            const ignores = [{ id: 1, name: "Player1" }] as any
            setIgnores(ignores)
            expect(getIgnores()).toEqual(ignores)
        })

        it("getIgnoreIds returns array of numeric ids", () => {
            setIgnores([{ id: 1 }, { id: 2 }] as any)
            expect(getIgnoreIds()).toEqual([1, 2])
        })
    })

    describe("timezone", () => {
        it("returns null when no timezone stored", () => {
            expect(getTimezone()).toBeNull()
        })

        it("sets and gets timezone", () => {
            setTimezone("America/New_York")
            expect(getTimezone()).toBe("America/New_York")
        })
    })

    describe("subscribeToLocalStorageWrites", () => {
        it("notifies listeners on writes", () => {
            const listener = jest.fn()
            const unsubscribe = subscribeToLocalStorageWrites(listener)
            setTimezone("UTC")
            expect(listener).toHaveBeenCalled()
            expect(listener.mock.calls[0][0].key).toBe("timezone")
            unsubscribe()
        })

        it("unsubscribe stops notifications", () => {
            const listener = jest.fn()
            const unsubscribe = subscribeToLocalStorageWrites(listener)
            unsubscribe()
            setTimezone("UTC")
            expect(listener).not.toHaveBeenCalled()
        })
    })

    describe("getPersistentDataByKeys / setPersistentData", () => {
        it("returns default values for empty storage", () => {
            const result = getPersistentDataByKeys(["friends", "boolean-flags"])
            expect(result.friends).toEqual([])
            expect(result["boolean-flags"]).toEqual({})
        })

        it("setPersistentData writes and getPersistentDataByKeys reads", () => {
            setPersistentData({ "boolean-flags": { testFlag: true } })
            const result = getPersistentDataByKeys(["boolean-flags"])
            expect(result["boolean-flags"]).toEqual({ testFlag: true })
        })

        it("coerces invalid persistent values", () => {
            const consoleSpy = jest.spyOn(console, "warn").mockImplementation()
            setPersistentData({ "boolean-flags": "not-an-object" })
            const result = getPersistentDataByKeys(["boolean-flags"])
            expect(result["boolean-flags"]).toEqual({})
            consoleSpy.mockRestore()
        })
    })
})
