import { ServerInfoApiDataModel } from "../models/Game.ts"

function getDefaultServerName(serverData: ServerInfoApiDataModel): string {
    const entry = Object.entries(serverData || {}).find(
        ([_, data]) => data?.index === 0
    )
    return entry ? entry[0] : ""
}

export { getDefaultServerName }
