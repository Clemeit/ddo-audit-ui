const CACHED_CHARACTER_EXPIRY_TIME = 60 * 60 * 1000 // 1 hour
const CACHED_AREAS_EXPIRY_TIME = 24 * 60 * 60 * 1000 // 1 day
const CACHED_QUESTS_EXPIRY_TIME = 24 * 60 * 60 * 1000 // 1 day
const MAX_REGISTERED_CHARACTERS = 20
const MAX_FRIENDS = 30

const DONATE_LINK =
    "https://www.paypal.com/donate/?hosted_button_id=YWG5SJPYLDQXY"
const GITHUB_LINK = "https://github.com/Clemeit/ddo-audit-ui"

// Determine API URL based on environment variables
const getApiUrl = () => {
    const apiPort = process.env.REACT_APP_API_PORT
    const baseUrl = "https://api.ddoaudit.com"

    if (apiPort) {
        // Parse the base URL to get the hostname
        const url = new URL(baseUrl)
        return `${url.protocol}//${url.hostname}:${apiPort}`
    }

    return baseUrl
}

const API_URL = getApiUrl()
// const API_URL = "http://api.localtest.me"
const BETTER_STACK_URL = "https://ddoaudit.betteruptime.com/"
const API_VERSION = "v1"

export {
    CACHED_CHARACTER_EXPIRY_TIME,
    DONATE_LINK,
    GITHUB_LINK,
    API_URL,
    API_VERSION,
    CACHED_AREAS_EXPIRY_TIME,
    CACHED_QUESTS_EXPIRY_TIME,
    MAX_REGISTERED_CHARACTERS,
    MAX_FRIENDS,
    BETTER_STACK_URL,
}
