interface Area {
    id: number
    name?: string
    region?: string
    is_public_space?: boolean
}

interface AreaApiResponse {
    data: Area[]
    source: string
    timestamp: number
}

export { Area, AreaApiResponse }
