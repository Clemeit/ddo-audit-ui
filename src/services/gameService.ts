import { getRequest, ServiceRequestProps } from "./apiHelper.ts"

const GAME_ENDPOINT = "game"

function getServerInfo({ signal }: ServiceRequestProps) {
    return getRequest(`${GAME_ENDPOINT}/server-info`, { signal })
}

function getServerInfoByServerName(serverName: string, signal?: AbortSignal) {
    return getRequest(`${GAME_ENDPOINT}/server-info/${serverName}`, { signal })
}

export { getServerInfo, getServerInfoByServerName }
