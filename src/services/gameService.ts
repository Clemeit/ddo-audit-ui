import { ServerInfo, ServerInfoApiDataModel } from "../models/Game.ts"
import { getRequest, ServiceRequestProps } from "./apiHelper.ts"

const GAME_ENDPOINT = "game"

function getServerInfo(signal?: AbortSignal): Promise<ServerInfoApiDataModel> {
    return getRequest(`${GAME_ENDPOINT}/server-info`, { signal })
}

function getServerInfoByServerName(
    serverName: string,
    signal?: AbortSignal
): Promise<ServerInfo> {
    return getRequest(`${GAME_ENDPOINT}/server-info/${serverName}`, { signal })
}

export { getServerInfo, getServerInfoByServerName }
