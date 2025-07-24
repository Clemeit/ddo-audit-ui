import { ServerInfoApiDataModel } from "../models/Game.ts"

function getDefaultServerName(serverData: ServerInfoApiDataModel): string {
    try {
        if (!serverData) return ""
        if (Object.values(serverData).every((data) => data?.index === 0))
            return "unknown"

        const entry = Object.entries(serverData).find(
            ([_, data]) => data?.index === 0
        )
        return entry ? entry[0] : "unknown"
    } catch (error) {
        return "unknown"
    }
}

export { getDefaultServerName }
