interface ConfigEntry {
    key: string
    value?: string
    description?: string
    is_enabled?: boolean
    created_date?: string
    modified_date?: string
}

interface ConfigEndpointResponse {
    data: {
        [key: string]: ConfigEntry
    }
}

interface SingleConfigEndpointResponse {
    data: ConfigEntry
}

export type {
    ConfigEntry,
    ConfigEndpointResponse,
    SingleConfigEndpointResponse,
}
