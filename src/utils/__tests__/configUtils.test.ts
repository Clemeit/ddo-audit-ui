jest.mock("../logUtils", () => ({ __esModule: true, default: jest.fn() }))

import { getIsFeatureEnabled } from "../configUtils"

const config = (entries: Record<string, { is_enabled?: boolean }>) => ({
    data: Object.fromEntries(
        Object.entries(entries).map(([key, e]) => [
            key,
            { key, value: null, ...e },
        ])
    ),
})

describe("getIsFeatureEnabled", () => {
    it("is on only when the row exists and is enabled", () => {
        expect(
            getIsFeatureEnabled(config({ f: { is_enabled: true } }), "f")
        ).toBe(true)
        expect(
            getIsFeatureEnabled(config({ f: { is_enabled: false } }), "f")
        ).toBe(false)
        expect(getIsFeatureEnabled(config({}), "f")).toBe(false)
    })

    it("is off before config has loaded", () => {
        expect(getIsFeatureEnabled(null, "f")).toBe(false)
        expect(getIsFeatureEnabled(undefined, "f")).toBe(false)
    })
})
