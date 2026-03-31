import {
    isRecord,
    coerceNumberArray,
    normalizeLfmSettings,
    normalizeWhoSettings,
    normalizeAllPersistentSettings,
    normalizePartialPersistentSettings,
} from "../settingsNormalizers"

describe("settingsNormalizers", () => {
    describe("isRecord", () => {
        it("returns true for plain objects", () => {
            expect(isRecord({})).toBe(true)
            expect(isRecord({ a: 1 })).toBe(true)
        })

        it("returns false for null", () => {
            expect(isRecord(null)).toBe(false)
        })

        it("returns false for arrays", () => {
            expect(isRecord([])).toBe(false)
        })

        it("returns false for primitives", () => {
            expect(isRecord("string")).toBe(false)
            expect(isRecord(42)).toBe(false)
            expect(isRecord(true)).toBe(false)
            expect(isRecord(undefined)).toBe(false)
        })
    })

    describe("coerceNumberArray", () => {
        it("filters non-numbers from array", () => {
            expect(coerceNumberArray([1, "two", 3, null, 5])).toEqual([1, 3, 5])
        })

        it("returns empty array for non-array input", () => {
            expect(coerceNumberArray("not an array")).toEqual([])
            expect(coerceNumberArray(null)).toEqual([])
            expect(coerceNumberArray(undefined)).toEqual([])
        })

        it("returns empty array for empty array", () => {
            expect(coerceNumberArray([])).toEqual([])
        })
    })

    describe("normalizeLfmSettings", () => {
        it("returns full defaults for undefined input", () => {
            const result = normalizeLfmSettings(undefined)
            expect(result.minLevel).toBe(1)
            expect(result.maxLevel).toBe(34)
            expect(result.showNotEligible).toBe(true)
            expect(result.filterByMyCharacters).toBe(false)
            expect(result.showBoundingBoxes).toBe(false)
            expect(result.trackedCharacterIds).toEqual([])
            expect(result.ownedContent).toEqual([])
        })

        it("returns full defaults for empty object", () => {
            const result = normalizeLfmSettings({})
            expect(result.minLevel).toBe(1)
        })

        it("coerces minLevel within bounds", () => {
            expect(normalizeLfmSettings({ minLevel: -5 }).minLevel).toBe(1)
            expect(normalizeLfmSettings({ minLevel: 100 }).minLevel).toBe(34)
            expect(normalizeLfmSettings({ minLevel: 10 }).minLevel).toBe(10)
        })

        it("coerces maxLevel within bounds", () => {
            expect(normalizeLfmSettings({ maxLevel: -5 }).maxLevel).toBe(1)
            expect(normalizeLfmSettings({ maxLevel: 100 }).maxLevel).toBe(34)
        })

        it("coerces booleans with correct defaults", () => {
            expect(
                normalizeLfmSettings({ showNotEligible: "yes" }).showNotEligible
            ).toBe(true)
            expect(
                normalizeLfmSettings({ filterByMyCharacters: "yes" })
                    .filterByMyCharacters
            ).toBe(true)
        })

        it("preserves valid boolean values", () => {
            expect(
                normalizeLfmSettings({ showNotEligible: false }).showNotEligible
            ).toBe(false)
            expect(
                normalizeLfmSettings({ filterByMyCharacters: true })
                    .filterByMyCharacters
            ).toBe(true)
        })

        it("coerces trackedCharacterIds to number array", () => {
            const result = normalizeLfmSettings({
                trackedCharacterIds: [1, "bad", 3],
            })
            expect(result.trackedCharacterIds).toEqual([1, 3])
        })

        it("normalizes sortBy from valid input", () => {
            const result = normalizeLfmSettings({
                sortBy: { type: "level", ascending: false },
            })
            expect(result.sortBy.ascending).toBe(false)
        })

        it("defaults sortBy when invalid", () => {
            const result = normalizeLfmSettings({ sortBy: "invalid" })
            expect(result.sortBy.ascending).toBe(true)
        })
    })

    describe("normalizeWhoSettings", () => {
        it("returns full defaults for undefined input", () => {
            const result = normalizeWhoSettings(undefined)
            expect(result.stringFilter).toBe("")
            expect(result.minLevel).toBe(1)
            expect(result.maxLevel).toBe(34)
            expect(result.isGroupView).toBe(false)
            expect(result.isFilterAreaCollapsed).toBe(false)
            expect(result.shouldSaveFilterAreaCollapsed).toBe(false)
            expect(result.hideIgnoredCharacters).toBe(true)
            expect(result.pinFriends).toBe(true)
        })

        it("preserves valid string filter", () => {
            const result = normalizeWhoSettings({ stringFilter: "test" })
            expect(result.stringFilter).toBe("test")
        })

        it("defaults stringFilter for non-string input", () => {
            const result = normalizeWhoSettings({ stringFilter: 42 })
            expect(result.stringFilter).toBe("")
        })

        it("coerces classNameFilter to string array with defaults", () => {
            const result = normalizeWhoSettings({})
            // Should default to CLASS_LIST_LOWER
            expect(result.classNameFilter.length).toBeGreaterThan(0)
            expect(result.classNameFilter).toContain("fighter")
        })

        it("preserves valid collapsed state settings", () => {
            const result = normalizeWhoSettings({
                isFilterAreaCollapsed: true,
                shouldSaveFilterAreaCollapsed: true,
            })

            expect(result.isFilterAreaCollapsed).toBe(true)
            expect(result.shouldSaveFilterAreaCollapsed).toBe(true)
        })

        it("coerces collapsed state settings with false defaults", () => {
            const result = normalizeWhoSettings({
                isFilterAreaCollapsed: "yes",
                shouldSaveFilterAreaCollapsed: "yes",
            })

            expect(result.isFilterAreaCollapsed).toBe(true)
            expect(result.shouldSaveFilterAreaCollapsed).toBe(true)
        })

        it("defaults collapsed state settings to false when missing", () => {
            const result = normalizeWhoSettings({})

            expect(result.isFilterAreaCollapsed).toBe(false)
            expect(result.shouldSaveFilterAreaCollapsed).toBe(false)
        })
    })

    describe("normalizeAllPersistentSettings", () => {
        it("returns complete shape with all keys for undefined input", () => {
            const result = normalizeAllPersistentSettings(undefined)
            expect(result).toHaveProperty("lfm-settings")
            expect(result).toHaveProperty("who-settings")
            expect(result).toHaveProperty("access-tokens")
            expect(result).toHaveProperty("boolean-flags")
            expect(result).toHaveProperty("dismissed-feature-callouts")
            expect(result).toHaveProperty("friends")
            expect(result).toHaveProperty("ignores")
            expect(result).toHaveProperty("registered-characters")
        })

        it("normalizes nested lfm-settings", () => {
            const result = normalizeAllPersistentSettings({
                "lfm-settings": { minLevel: 5 },
            })
            expect(result["lfm-settings"].minLevel).toBe(5)
            expect(result["lfm-settings"].maxLevel).toBe(34)
        })

        it("filters invalid access tokens", () => {
            const result = normalizeAllPersistentSettings({
                "access-tokens": [
                    { character_id: 1, access_token: "valid" },
                    { bad: "data" },
                    { character_id: "not-a-number", access_token: "valid" },
                ],
            })
            expect(result["access-tokens"]).toHaveLength(1)
            expect(result["access-tokens"][0].character_id).toBe(1)
        })

        it("coerces friends to number array", () => {
            const result = normalizeAllPersistentSettings({
                friends: [1, "bad", 3],
            })
            expect(result.friends).toEqual([1, 3])
        })
    })

    describe("normalizePartialPersistentSettings", () => {
        it("returns only requested keys", () => {
            const result = normalizePartialPersistentSettings({}, [
                "friends",
                "ignores",
            ])
            expect(result).toHaveProperty("friends")
            expect(result).toHaveProperty("ignores")
            expect(result).not.toHaveProperty("lfm-settings")
        })

        it("ignores keys that are not part of persistent settings", () => {
            const result = normalizePartialPersistentSettings({}, [
                "nonexistent-key" as any,
            ])
            expect(Object.keys(result)).toHaveLength(0)
        })
    })
})
