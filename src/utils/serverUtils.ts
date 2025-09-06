import { SERVERS_64_BITS_LOWER } from "../constants/servers.ts"
import { ServerInfoApiDataModel } from "../models/Game.ts"

function getDefaultServerName(serverData: ServerInfoApiDataModel): string {
    try {
        if (!serverData) return ""
        if (Object.values(serverData).every((data) => data?.index === 0))
            return "unknown"

        const entry = Object.entries(serverData).find(
            ([serverName, data]) =>
                data?.index === 0 &&
                SERVERS_64_BITS_LOWER.includes(serverName.toLowerCase())
        )
        return entry ? entry[0] : "unknown"
    } catch (error) {
        return "unknown"
    }
}

export { getDefaultServerName }
