import React from "react"
import { act, render, waitFor } from "@testing-library/react"
import { UserProvider, useUserContext } from "../UserContext"
import { NotificationProvider } from "../NotificationContext"
import { addFriend, getFriends, setFriends } from "../../utils/localStorage"
import { hydrateCharacterIds } from "../../utils/settingsHydration"
import { postLogin } from "../../services/authService"
import {
    getPersistentSettings,
    patchPersistentSettings,
} from "../../services/userService"
import { Character } from "../../models/Character"

// The real axios resolves to its ESM build under this Jest setup; UserContext only
// needs isAxiosError.
jest.mock("axios", () => ({
    __esModule: true,
    default: {
        isAxiosError: (error: unknown) =>
            !!(error as { isAxiosError?: boolean } | null)?.isAxiosError,
    },
}))
jest.mock("../../utils/logUtils", () => jest.fn())
jest.mock("../../utils/settingsHydration", () => ({
    hydrateCharacterIds: jest.fn(),
}))
jest.mock("../../services/authService", () => ({
    postLogin: jest.fn(),
    postLogout: jest.fn(),
    postRegister: jest.fn(),
    deleteAccount: jest.fn(),
}))
jest.mock("../../services/userService", () => ({
    getPersistentSettings: jest.fn(),
    patchPersistentSettings: jest.fn(),
    putPersistentSettings: jest.fn(),
    putUpdatePassword: jest.fn(),
    deletePersistentSettings: jest.fn(),
}))
// A minimal in-memory session: login() starts it, authedRequest hands over the token.
jest.mock("../../services/authSession", () => {
    const actual = jest.requireActual("../../services/authSession")
    return {
        ...actual,
        createAuthSession: () => {
            let token: string | null = null
            const listeners = new Set<Function>()
            const snapshot = () => ({ accessToken: token, expiresAt: null })
            const emit = (event: unknown) =>
                listeners.forEach((listener) => listener(snapshot(), event))
            return {
                getState: snapshot,
                subscribe(listener: Function) {
                    listeners.add(listener)
                    return () => listeners.delete(listener)
                },
                startSession() {
                    token = "test-token"
                    emit({ type: "session-started", origin: "local" })
                },
                endSession(reason: string) {
                    token = null
                    emit({ type: "session-ended", reason, origin: "local" })
                },
                restore: async () => "invalid",
                getValidAccessToken: async () => token,
                authedRequest: (fn: Function) =>
                    token
                        ? fn(token)
                        : Promise.reject(new actual.NotLoggedInError()),
                dispose() {},
            }
        },
    }
})

const mockHydrate = hydrateCharacterIds as jest.MockedFunction<
    typeof hydrateCharacterIds
>
const mockGetSettings = getPersistentSettings as jest.Mock
const mockPatchSettings = patchPersistentSettings as jest.Mock
const mockPostLogin = postLogin as jest.Mock

const char = (id: number): Character => ({ id, name: `Char${id}` }) as Character
const friendIds = () => getFriends().map((c) => c.id)

type Api = ReturnType<typeof useUserContext>

const renderProvider = () => {
    const api: { current: Api | null } = { current: null }
    const Probe = () => {
        api.current = useUserContext()
        return null
    }
    render(
        <NotificationProvider>
            <UserProvider>
                <Probe />
            </UserProvider>
        </NotificationProvider>
    )
    return api as { current: Api }
}

const login = (api: { current: Api }) =>
    api.current.login({ username: "u", password: "p" } as any)

/** The `friends` value from any PATCH sent so far, or undefined. */
const patchedFriends = () =>
    mockPatchSettings.mock.calls
        .map(([, payload]) => payload?.settings?.friends)
        .filter((friends) => friends !== undefined)
        .pop()

describe("UserProvider settings pull", () => {
    beforeEach(() => {
        localStorage.clear()
        jest.clearAllMocks()
        mockPostLogin.mockResolvedValue({
            data: { access_token: "test-token" },
        })
        mockPatchSettings.mockImplementation(async (_t, payload) => ({
            data: { settings: payload.settings },
        }))
        mockHydrate.mockImplementation(async (ids) => ids.map(char))
    })

    it("keeps local friends when the server copy has no friends key, and uploads them", async () => {
        setFriends([char(1), char(2)])
        mockGetSettings.mockResolvedValue({
            data: { settings: { "lfm-settings": { minLevel: 5 } } },
        })
        const api = renderProvider()

        await act(async () => {
            await login(api)
        })

        expect(friendIds()).toEqual([1, 2])
        await waitFor(() => expect(patchedFriends()).toEqual([1, 2]), {
            timeout: 3000,
        })
    })

    it("applies the server's friends when the key is present", async () => {
        setFriends([char(1), char(2)])
        mockGetSettings.mockResolvedValue({
            data: { settings: { friends: [5, 6] } },
        })
        const api = renderProvider()

        await act(async () => {
            await login(api)
        })

        expect(friendIds()).toEqual([5, 6])
    })

    it("reads legacy character-object friends from the server by ID", async () => {
        setFriends([char(1)])
        mockGetSettings.mockResolvedValue({
            data: { settings: { friends: [{ id: 5, name: "Five" }] } },
        })
        const api = renderProvider()

        await act(async () => {
            await login(api)
        })

        expect(mockHydrate).toHaveBeenCalledWith([5], undefined)
        expect(friendIds()).toEqual([5])
    })

    it("keeps a friend added while the pull's character lookup is in flight", async () => {
        setFriends([char(1)])
        mockGetSettings.mockResolvedValue({
            data: { settings: { friends: [1, 5] } },
        })
        let finishLookup!: (characters: Character[]) => void
        mockHydrate.mockImplementation(
            () => new Promise((resolve) => (finishLookup = resolve))
        )
        const api = renderProvider()

        let loginDone!: Promise<unknown>
        act(() => {
            loginDone = login(api)
        })
        await waitFor(() => expect(mockHydrate).toHaveBeenCalled())

        addFriend(char(9))
        await act(async () => {
            finishLookup([char(1), char(5)])
            await loginDone
        })

        expect(friendIds()).toEqual([1, 9])
        await waitFor(() => expect(patchedFriends()).toEqual([1, 9]), {
            timeout: 3000,
        })
    })
})
