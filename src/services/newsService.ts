import { NewsResponse } from "../models/Service.ts"
import { getRequest } from "./apiHelper.ts"

const SERVICE_ENDPOINT = "service/news"

function getNews(signal?: AbortSignal): Promise<NewsResponse> {
    return getRequest(SERVICE_ENDPOINT, { signal })
}

export { getNews }
