import { act, renderHook, waitFor } from "@testing-library/react"
import useGetCharacterList, {
    mergeLiveCharacters,
} from "../useGetCharacterList"
import { Character } from "../../models/Character"
import { getCharactersByIds } from "../../services/characterService"

jest.mock("../../services/characterService", () => ({
    getCharactersByIds: jest.fn(),
}))
jest.mock("../../contexts/UserContext", () => ({
    useUserContext: () => ({ persistentSettingsRevision: 0 }),
}))
jest.mock("../../utils/logUtils", () => jest.fn())

const mockGetCharactersByIds = getCharactersByIds as jest.MockedFunction<
    typeof getCharactersByIds
>

const char = (id: number, extra: Partial<Character> = {}): Character =>
    ({ id, name: `Char${id}`, ...extra }) as Character

type Deferred = {
    promise: Promise<any>
    resolve: (value: any) => void
}
const deferred = (): Deferred => {
    let resolve!: (value: any) => void
    const promise = new Promise((r) => (resolve = r))
    return { promise, resolve }
}
const response = (characters: Character[]) => ({
    data: Object.fromEntries(characters.map((c) => [String(c.id), c])),
})

/** An in-memory stand-in for the localStorage list the hook manages. */
const makeStore = (initial: Character[]) => {
    let stored = [...initial]
    return {
        get: () => stored,
        props: {
            getCharactersFromLocalStorage: () => stored,
            setCharactersInLocalStorage: jest.fn((next: Character[]) => {
                stored = next
            }),
            addCharacterToLocalStorage: (c: Character) => {
                if (!stored.some((s) => s.id === c.id)) stored = [...stored, c]
            },
            removeCharacterFromLocalStorage: (c: Character) => {
                stored = stored.filter((s) => s.id !== c.id)
            },
        },
    }
}

const ids = (characters: Character[]) => characters.map((c) => c.id)

describe("mergeLiveCharacters", () => {
    it("never drops a stored character the lookup didn't return", () => {
        const merged = mergeLiveCharacters(
            [char(1), char(2, { is_online: true }), char(3)],
            [char(1, { name: "Fresh", is_online: true })]
        )
        expect(ids(merged)).toEqual([1, 2, 3])
        expect(merged[0].name).toBe("Fresh")
        // Not in the online cache, so not online.
        expect(merged[1].is_online).toBe(false)
    })

    it("never adds a returned character that isn't stored", () => {
        expect(ids(mergeLiveCharacters([char(1)], [char(1), char(9)]))).toEqual(
            [1]
        )
    })

    it("keeps everything when the lookup returns nothing", () => {
        expect(ids(mergeLiveCharacters([char(1), char(2)], []))).toEqual([1, 2])
    })
})

describe("useGetCharacterList", () => {
    beforeEach(() => mockGetCharactersByIds.mockReset())

    it("keeps offline characters missing from a partial response", async () => {
        const store = makeStore([char(1), char(2), char(3)])
        mockGetCharactersByIds.mockResolvedValue(
            response([char(2, { is_online: true })]) as any
        )

        const { result } = renderHook(() => useGetCharacterList(store.props))

        await waitFor(() =>
            expect(result.current.hasFetchedFromServer).toBe(true)
        )
        expect(ids(store.get())).toEqual([1, 2, 3])
        expect(ids(result.current.characters)).toEqual([1, 2, 3])
        expect(store.get()[1].is_online).toBe(true)
    })

    it("keeps a character added while an older lookup was in flight", async () => {
        const store = makeStore([char(1)])
        const first = deferred()
        const second = deferred()
        mockGetCharactersByIds
            .mockReturnValueOnce(first.promise as any)
            .mockReturnValueOnce(second.promise as any)

        const { result } = renderHook(() => useGetCharacterList(store.props))
        act(() => result.current.addCharacter(char(2)))

        // The newer lookup lands first, then the stale one (which only knew about 1).
        await act(async () => second.resolve(response([char(1), char(2)])))
        await act(async () => first.resolve(response([char(1)])))

        expect(ids(store.get())).toEqual([1, 2])
        expect(ids(result.current.characters)).toEqual([1, 2])
    })

    it("does not resurrect a character removed while a lookup was in flight", async () => {
        const store = makeStore([char(1), char(2)])
        const first = deferred()
        const second = deferred()
        mockGetCharactersByIds
            .mockReturnValueOnce(first.promise as any)
            .mockReturnValueOnce(second.promise as any)

        const { result } = renderHook(() => useGetCharacterList(store.props))
        act(() => result.current.removeCharacter(char(2)))

        await act(async () => first.resolve(response([char(1), char(2)])))
        await act(async () => second.resolve(response([char(1)])))

        expect(ids(store.get())).toEqual([1])
        expect(ids(result.current.characters)).toEqual([1])
    })

    it("merges into the list as stored at response time, not request time", async () => {
        // Another tab (or a settings pull) adds 3 while this lookup is in flight.
        const store = makeStore([char(1)])
        const pending = deferred()
        mockGetCharactersByIds.mockReturnValueOnce(pending.promise as any)

        renderHook(() => useGetCharacterList(store.props))
        store.props.addCharacterToLocalStorage(char(3))
        await act(async () => pending.resolve(response([char(1)])))

        expect(ids(store.get())).toEqual([1, 3])
    })

    it("leaves storage untouched when the lookup fails", async () => {
        const store = makeStore([char(1), char(2)])
        mockGetCharactersByIds.mockRejectedValue(new Error("500"))

        const { result } = renderHook(() => useGetCharacterList(store.props))

        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(store.props.setCharactersInLocalStorage).not.toHaveBeenCalled()
        expect(ids(result.current.characters)).toEqual([1, 2])
    })
})
