interface ConfigEntry {
    key: string
    value: any
    description?: string
    is_enabled?: boolean
}

interface ConfigEndpointResponse {
    data: {
        [key: string]: ConfigEntry
    }
}

export type { ConfigEntry, ConfigEndpointResponse }
