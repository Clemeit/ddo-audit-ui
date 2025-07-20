interface ConfigEntry {
    key: string
    value: any
    description?: string
}

interface ConfigEndpointResponse {
    data: {
        [key: string]: ConfigEntry
    }
}

export type { ConfigEntry, ConfigEndpointResponse }
