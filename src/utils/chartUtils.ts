import { SERVER_COLORS } from "../constants/charts"
import { getServerIndex } from "../constants/servers"

function getServerColor(serverName: string): string {
    const index = getServerIndex(serverName)
    if (index === -1) {
        return "#fff"
    }
    return SERVER_COLORS[index] || "#fff"
}

export { getServerColor }
