import { ShardExchangeServerSummary } from "../../models/ShardExchange.ts"
import { formatAge, isStale } from "../../utils/shardExchangeUtils.ts"

const count = (value: number) => value.toLocaleString()

interface TrendProps {
    points: ShardExchangeServerSummary["trend"]
    days: number
    now: number
}

const WIDTH = 100
const HEIGHT = 28

// The listing count over the trend window, as a small line with a soft fill
export const ListingTrend = ({ points, days, now }: TrendProps) => {
    const values = points
        .map((point) => ({ t: Date.parse(point.time), v: point.listings }))
        .filter((point) => !Number.isNaN(point.t))
    if (values.length < 2) return null

    const start = now - days * 24 * 60 * 60 * 1000
    const first = Math.min(start, values[0].t)
    const span = Math.max(1, now - first)
    // The scale spans at least a fifth of the highest count, so small changes stay small
    const min = Math.min(...values.map((p) => p.v))
    const max = Math.max(...values.map((p) => p.v))
    const pad = Math.max(0, max * 0.2 - (max - min)) / 2
    const low = Math.max(0, min - pad)
    const high = max + pad
    const range = high - low
    const x = (t: number) => ((t - first) / span) * WIDTH
    // A flat line sits in the middle; otherwise leave a little room above and below
    const y = (v: number) =>
        range === 0 ? HEIGHT / 2 : 2 + (1 - (v - low) / range) * (HEIGHT - 4)

    const line = values
        .map((p) => `${x(p.t).toFixed(2)},${y(p.v).toFixed(2)}`)
        .join(" ")
    const area = `${x(values[0].t).toFixed(2)},${HEIGHT} ${line} ${x(values[values.length - 1].t).toFixed(2)},${HEIGHT}`
    const label = `Listings over the last ${days} days: from ${count(values[0].v)} to ${count(values[values.length - 1].v)}`

    return (
        <span className="sx-trend">
            <svg
                className="sx-trend-chart"
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="none"
                role="img"
                aria-label={label}
            >
                <title>{label}</title>
                <polygon className="sx-trend-area" points={area} />
                <polyline className="sx-trend-line" points={line} />
            </svg>
            <span className="sx-trend-caption" aria-hidden="true">
                <span>{days} days ago</span>
                <span>Now</span>
            </span>
        </span>
    )
}

interface Props {
    summary: ShardExchangeServerSummary
    activityHours: number
    endingSoonMinutes: number
    trendDays: number
    now: number
}

const hoursLabel = (hours: number) =>
    hours === 24 ? "Last day" : `Last ${hours} hours`

const minutesLabel = (minutes: number) =>
    minutes === 60 ? "within the hour" : `within ${minutes} minutes`

/** A server's Shard Exchange at a glance, for its card on the landing page. */
const ServerSummary = ({
    summary,
    activityHours,
    endingSoonMinutes,
    trendDays,
    now,
}: Props) => {
    if (!summary.updated_at) {
        return (
            <span className="sx-summary">
                <span className="sx-freshness stale">
                    No data for this server yet
                </span>
            </span>
        )
    }

    const stale = isStale(summary.updated_at, now)
    const { new_listings, sold, bids } = summary.last_day
    return (
        <span className="sx-summary">
            <span className="sx-summary-headline">
                <span>
                    <b>{count(summary.listings)}</b> listing
                    {summary.listings === 1 ? "" : "s"}
                </span>
                <span>
                    <b>{count(summary.ending_soon)}</b> ending{" "}
                    {minutesLabel(endingSoonMinutes)}
                </span>
            </span>
            <span className="sx-summary-activity">
                <span>{hoursLabel(activityHours)}:</span>
                <br />
                <span>
                    {count(new_listings)} new, {count(sold)} sold, {count(bids)}{" "}
                    bid{bids === 1 ? "" : "s"}
                </span>
            </span>
            <ListingTrend points={summary.trend} days={trendDays} now={now} />
            <span
                className={`sx-freshness${stale ? " stale" : ""}`}
                title={new Date(summary.updated_at).toLocaleString()}
            >
                Updated {formatAge(summary.updated_at, now)}
                {stale && " (out of date)"}
            </span>
        </span>
    )
}

export default ServerSummary
