import {
    GetGuildByServerAndNameResponse,
    GuildDataApiResponse,
} from "../models/Guilds.ts"
import { getRequest } from "./apiHelper.ts"

const GUILD_ENDPOINT = "guilds"

function getGuilds(
    guildName?: string,
    serverName?: string,
    page?: number,
    signal?: AbortSignal
): Promise<GuildDataApiResponse> {
    let params = {}
    if (guildName) {
        params = { ...params, name: guildName }
    }
    if (serverName) {
        params = { ...params, server: serverName }
    }
    if (page && page > 1) {
        params = { ...params, page }
    }
    return getRequest<GuildDataApiResponse>(GUILD_ENDPOINT, {
        signal,
        params,
    })
}

function getGuildByName(
    serverName: string,
    guildName: string,
    options: { headers?: any; params?: any; signal?: AbortSignal } = {}
): Promise<GetGuildByServerAndNameResponse> {
    return getRequest<GetGuildByServerAndNameResponse>(
        `${GUILD_ENDPOINT}/${serverName}/${guildName}`,
        options
    )
}

export { getGuilds, getGuildByName }
