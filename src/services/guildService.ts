import { GetGuildsByNameResponse } from "../models/Guilds.ts"
import { getRequest } from "./apiHelper.ts"

const GUILD_ENDPOINT = "guilds"

function getGuildsByName(
    guildName: string,
    signal?: AbortSignal
): Promise<GetGuildsByNameResponse> {
    return getRequest<GetGuildsByNameResponse>(
        `${GUILD_ENDPOINT}/by-name/${guildName}`,
        { signal }
    )
}

export { getGuildsByName }
