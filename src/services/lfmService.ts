import { getRequest } from "./apiHelper.ts"

const LFM_ENDPOINT = "lfms"
export const SSE_BASE_URL = "v2/lfms/stream"

function getAllLfms() {
    return getRequest(`${LFM_ENDPOINT}`)
}

function getLfmsByServerName(serverName: string) {
    return getRequest(`${LFM_ENDPOINT}/${serverName.toLowerCase()}`)
}

export { getAllLfms, getLfmsByServerName }
