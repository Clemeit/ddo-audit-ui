interface ServerInfo {
    index: number
    last_status_check: string
    is_online: boolean
    queue_number: number
    is_vip_only: boolean
    last_data_fetch: string
    creation_timestamp: string
    character_count: number
    lfm_count: number
}

export { ServerInfo }
