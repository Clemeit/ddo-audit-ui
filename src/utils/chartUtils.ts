import { SERVER_COLORS } from "../constants/charts"
import { getServerIndex } from "../constants/servers"

function getServerColor(serverName: string): string {
    if (serverName.toLowerCase() === "all") {
        return "var(--blue1)"
    }
    const index = getServerIndex(serverName)
    if (index === -1) {
        return "hsl(0, 0%, 100%)"
    }
    return SERVER_COLORS[index] || "hsl(0, 0%, 100%)"
}

export { getServerColor }
