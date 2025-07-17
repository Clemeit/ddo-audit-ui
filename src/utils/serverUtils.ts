import { ServerInfoApiDataModel } from "../models/Game.ts"

function getDefaultServerName(serverData: ServerInfoApiDataModel): string {
    let defaultServerName = "Unknown"
    Object.entries(serverData || {}).forEach(([serverName, serverData]) => {
        if (serverData && serverData.index === 0) {
            defaultServerName = serverName
        }
    })
    return defaultServerName
}

export { getDefaultServerName }
