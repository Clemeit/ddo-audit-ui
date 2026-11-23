import { HISTORICAL_SERVER_NAMES_LOWER } from "../constants/servers.ts"
import {
    PopulationTrendsData,
    TrendsBucket,
    TrendsMetric,
    TrendsRange,
    TrendsServerPoint,
    TrendsTotalPoint,
} from "../models/Trends.ts"
import { NivoGappedDateSeries } from "./nivoUtils.ts"

export const TRENDS_RANGE_OPTIONS: { value: TrendsRange; label: string }[] = [
    { value: "week", label: "1W" },
    { value: "month", label: "1M" },
    { value: "quarter", label: "3M" },
    { value: "year", label: "1Y" },
    { value: "all", label: "All" },
]

export const TRENDS_RANGE_LABELS: Record<TrendsRange, string> = {
    week: "the last week",
    month: "the last 30 days",
    quarter: "the last 90 days",
    year: "the last year",
    all: "all time",
}

// Bucket used for each range on the main chart (must be allowed by the API).
export const TRENDS_DEFAULT_BUCKET: Record<TrendsRange, TrendsBucket> = {
    week: "hour",
    month: "day",
    quarter: "day",
    year: "day",
    all: "week",
}

export const TOTAL_SERIES_ID = "Total"

// A bucket with less than this share of its expected hours is flagged as incomplete.
const COMPLETE_THRESHOLD = 0.9

export interface BandPoint {
    x: Date
    min: number | null
    max: number | null
}

/** Next UTC bucket start after `date`. */
export function nextBucketStart(date: Date, bucket: TrendsBucket): Date {
    const next = new Date(date.getTime())
    if (bucket === "hour") next.setUTCHours(next.getUTCHours() + 1)
    else if (bucket === "day") next.setUTCDate(next.getUTCDate() + 1)
    else if (bucket === "week") next.setUTCDate(next.getUTCDate() + 7)
    else next.setUTCMonth(next.getUTCMonth() + 1)
    return next
}

/** Every UTC bucket start in [start, end). `start` is already bucket-aligned by the API. */
export function bucketStarts(
    start: string,
    end: string,
    bucket: TrendsBucket
): string[] {
    const result: string[] = []
    const endTime = new Date(end).getTime()
    let cursor = new Date(start)
    while (cursor.getTime() < endTime) {
        result.push(toIsoUtc(cursor))
        cursor = nextBucketStart(cursor, bucket)
    }
    return result
}

function toIsoUtc(date: Date): string {
    return date.toISOString().replace(/\.\d{3}Z$/, "Z")
}

/** Hours a bucket starting at `iso` should contain (ignoring the in-progress bucket). */
export function expectedHours(iso: string, bucket: TrendsBucket): number {
    const start = new Date(iso)
    return (nextBucketStart(start, bucket).getTime() - start.getTime()) / 36e5
}

/**
 * A Date whose local wall-clock fields equal `date`'s wall clock in `timezone`, so a time-scale
 * chart (which renders in the browser's local time) shows times in that timezone.
 */
export function toWallClock(date: Date, timezone: string): Date {
    if (timezone === "UTC") {
        return new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes()
        )
    }
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            hourCycle: "h23",
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        })
            .formatToParts(date)
            .map((part) => [part.type, part.value])
    )
    return new Date(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute)
    )
}

/**
 * Chart x value for a bucket. Hourly buckets are shown in the viewer's timezone; day and
 * longer buckets are UTC days, so they're shifted to render as their UTC wall-clock date.
 */
export function toChartDate(
    iso: string,
    bucket: TrendsBucket,
    timezone: string
): Date {
    return toWallClock(new Date(iso), bucket === "hour" ? timezone : "UTC")
}

/**
 * Known servers, current or retired, that reported anyone at all in the period. Retired servers
 * (e.g. Hardcore) only show up for ranges that reach back to when they were running.
 */
export function visibleServers(
    series: Record<string, TrendsServerPoint[]>
): string[] {
    return Object.keys(series)
        .filter(
            (name) =>
                HISTORICAL_SERVER_NAMES_LOWER.includes(name.toLowerCase()) &&
                series[name].some((p) => p.players.max > 0 || p.lfms.max > 0)
        )
        .sort()
}

/** Trailing mean over the last `window` values, skipping gaps. Null where the input is null. */
export function rollingMean(
    values: (number | null)[],
    window: number
): (number | null)[] {
    return values.map((value, index) => {
        if (value === null) return null
        const slice = values
            .slice(Math.max(0, index - window + 1), index + 1)
            .filter((v): v is number => v !== null)
        return slice.reduce((sum, v) => sum + v, 0) / slice.length
    })
}

/**
 * Values to plot for a metric. With smoothing, the in-progress bucket is left out entirely: it
 * only covers part of its day, so it would pull the newest smoothed point around depending on
 * when you look.
 */
function plotValues(
    points: ({ partial?: boolean } | null)[],
    value: (index: number) => number | null,
    smoothingWindow: number
): (number | null)[] {
    const values = points.map((_, i) => value(i))
    if (smoothingWindow <= 1) return values
    const complete = values.map((v, i) => (points[i]?.partial ? null : v))
    return rollingMean(complete, smoothingWindow)
}

/** Whole months between two ISO timestamps (for picking axis tick spacing). */
export function spanInMonths(start: string, end: string): number {
    const a = new Date(start)
    const b = new Date(end)
    return (
        (b.getUTCFullYear() - a.getUTCFullYear()) * 12 +
        (b.getUTCMonth() - a.getUTCMonth())
    )
}

function alignTo<P extends { t: string }>(
    data: PopulationTrendsData,
    points: P[]
): (P | null)[] {
    const byTime = new Map(points.map((p) => [p.t, p]))
    return bucketStarts(data.start, data.end, data.bucket).map(
        (t) => byTime.get(t) ?? null
    )
}

/** One line per visible server, with null y for missing buckets. */
export function buildServerSeries(
    data: PopulationTrendsData,
    metric: TrendsMetric,
    timezone: string,
    smoothingWindow = 0
): NivoGappedDateSeries[] {
    const starts = bucketStarts(data.start, data.end, data.bucket)
    return visibleServers(data.series).map((server) => {
        const aligned = alignTo(data, data.series[server])
        const values = plotValues(
            aligned,
            (i) => aligned[i]?.[metric].avg ?? null,
            smoothingWindow
        )
        return {
            id: server,
            data: starts.map((t, i) => ({
                x: toChartDate(t, data.bucket, timezone),
                y: values[i],
            })),
        }
    })
}

/**
 * The all-servers line plus its hourly low/high band. With smoothing, the band's edges are
 * smoothed over the same window as the line, so the line always sits inside its band.
 */
export function buildTotalSeries(
    data: PopulationTrendsData,
    metric: TrendsMetric,
    timezone: string,
    smoothingWindow = 0
): { series: NivoGappedDateSeries; band: BandPoint[] } {
    const starts = bucketStarts(data.start, data.end, data.bucket)
    const aligned = alignTo(data, data.total)
    const values = plotValues(
        aligned,
        (i) => aligned[i]?.[metric].avg ?? null,
        smoothingWindow
    )
    const mins = plotValues(
        aligned,
        (i) => aligned[i]?.[metric].min ?? null,
        smoothingWindow
    )
    const maxes = plotValues(
        aligned,
        (i) => aligned[i]?.[metric].max ?? null,
        smoothingWindow
    )
    const xs = starts.map((t) => toChartDate(t, data.bucket, timezone))
    return {
        series: {
            id: TOTAL_SERIES_ID,
            data: xs.map((x, i) => ({ x, y: values[i] })),
        },
        band: xs.map((x, i) => ({ x, min: mins[i], max: maxes[i] })),
    }
}

/** Each visible server's share (%) of the combined average, per bucket. */
export function buildShareSeries(
    data: PopulationTrendsData,
    timezone: string
): NivoGappedDateSeries[] {
    const starts = bucketStarts(data.start, data.end, data.bucket)
    const servers = visibleServers(data.series)
    const alignedByServer = servers.map((s) => alignTo(data, data.series[s]))
    const totals = starts.map((_, i) =>
        alignedByServer.reduce(
            (sum, aligned) => sum + (aligned[i]?.players.avg ?? 0),
            0
        )
    )
    return servers.map((server, s) => ({
        id: server,
        data: starts.map((t, i) => {
            const point = alignedByServer[s][i]
            return {
                x: toChartDate(t, data.bucket, timezone),
                y:
                    point && totals[i] > 0
                        ? (point.players.avg / totals[i]) * 100
                        : null,
            }
        }),
    }))
}

/** Combined LFMs per 100 players, per bucket. */
export function buildLfmRatioSeries(
    data: PopulationTrendsData,
    timezone: string,
    id: string
): NivoGappedDateSeries {
    const starts = bucketStarts(data.start, data.end, data.bucket)
    const aligned = alignTo(data, data.total)
    return {
        id,
        data: starts.map((t, i) => {
            const point = aligned[i]
            return {
                x: toChartDate(t, data.bucket, timezone),
                y:
                    point && point.players.avg > 0
                        ? (point.lfms.avg / point.players.avg) * 100
                        : null,
            }
        }),
    }
}

/**
 * Tooltip suffixes keyed by chart x (ms): in-progress buckets and buckets with too few hours of
 * data (e.g. the month data collection started in).
 */
export function bucketNotes(
    data: PopulationTrendsData,
    timezone: string
): Map<number, string> {
    const notes = new Map<number, string>()
    data.total.forEach((point: TrendsTotalPoint) => {
        const x = toChartDate(point.t, data.bucket, timezone).getTime()
        if (point.partial) notes.set(x, "in progress")
        else if (
            point.hours <
            expectedHours(point.t, data.bucket) * COMPLETE_THRESHOLD
        )
            notes.set(x, "incomplete data")
    })
    return notes
}

/** Tooltip title for a chart x value. */
export function formatBucketTitle(
    x: Date,
    bucket: TrendsBucket,
    note?: string
): string {
    const day = (options: Intl.DateTimeFormatOptions) =>
        x.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            ...options,
        })
    let title: string
    if (bucket === "hour") {
        const time = x.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
        })
        title = `${day({ weekday: "short" })} ${time}`
    } else if (bucket === "day") title = day({ weekday: "short" })
    else if (bucket === "week") title = `Week of ${day({})}`
    else
        title = x.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        })
    return note ? `${title} (${note})` : title
}

/** Percent change from previous to current; null when there's nothing to compare. */
export function percentChange(
    current: number | null | undefined,
    previous: number | null | undefined
): number | null {
    if (current == null || previous == null || previous === 0) return null
    return ((current - previous) / previous) * 100
}

/** Largest y across the given series and band, for a y-scale that fits the band. */
export function maxValue(
    series: NivoGappedDateSeries[],
    band: BandPoint[] = []
): number {
    let max = 0
    series.forEach((s) =>
        s.data.forEach((d) => {
            if (d.y !== null && d.y > max) max = d.y
        })
    )
    band.forEach((b) => {
        if (b.max !== null && b.max > max) max = b.max
    })
    return max
}
