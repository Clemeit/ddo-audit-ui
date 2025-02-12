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

interface ServerInfoApiDataModel {
    argonnessen?: ServerInfo
    cannith?: ServerInfo
    ghallanda?: ServerInfo
    khyber?: ServerInfo
    orien?: ServerInfo
    sarlona?: ServerInfo
    thelanis?: ServerInfo
    wayfinder?: ServerInfo
    hardcore?: ServerInfo
    cormyr?: ServerInfo
}

export { ServerInfo, ServerInfoApiDataModel }
