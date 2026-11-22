import React from "react"
import { TrendsSummaryData } from "../../models/Trends.ts"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import { DAYS_OF_WEEK } from "../../constants/dates.ts"
import Skeleton from "../global/Skeleton.tsx"
import "./Trends.css"

const formatCount = (value: number) => Math.round(value).toLocaleString()

const formatUtcHourOn = (iso: string) =>
    `${new Date(iso).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    })}, ${iso.slice(11, 16)} UTC`

/** "02:00 UTC (9:00 PM your time)" for a UTC hour of day. */
const formatUtcHourOfDay = (hour: number, timezone: string) => {
    const utc = `${String(hour).padStart(2, "0")}:00 UTC`
    if (timezone === "UTC") return utc
    const local = new Date(Date.UTC(2026, 0, 1, hour)).toLocaleTimeString(
        "en-US",
        { hour: "numeric", minute: "2-digit", timeZone: timezone }
    )
    return `${utc} (${local} your time)`
}

function busiest<T extends { players: number }>(items: T[]): T | undefined {
    return items.reduce<T | undefined>(
        (best, item) => (!best || item.players > best.players ? item : best),
        undefined
    )
}

interface Props {
    summary: TrendsSummaryData | undefined
    loading: boolean
    timezone: string
}

const TrendsRecords = ({ summary, loading, timezone }: Props) => {
    if (loading || !summary) {
        return <Skeleton variant="rectangular" height="160px" />
    }

    const {
        peak_hour_all_time,
        peak_hour_last_year,
        peak_server_all_time,
        last_90_days_by_weekday,
        last_90_days_by_hour,
    } = summary.records
    const busiestDay = busiest(last_90_days_by_weekday)
    const busiestHour = busiest(last_90_days_by_hour)

    const rows: [string, React.ReactNode][] = []
    if (peak_hour_all_time)
        rows.push([
            "Busiest hour on record",
            `${formatCount(peak_hour_all_time.players)} players — ${formatUtcHourOn(peak_hour_all_time.timestamp)}`,
        ])
    if (
        peak_hour_last_year &&
        peak_hour_last_year.timestamp !== peak_hour_all_time?.timestamp
    )
        rows.push([
            "Busiest hour in the last 12 months",
            `${formatCount(peak_hour_last_year.players)} players — ${formatUtcHourOn(peak_hour_last_year.timestamp)}`,
        ])
    if (peak_server_all_time)
        rows.push([
            "Most players on one server",
            `${formatCount(peak_server_all_time.players)} on ${toSentenceCase(peak_server_all_time.server_name)} — ${formatUtcHourOn(peak_server_all_time.hour)}`,
        ])
    if (busiestDay)
        rows.push([
            "Busiest day of the week (last 90 days)",
            `${DAYS_OF_WEEK[busiestDay.day]} — ${formatCount(busiestDay.players)} players on average (UTC days)`,
        ])
    if (busiestHour)
        rows.push([
            "Busiest time of day (last 90 days)",
            `${formatUtcHourOfDay(busiestHour.hour, timezone)} — ${formatCount(busiestHour.players)} players on average`,
        ])

    if (rows.length === 0) {
        return <p className="trends-note">No records yet.</p>
    }

    return (
        <>
            <dl className="trends-records">
                {rows.map(([label, value]) => (
                    <React.Fragment key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                    </React.Fragment>
                ))}
            </dl>
            <p className="trends-note">
                Player counts are combined across all servers and averaged over
                each hour.
            </p>
        </>
    )
}

export default TrendsRecords
