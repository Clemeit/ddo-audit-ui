import {
    PopulationTrendsEndpointResponse,
    TrendsBucket,
    TrendsRange,
    TrendsSummaryEndpointResponse,
} from "../models/Trends.ts"
import { getRequest } from "./apiHelper.ts"

const TRENDS_ENDPOINT = "population/trends"

function getPopulationTrends(
    range: TrendsRange,
    bucket?: TrendsBucket,
    signal?: AbortSignal
): Promise<PopulationTrendsEndpointResponse> {
    return getRequest<PopulationTrendsEndpointResponse>(TRENDS_ENDPOINT, {
        params: bucket ? { range, bucket } : { range },
        signal,
    })
}

function getPopulationTrendsSummary(
    signal?: AbortSignal
): Promise<TrendsSummaryEndpointResponse> {
    return getRequest<TrendsSummaryEndpointResponse>(
        `${TRENDS_ENDPOINT}/summary`,
        { signal }
    )
}

export { getPopulationTrends, getPopulationTrendsSummary }
