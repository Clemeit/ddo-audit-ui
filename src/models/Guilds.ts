interface GuildByNameData {
    guild_name: string
    server_name: string
    character_count: number
    avg_top_10_percent_last_update_epoch: number
}

interface GetGuildsByNameResponse {
    data: GuildByNameData[]
}

export type { GuildByNameData, GetGuildsByNameResponse }
