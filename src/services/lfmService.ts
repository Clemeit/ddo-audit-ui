import { getRequest } from "./apiHelper.ts"

const LFM_ENDPOINT = "lfms"

function getAllLfms() {
    return getRequest(`${LFM_ENDPOINT}`)
}

function getLfmsByServerName(serverName: string) {
    return getRequest(`${LFM_ENDPOINT}/${serverName.toLowerCase()}`)
}

export { getAllLfms, getLfmsByServerName }
