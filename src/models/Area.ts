interface Area {
    id: number
    name?: string
    region?: string
    is_public?: boolean
    is_wilderness?: boolean
}

interface AreaApiResponse {
    data: Area[]
    source: string
    timestamp: number
}

export type { Area, AreaApiResponse }
