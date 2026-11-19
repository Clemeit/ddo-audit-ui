import { formatAge, isStale } from "../../utils/shardExchangeUtils.ts"

interface Props {
    updatedAt: string | null | undefined
    now: number
    isLoaded: boolean
}

// "Updated 12 minutes ago", in a warning colour when the data is out of date.
const DataFreshness = ({ updatedAt, now, isLoaded }: Props) => {
    if (!isLoaded) return null
    if (!updatedAt) {
        return (
            <span className="sx-freshness stale">
                No data for this server yet
            </span>
        )
    }
    const stale = isStale(updatedAt, now)
    return (
        <span
            className={`sx-freshness${stale ? " stale" : ""}`}
            title={new Date(updatedAt).toLocaleString()}
        >
            Updated {formatAge(updatedAt, now)}
            {stale && " (out of date)"}
        </span>
    )
}

export default DataFreshness
