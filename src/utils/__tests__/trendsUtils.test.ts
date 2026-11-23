import {
    bucketNotes,
    bucketStarts,
    buildLfmRatioSeries,
    buildServerSeries,
    buildShareSeries,
    buildTotalSeries,
    expectedHours,
    formatBucketTitle,
    maxValue,
    percentChange,
    rollingMean,
    spanInMonths,
    toChartDate,
    visibleServers,
} from "../trendsUtils"
import {
    PopulationTrendsData,
    TrendsServerPoint,
    TrendsTotalPoint,
} from "../../models/Trends"

const stat = (avg: number, min = avg, max = avg) => ({ avg, min, max })

const serverPoint = (
    t: string,
    players: number,
    lfms = 0,
    extra: Partial<TrendsServerPoint> = {}
): TrendsServerPoint => ({
    t,
    samples: 288,
    players: stat(players, players - 1, players + 1),
    lfms: stat(lfms),
    ...extra,
})

const totalPoint = (
    t: string,
    players: number,
    lfms: number,
    extra: Partial<TrendsTotalPoint> = {}
): TrendsTotalPoint => ({
    t,
    hours: 24,
    players: stat(players, players / 2, players * 2),
    lfms: stat(lfms),
    ...extra,
})

// Three UTC days; the middle one is missing entirely (a data gap).
const dayData: PopulationTrendsData = {
    range: "month",
    bucket: "day",
    start: "2026-11-01T00:00:00Z",
    end: "2026-11-03T12:00:00Z",
    series: {
        thrane: [
            serverPoint("2026-11-01T00:00:00Z", 300, 15),
            serverPoint("2026-11-03T00:00:00Z", 100, 5, { partial: true }),
        ],
        cormyr: [
            serverPoint("2026-11-01T00:00:00Z", 100, 5),
            serverPoint("2026-11-03T00:00:00Z", 100, 5),
        ],
        moonsea: [serverPoint("2026-11-01T00:00:00Z", 0)].map((p) => ({
            ...p,
            players: stat(0),
        })),
        notaserver: [serverPoint("2026-11-01T00:00:00Z", 50)],
    },
    total: [
        totalPoint("2026-11-01T00:00:00Z", 400, 20),
        totalPoint("2026-11-03T00:00:00Z", 200, 10, {
            hours: 12,
            partial: true,
        }),
    ],
}

describe("bucket helpers", () => {
    it("lists every bucket start in [start, end)", () => {
        expect(bucketStarts(dayData.start, dayData.end, "day")).toEqual([
            "2026-11-01T00:00:00Z",
            "2026-11-02T00:00:00Z",
            "2026-11-03T00:00:00Z",
        ])
        expect(
            bucketStarts(
                "2026-01-01T00:00:00Z",
                "2026-03-15T00:00:00Z",
                "month"
            )
        ).toEqual([
            "2026-01-01T00:00:00Z",
            "2026-02-01T00:00:00Z",
            "2026-03-01T00:00:00Z",
        ])
    })

    it("knows how many hours a bucket should hold", () => {
        expect(expectedHours("2026-02-01T00:00:00Z", "month")).toBe(28 * 24)
        expect(expectedHours("2026-11-16T00:00:00Z", "week")).toBe(168)
    })

    it("renders hour buckets in the viewer's timezone", () => {
        const x = toChartDate(
            "2026-07-01T16:00:00Z",
            "hour",
            "America/New_York"
        )
        expect([x.getDate(), x.getHours()]).toEqual([1, 12])
    })

    it("renders day buckets as their UTC date regardless of timezone", () => {
        const x = toChartDate("2026-11-01T00:00:00Z", "day", "America/New_York")
        expect([
            x.getFullYear(),
            x.getMonth(),
            x.getDate(),
            x.getHours(),
        ]).toEqual([2026, 10, 1, 0])
    })
})

describe("visibleServers", () => {
    it("drops unknown servers and servers that never had anyone", () => {
        expect(visibleServers(dayData.series)).toEqual(["cormyr", "thrane"])
    })

    it("keeps retired servers that had players in the period", () => {
        const series = {
            ...dayData.series,
            hardcore: [serverPoint("2026-11-01T00:00:00Z", 900)],
        }
        expect(visibleServers(series)).toEqual(["cormyr", "hardcore", "thrane"])
    })

    it("hides retired servers outside the seasons they ran", () => {
        const series = {
            ...dayData.series,
            hardcore: [serverPoint("2026-11-01T00:00:00Z", 0)].map((p) => ({
                ...p,
                players: stat(0),
            })),
        }
        expect(visibleServers(series)).toEqual(["cormyr", "thrane"])
    })
})

describe("rollingMean", () => {
    it("averages the trailing window and keeps gaps", () => {
        expect(rollingMean([1, 2, 3, null, 5], 2)).toEqual([
            1,
            1.5,
            2.5,
            null,
            5,
        ])
    })
})

describe("series builders", () => {
    it("builds per-server lines with null for missing buckets", () => {
        const series = buildServerSeries(dayData, "players", "UTC")
        expect(series.map((s) => s.id)).toEqual(["cormyr", "thrane"])
        expect(series[1].data.map((d) => d.y)).toEqual([300, null, 100])
    })

    it("builds the total line and its hourly band", () => {
        const { series, band } = buildTotalSeries(dayData, "lfms", "UTC")
        expect(series.data.map((d) => d.y)).toEqual([20, null, 10])
        expect(band.map((b) => [b.min, b.max])).toEqual([
            [20, 20],
            [null, null],
            [10, 10],
        ])
    })

    it("computes server share of the combined average", () => {
        const share = buildShareSeries(dayData, "UTC")
        const thrane = share.find((s) => s.id === "thrane")!
        expect(thrane.data.map((d) => d.y)).toEqual([75, null, 50])
    })

    it("computes LFMs per 100 players", () => {
        const ratio = buildLfmRatioSeries(dayData, "UTC", "Ratio")
        expect(ratio.data.map((d) => d.y)).toEqual([5, null, 5])
    })
})

describe("bucketNotes", () => {
    it("flags in-progress and incomplete buckets", () => {
        const notes = bucketNotes(
            {
                ...dayData,
                total: [
                    totalPoint("2026-11-01T00:00:00Z", 1, 1, { hours: 10 }),
                    totalPoint("2026-11-03T00:00:00Z", 1, 1, { partial: true }),
                ],
            },
            "UTC"
        )
        const key = (iso: string) => toChartDate(iso, "day", "UTC").getTime()
        expect(notes.get(key("2026-11-01T00:00:00Z"))).toBe("incomplete data")
        expect(notes.get(key("2026-11-03T00:00:00Z"))).toBe("in progress")
        expect(notes.size).toBe(2)
    })
})

describe("formatting and math", () => {
    it("formats tooltip titles per bucket", () => {
        const x = new Date(2026, 10, 16, 14)
        expect(formatBucketTitle(x, "week")).toBe("Week of Nov 16, 2026")
        expect(formatBucketTitle(x, "month", "in progress")).toBe(
            "November 2026 (in progress)"
        )
        expect(formatBucketTitle(x, "hour")).toBe("Mon, Nov 16, 2026 14:00")
    })

    it("computes percent change only when comparable", () => {
        expect(percentChange(110, 100)).toBeCloseTo(10)
        expect(percentChange(110, null)).toBeNull()
        expect(percentChange(110, 0)).toBeNull()
    })

    it("finds the max across lines and band", () => {
        const { series, band } = buildTotalSeries(dayData, "players", "UTC")
        expect(maxValue([series], band)).toBe(800)
        expect(maxValue([series])).toBe(400)
    })
})

describe("smoothing", () => {
    // Four complete days, then today's partial day with a misleading value.
    const smoothData: PopulationTrendsData = {
        range: "month",
        bucket: "day",
        start: "2026-11-01T00:00:00Z",
        end: "2026-11-05T12:00:00Z",
        series: {
            thrane: [
                serverPoint("2026-11-01T00:00:00Z", 100),
                serverPoint("2026-11-02T00:00:00Z", 200),
                serverPoint("2026-11-03T00:00:00Z", 300),
                serverPoint("2026-11-04T00:00:00Z", 400),
                serverPoint("2026-11-05T00:00:00Z", 10, 0, { partial: true }),
            ],
        },
        total: [
            totalPoint("2026-11-01T00:00:00Z", 100, 0),
            totalPoint("2026-11-02T00:00:00Z", 200, 0),
            totalPoint("2026-11-03T00:00:00Z", 300, 0),
            totalPoint("2026-11-04T00:00:00Z", 400, 0),
            totalPoint("2026-11-05T00:00:00Z", 10, 0, { partial: true }),
        ],
    }

    it("leaves the in-progress bucket out of smoothed lines", () => {
        const [thrane] = buildServerSeries(smoothData, "players", "UTC", 2)
        expect(thrane.data.map((d) => d.y)).toEqual([100, 150, 250, 350, null])
        const raw = buildServerSeries(smoothData, "players", "UTC")
        expect(raw[0].data[4].y).toBe(10)
    })

    it("smooths the band with the line so the line stays inside it", () => {
        const { series, band } = buildTotalSeries(
            smoothData,
            "players",
            "UTC",
            2
        )
        // totalPoint: min = avg / 2, max = avg * 2
        expect(band.map((b) => [b.min, b.max])).toEqual([
            [50, 200],
            [75, 300],
            [125, 500],
            [175, 700],
            [null, null],
        ])
        series.data.forEach((d, i) => {
            if (d.y === null) return
            expect(d.y).toBeGreaterThanOrEqual(band[i].min as number)
            expect(d.y).toBeLessThanOrEqual(band[i].max as number)
        })
    })
})

describe("spanInMonths", () => {
    it("counts whole calendar months", () => {
        expect(
            spanInMonths("2025-05-01T00:00:00Z", "2026-11-22T03:00:00Z")
        ).toBe(18)
        expect(
            spanInMonths("2026-11-01T00:00:00Z", "2026-11-22T00:00:00Z")
        ).toBe(0)
    })
})
