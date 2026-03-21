import {
    toSentenceCase,
    toTitleCase,
    toPossessiveCase,
    convertMillisecondsToPrettyString,
    mapClassesToString,
    pluralize,
    levenshteinDistance,
} from "../stringUtils"

describe("stringUtils", () => {
    describe("toSentenceCase", () => {
        it("capitalizes first letter, lowercases rest", () => {
            expect(toSentenceCase("hello world")).toBe("Hello world")
        })

        it("handles already sentence-cased string", () => {
            expect(toSentenceCase("Hello")).toBe("Hello")
        })

        it("lowercases all-caps", () => {
            expect(toSentenceCase("HELLO")).toBe("Hello")
        })

        it("handles single character", () => {
            expect(toSentenceCase("a")).toBe("A")
        })
    })

    describe("toTitleCase", () => {
        it("capitalizes each word", () => {
            expect(toTitleCase("hello world")).toBe("Hello World")
        })

        it("lowercases then capitalizes", () => {
            expect(toTitleCase("HELLO WORLD")).toBe("Hello World")
        })
    })

    describe("toPossessiveCase", () => {
        it("adds apostrophe-s for names not ending in s", () => {
            expect(toPossessiveCase("John")).toBe("John's")
        })

        it("adds only apostrophe for names ending in s", () => {
            expect(toPossessiveCase("James")).toBe("James'")
        })
    })

    describe("pluralize", () => {
        it("returns singular when count is 1", () => {
            expect(pluralize("day", 1)).toBe("day")
        })

        it("adds s for normal words", () => {
            expect(pluralize("day", 2)).toBe("days")
        })

        it("changes y to ies (not ay/ey)", () => {
            expect(pluralize("city", 2)).toBe("cities")
        })

        it("does not change ay to ies", () => {
            expect(pluralize("day", 3)).toBe("days")
        })

        it("does not change ey to ies", () => {
            expect(pluralize("key", 2)).toBe("keys")
        })

        it("adds es for words ending in s", () => {
            expect(pluralize("class", 2)).toBe("classes")
        })

        it("adds es for words ending in x", () => {
            expect(pluralize("box", 2)).toBe("boxes")
        })

        it("adds es for words ending in z", () => {
            expect(pluralize("quiz", 2)).toBe("quizes")
        })
    })

    describe("levenshteinDistance", () => {
        it("returns 0 for identical strings", () => {
            expect(levenshteinDistance("abc", "abc")).toBe(0)
        })

        it("returns length of other string when one is empty", () => {
            expect(levenshteinDistance("", "abc")).toBe(3)
            expect(levenshteinDistance("abc", "")).toBe(3)
        })

        it("returns 1 for single edit", () => {
            expect(levenshteinDistance("abc", "ab")).toBe(1)
        })

        it("returns correct distance for different strings", () => {
            expect(levenshteinDistance("kitten", "sitting")).toBe(3)
        })
    })

    describe("convertMillisecondsToPrettyString", () => {
        it("returns '0 seconds' for 0 millis", () => {
            expect(convertMillisecondsToPrettyString({ millis: 0 })).toBe("0 seconds")
        })

        it("returns 'in the past' for negative millis", () => {
            expect(convertMillisecondsToPrettyString({ millis: -1000 })).toBe("in the past")
        })

        it("returns seconds for small values", () => {
            expect(convertMillisecondsToPrettyString({ millis: 5000 })).toBe("5 secs")
        })

        it("returns minutes and seconds for medium values", () => {
            const result = convertMillisecondsToPrettyString({ millis: 90000 }) // 1.5 min
            expect(result).toContain("1 min")
            expect(result).toContain("30 secs")
        })

        it("returns days for large values", () => {
            const oneDayMs = 24 * 60 * 60 * 1000
            const result = convertMillisecondsToPrettyString({ millis: oneDayMs })
            expect(result).toContain("1 day")
        })

        it("uses comma separator when commaSeparated is true", () => {
            const result = convertMillisecondsToPrettyString({
                millis: 90000,
                commaSeparated: true,
            })
            expect(result).toContain(", ")
        })

        it("uses full words when useFullWords is true", () => {
            const result = convertMillisecondsToPrettyString({
                millis: 90000,
                useFullWords: true,
            })
            expect(result).toContain("minute")
            expect(result).toContain("second")
        })

        it("returns only largest unit when onlyIncludeLargest is true", () => {
            const oneDayMs = 24 * 60 * 60 * 1000 + 3600000 // 1 day 1 hour
            const result = convertMillisecondsToPrettyString({
                millis: oneDayMs,
                onlyIncludeLargest: true,
                largestCount: 1,
            })
            expect(result).toBe("1 day")
        })

        it("uses non-breaking spaces when nonBreakingSpace is true", () => {
            const result = convertMillisecondsToPrettyString({
                millis: 5000,
                nonBreakingSpace: true,
            })
            expect(result).toContain("\u00A0")
        })
    })

    describe("mapClassesToString", () => {
        it("returns empty string for undefined classes", () => {
            expect(mapClassesToString(undefined)).toBe("")
        })

        it("joins class names and levels with comma", () => {
            const classes = [
                { name: "Fighter", level: 10 },
                { name: "Rogue", level: 5 },
            ]
            expect(mapClassesToString(classes as any)).toBe("Fighter 10, Rogue 5")
        })

        it("excludes Epic and Legendary classes", () => {
            const classes = [
                { name: "Fighter", level: 10 },
                { name: "Epic", level: 5 },
                { name: "Legendary", level: 1 },
            ]
            expect(mapClassesToString(classes as any)).toBe("Fighter 10")
        })

        it("uses non-breaking spaces when specified", () => {
            const classes = [{ name: "Fighter", level: 10 }]
            const result = mapClassesToString(classes as any, true)
            expect(result).toContain("\u00A0")
            expect(result).not.toContain(" ")
        })
    })
})
