interface NewsItem {
    id: number
    date?: string
    message?: string
}

interface NewsResponse {
    data?: NewsItem[]
}

export type { NewsItem, NewsResponse }
