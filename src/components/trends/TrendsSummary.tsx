import React from "react"
import {
    TrendsComparison,
    TrendsSummaryData,
    TrendsWindowSummary,
} from "../../models/Trends.ts"
import { percentChange } from "../../utils/trendsUtils.ts"
import Skeleton from "../global/Skeleton.tsx"
import "./Trends.css"

// Comparisons whose previous period has less data than this are flagged.
const LOW_COVERAGE = 0.9
// Changes smaller than this (in %) read as "no change".
const FLAT_THRESHOLD = 0.5

const formatCount = (value: number) => Math.round(value).toLocaleString()

const formatUtcDay = (iso: string, withYear = false) =>
    new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(withYear ? { year: "numeric" } : {}),
        timeZone: "UTC",
    })

// Window ends are exclusive; show the last day actually covered.
const lastCoveredDay = (iso: string) =>
    new Date(new Date(iso).getTime() - 1).toISOString()

const formatWindow = (w: TrendsWindowSummary) =>
    `${formatUtcDay(w.start)} – ${formatUtcDay(lastCoveredDay(w.end), true)}`

const Delta = ({ change }: { change: number | null }) => {
    if (change === null) return null
    if (Math.abs(change) < FLAT_THRESHOLD)
        return <span className="trends-delta flat">≈ no change</span>
    const up = change > 0
    return (
        <span className={`trends-delta ${up ? "up" : "down"}`}>
            {up ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
        </span>
    )
}

interface TileProps {
    label: string
    comparison: TrendsComparison
    previousLabel: string
}

const ComparisonTile = ({ label, comparison, previousLabel }: TileProps) => {
    const { current, previous } = comparison
    if (!current) {
        return (
            <div className="trends-tile">
                <span className="trends-tile-label">{label}</span>
                <span className="trends-tile-detail">No data yet.</span>
            </div>
        )
    }
    const playerChange = percentChange(
        current.total.players,
        previous?.total.players
    )
    const lfmChange = percentChange(current.total.lfms, previous?.total.lfms)

    return (
        <div className="trends-tile">
            <span className="trends-tile-label">{label}</span>
            <span>
                <span className="trends-tile-value">
                    {formatCount(current.total.players)}
                </span>{" "}
                <span className="trends-tile-unit">avg players online</span>
            </span>
            {previous ? (
                <span className="trends-tile-detail">
                    <Delta change={playerChange} /> vs {previousLabel} (
                    {formatCount(previous.total.players)})
                </span>
            ) : (
                <span className="trends-tile-detail">
                    No data for {previousLabel} to compare against.
                </span>
            )}
            <span className="trends-tile-detail">
                {formatCount(current.total.lfms)} avg LFMs posted
                {lfmChange !== null && (
                    <>
                        {" · "}
                        <Delta change={lfmChange} />
                    </>
                )}
            </span>
            {previous && previous.coverage < LOW_COVERAGE && (
                <span className="trends-tile-detail">
                    The comparison period only has data for{" "}
                    {Math.round(previous.coverage * 100)}% of its hours.
                </span>
            )}
        </div>
    )
}

interface Props {
    summary: TrendsSummaryData | undefined
    loading: boolean
}

const TrendsSummary = ({ summary, loading }: Props) => {
    if (loading || !summary) {
        return (
            <div className="trends-tiles">
                {[0, 1, 2].map((i) => (
                    <Skeleton key={i} variant="rectangular" height="130px" />
                ))}
            </div>
        )
    }

    const { week, month, year_over_year } = summary.comparisons
    const yoyCurrent = year_over_year.current
    const yoyLabel = yoyCurrent ? formatWindow(yoyCurrent) : "This month"
    const yoyPreviousLabel = year_over_year.previous
        ? `the same days in ${new Date(year_over_year.previous.start).getUTCFullYear()}`
        : "the same days last year"

    return (
        <div className="trends-tiles">
            <ComparisonTile
                label="Last 7 days"
                comparison={week}
                previousLabel="the 7 days before"
            />
            <ComparisonTile
                label="Last 30 days"
                comparison={month}
                previousLabel="the 30 days before"
            />
            <ComparisonTile
                label={yoyLabel}
                comparison={year_over_year}
                previousLabel={yoyPreviousLabel}
            />
        </div>
    )
}

export default TrendsSummary
