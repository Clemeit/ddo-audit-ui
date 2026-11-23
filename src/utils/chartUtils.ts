import { RETIRED_SERVER_COLORS, SERVER_COLORS } from "../constants/charts"
import { getServerIndex } from "../constants/servers"

function getServerColor(serverName: string): string {
    const index = getServerIndex(serverName)
    if (index === -1) {
        return (
            RETIRED_SERVER_COLORS[serverName.toLowerCase()] || "hsl(0, 0%, 100%)"
        )
    }
    return SERVER_COLORS[index] || "hsl(0, 0%, 100%)"
}

export { getServerColor }
