import { NewsResponse } from "../models/Service.ts"
import {
    ConfigEndpointResponse,
    SingleConfigEndpointResponse,
} from "../models/Config.ts"
import { getRequest, postRequest } from "./apiHelper.ts"
import {
    FeedbackEndpointResponse,
    FeedbackMessage,
} from "../models/Feedback.ts"
import { LogRequest } from "../models/Log.ts"

const SERVICE_PATH = "service"
const SERVICE_ENDPOINT = `${SERVICE_PATH}/news`
const CONFIG_ENDPOINT = `${SERVICE_PATH}/config`
const FEEDBACK_ENDPOINT = `${SERVICE_PATH}/feedback`
const LOG_ENDPOINT = `${SERVICE_PATH}/log`

function getNews(signal?: AbortSignal): Promise<NewsResponse> {
    return getRequest(SERVICE_ENDPOINT, { signal })
}

function getConfig(signal?: AbortSignal): Promise<ConfigEndpointResponse> {
    return getRequest<ConfigEndpointResponse>(`${CONFIG_ENDPOINT}`, { signal })
}

function getConfigByKey(
    key: string,
    signal?: AbortSignal
): Promise<SingleConfigEndpointResponse> {
    return getRequest<SingleConfigEndpointResponse>(
        `${CONFIG_ENDPOINT}/${key}`,
        {
            signal,
        }
    )
}

function postFeedback(
    feedback: FeedbackMessage
): Promise<FeedbackEndpointResponse> {
    return postRequest(FEEDBACK_ENDPOINT, {
        data: feedback,
        headers: {
            "Content-Type": "application/json",
        },
    })
}

function postLog(log: LogRequest) {
    return postRequest(LOG_ENDPOINT, {
        data: log,
        headers: {
            "Content-Type": "application/json",
        },
        noRetry: true,
    })
}

export { getNews, getConfig, getConfigByKey, postFeedback, postLog }
