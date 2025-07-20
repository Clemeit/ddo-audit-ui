interface NewsItem {
    id: number
    date?: string
    message?: string
}

interface NewsResponse {
    data?: NewsItem[]
}

interface PageMessage {
    id: number
    message: string
    type: "info" | "warning" | "critical" | "success"
    dismissable?: boolean
    date?: string
    affectedPages?: string[]
}

interface PageMessageEndpointResponse {
    data: PageMessage[]
}

export type { NewsItem, NewsResponse, PageMessage, PageMessageEndpointResponse }
