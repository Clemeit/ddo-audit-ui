import {
    defaultQuietHours,
    describeQuietWindow,
    effectiveTimezone,
    formatTime,
    isValidQuietWindow,
    isValidTime,
    timeToMinutes,
} from "../quietHours"

describe("quietHours", () => {
    test("isValidTime accepts 24-hour HH:MM only", () => {
        expect(isValidTime("00:00")).toBe(true)
        expect(isValidTime("23:59")).toBe(true)
        expect(isValidTime("24:00")).toBe(false)
        expect(isValidTime("7:00")).toBe(false)
        expect(isValidTime("")).toBe(false)
    })

    test("timeToMinutes", () => {
        expect(timeToMinutes("00:00")).toBe(0)
        expect(timeToMinutes("06:30")).toBe(390)
        expect(timeToMinutes("nope")).toBeNull()
    })

    test("a window needs two valid, different times", () => {
        expect(isValidQuietWindow("23:00", "07:00")).toBe(true)
        expect(isValidQuietWindow("07:00", "07:00")).toBe(false)
        expect(isValidQuietWindow("", "07:00")).toBe(false)
    })

    test("formatTime uses a 12-hour clock", () => {
        expect(formatTime("00:00")).toBe("12:00 AM")
        expect(formatTime("07:05")).toBe("7:05 AM")
        expect(formatTime("12:00")).toBe("12:00 PM")
        expect(formatTime("23:00")).toBe("11:00 PM")
        expect(formatTime("bad")).toBe("bad")
    })

    test("describeQuietWindow", () => {
        expect(describeQuietWindow("23:00", "07:00")).toBe(
            "11:00 PM to 7:00 AM"
        )
    })

    test("effectiveTimezone prefers the override", () => {
        expect(effectiveTimezone("Europe/Paris")).toBe("Europe/Paris")
        expect(effectiveTimezone("")).toBe(
            Intl.DateTimeFormat().resolvedOptions().timeZone
        )
    })

    test("defaultQuietHours starts disabled overnight in the given zone", () => {
        expect(defaultQuietHours("UTC")).toEqual({
            quiet_enabled: false,
            quiet_start: "23:00",
            quiet_end: "07:00",
            timezone: "UTC",
        })
    })
})
