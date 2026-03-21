import { debounce } from "../functionUtils"

describe("functionUtils", () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe("debounce", () => {
        it("delays function execution", () => {
            const fn = jest.fn()
            const debounced = debounce(fn, 100)
            debounced()
            expect(fn).not.toHaveBeenCalled()
            jest.advanceTimersByTime(100)
            expect(fn).toHaveBeenCalledTimes(1)
        })

        it("resets timer on subsequent calls", () => {
            const fn = jest.fn()
            const debounced = debounce(fn, 100)
            debounced()
            jest.advanceTimersByTime(50)
            debounced() // reset
            jest.advanceTimersByTime(50)
            expect(fn).not.toHaveBeenCalled()
            jest.advanceTimersByTime(50)
            expect(fn).toHaveBeenCalledTimes(1)
        })

        it("passes arguments to the debounced function", () => {
            const fn = jest.fn()
            const debounced = debounce(fn, 100)
            debounced("a", "b")
            jest.advanceTimersByTime(100)
            expect(fn).toHaveBeenCalledWith("a", "b")
        })

        it("clear() cancels pending execution", () => {
            const fn = jest.fn()
            const debounced = debounce(fn, 100)
            debounced()
            debounced.clear()
            jest.advanceTimersByTime(200)
            expect(fn).not.toHaveBeenCalled()
        })
    })
})
