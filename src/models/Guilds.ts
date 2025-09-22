import { Character } from "./Character"

interface GuildByNameData {
    guild_name: string
    server_name: string
    character_count: number
    avg_top_10_percent_last_update_epoch: number
}

interface GetGuildsByNameResponse {
    data: GuildByNameData[]
}

interface GuildDataApiResponse {
    data: GuildByNameData[]
    page: number
    page_length: number
    filtered_length: number
    total: number
}

interface GetGuildByServerAndNameData {
    guild_name: string
    server_name: string
    character_count: number
    online_characters?: { [characterId: number]: Character }
    is_member?: boolean
    member_ids?: number[]
}

interface GetGuildByServerAndNameResponse {
    data?: GetGuildByServerAndNameData
}

export type {
    GuildByNameData,
    GetGuildsByNameResponse,
    GuildDataApiResponse,
    GetGuildByServerAndNameResponse,
    GetGuildByServerAndNameData,
}
