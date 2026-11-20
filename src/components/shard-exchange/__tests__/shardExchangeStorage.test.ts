import {
    WINDOW_MAX_HEIGHT,
    WINDOW_MIN_HEIGHT,
    WINDOW_SCREEN_MARGIN,
    clampWindowHeight,
    fitWindowHeight,
    forgetStoredWindowHeight,
} from "../shardExchangeStorage"

describe("shard exchange window height", () => {
    beforeEach(() => localStorage.clear())

    it("clamps the height to its limits", () => {
        expect(clampWindowHeight(100)).toBe(WINDOW_MIN_HEIGHT)
        expect(clampWindowHeight(99999)).toBe(WINDOW_MAX_HEIGHT)
        expect(clampWindowHeight(700.4)).toBe(700)
    })

    it("takes whatever the rest of the page leaves of the browser window", () => {
        expect(fitWindowHeight(1000, 380)).toBe(620)
        expect(fitWindowHeight(700, 380)).toBe(WINDOW_MIN_HEIGHT)
    })

    it("leaves a margin before the page has been measured", () => {
        expect(fitWindowHeight(1000, null)).toBe(
            1000 - WINDOW_SCREEN_MARGIN * 2
        )
    })

    it("clears heights saved by earlier versions", () => {
        localStorage.setItem("shard-exchange-window-height", "900")
        localStorage.setItem(
            "shard-exchange-window-size",
            '{"width":900,"height":650}'
        )
        forgetStoredWindowHeight()
        expect(localStorage.getItem("shard-exchange-window-height")).toBeNull()
        expect(localStorage.getItem("shard-exchange-window-size")).toBeNull()
    })
})
