// Response shapes for /v1/population/trends and /v1/population/trends/summary.
// All bucket timestamps are UTC bucket starts ("YYYY-MM-DDTHH:MM:SSZ").

export type TrendsRange = "week" | "month" | "quarter" | "year" | "all"
export type TrendsBucket = "hour" | "day" | "week" | "month"
export type TrendsMetric = "players" | "lfms"

export interface TrendsStat {
    avg: number
    min: number
    max: number
}

export interface TrendsServerPoint {
    t: string
    samples: number
    partial?: boolean
    players: TrendsStat
    lfms: TrendsStat
}

export interface TrendsTotalPoint {
    t: string
    // Hours with data in this bucket; min/max are the lowest/highest hourly combined average.
    hours: number
    partial?: boolean
    players: TrendsStat
    lfms: TrendsStat
}

export interface PopulationTrendsData {
    range: TrendsRange
    bucket: TrendsBucket
    start: string
    end: string
    series: Record<string, TrendsServerPoint[]>
    total: TrendsTotalPoint[]
}

export interface PopulationTrendsEndpointResponse {
    data: PopulationTrendsData
}

export interface TrendsAverages {
    players: number
    lfms: number
}

export interface TrendsWindowSummary {
    start: string
    end: string
    // Fraction (0-1) of hours in the window that have data.
    coverage: number
    total: TrendsAverages
    servers: Record<string, TrendsAverages>
}

export interface TrendsComparison {
    current: TrendsWindowSummary | null
    previous: TrendsWindowSummary | null
}

export interface TrendsPeakHour {
    timestamp: string
    players: number
}

export interface TrendsPeakServer {
    server_name: string
    players: number
    hour: string
}

export interface TrendsSummaryData {
    generated_at: string
    comparisons: {
        week: TrendsComparison
        month: TrendsComparison
        year_over_year: TrendsComparison
    }
    records: {
        peak_hour_all_time: TrendsPeakHour | null
        peak_hour_last_year: TrendsPeakHour | null
        peak_server_all_time: TrendsPeakServer | null
        // day: 0 = Sunday (UTC)
        last_90_days_by_weekday: { day: number; players: number }[]
        // hour: 0-23 (UTC)
        last_90_days_by_hour: { hour: number; players: number }[]
    }
}

export interface TrendsSummaryEndpointResponse {
    data: TrendsSummaryData
}
