import React, { useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import { DataLoadingErrorPageMessage } from "../global/CommonMessages.tsx"
import { useAppContext } from "../../contexts/AppContext.tsx"
import { TrendsMetric, TrendsRange } from "../../models/Trends.ts"
import { TRENDS_RANGE_OPTIONS } from "../../utils/trendsUtils.ts"
import { useTrendsSummary } from "./useTrendsData.tsx"
import TrendsSummary from "./TrendsSummary.tsx"
import TrendsRecords from "./TrendsRecords.tsx"
import PopulationTrendChart, { TrendsView } from "./PopulationTrendChart.tsx"
import {
    LfmRatioChart,
    LongTermTrendChart,
    ServerShareChart,
} from "./LongTermCharts.tsx"

const DEFAULT_RANGE: TrendsRange = "year"
const DEFAULT_METRIC: TrendsMetric = "players"
const DEFAULT_VIEW: TrendsView = "combined"

const RANGES = TRENDS_RANGE_OPTIONS.map((o) => o.value)
const METRICS: TrendsMetric[] = ["players", "lfms"]
const VIEWS: TrendsView[] = ["combined", "servers"]

function pick<T extends string>(
    value: string | null,
    allowed: T[],
    fallback: T
): T {
    return allowed.includes(value as T) ? (value as T) : fallback
}

const Trends = () => {
    const { timezoneOverride } = useAppContext()
    const timezone =
        timezoneOverride || Intl.DateTimeFormat().resolvedOptions().timeZone
    const summary = useTrendsSummary()

    // Chart settings live in the URL so a view can be shared; defaults are left out.
    const [searchParams, setSearchParams] = useSearchParams()
    const range = pick(searchParams.get("range"), RANGES, DEFAULT_RANGE)
    const metric = pick(searchParams.get("metric"), METRICS, DEFAULT_METRIC)
    const view = pick(searchParams.get("view"), VIEWS, DEFAULT_VIEW)

    const setParam = useCallback(
        (key: string, value: string, defaultValue: string) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev)
                    if (value === defaultValue) next.delete(key)
                    else next.set(key, value)
                    return next
                },
                { replace: true }
            )
        },
        [setSearchParams]
    )

    return (
        <Page
            title="Population Trends"
            description="How DDO's player and LFM counts have changed over time: weekly, monthly, yearly, and all-time population trends across every server."
            pageMessages={[summary.error && <DataLoadingErrorPageMessage />]}
        >
            <ContentClusterGroup>
                <ContentCluster
                    title="At a Glance"
                    subtitle="Average players online compared with the period before."
                >
                    <TrendsSummary
                        summary={summary.data}
                        loading={summary.loading}
                    />
                </ContentCluster>
                <ContentCluster title="Population Over Time">
                    <PopulationTrendChart
                        range={range}
                        setRange={(value) =>
                            setParam("range", value, DEFAULT_RANGE)
                        }
                        metric={metric}
                        setMetric={(value) =>
                            setParam("metric", value, DEFAULT_METRIC)
                        }
                        view={view}
                        setView={(value) =>
                            setParam("view", value, DEFAULT_VIEW)
                        }
                        timezone={timezone}
                    />
                </ContentCluster>
                <ContentCluster title="Long-Term Trend">
                    <LongTermTrendChart timezone={timezone} />
                </ContentCluster>
                <ContentCluster title="Server Share">
                    <ServerShareChart timezone={timezone} />
                </ContentCluster>
                <ContentCluster title="Grouping Activity">
                    <LfmRatioChart timezone={timezone} />
                </ContentCluster>
                <ContentCluster title="Records">
                    <TrendsRecords
                        summary={summary.data}
                        loading={summary.loading}
                        timezone={timezone}
                    />
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Trends
