import {
    AlertInboxResponse,
    AlertRuleInput,
    AlertRuleResponse,
    AlertRulesResponse,
} from "../models/Alert"
import { deleteRequest, getRequest, postRequest, putRequest } from "./apiHelper"

const ALERTS_ENDPOINT = "user/alerts"

function authed(accessToken: string, signal?: AbortSignal) {
    return {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
        withCredentials: true,
    }
}

function getAlertRules(
    accessToken: string,
    signal?: AbortSignal
): Promise<AlertRulesResponse> {
    return getRequest<AlertRulesResponse>(
        `${ALERTS_ENDPOINT}/rules`,
        authed(accessToken, signal)
    )
}

function createAlertRule(
    accessToken: string,
    rule: AlertRuleInput,
    signal?: AbortSignal
): Promise<AlertRuleResponse> {
    return postRequest<AlertRuleResponse>(`${ALERTS_ENDPOINT}/rules`, {
        ...authed(accessToken, signal),
        data: rule,
        noRetry: true,
    })
}

function updateAlertRule(
    accessToken: string,
    ruleId: number,
    rule: AlertRuleInput,
    signal?: AbortSignal
): Promise<AlertRuleResponse> {
    return putRequest<AlertRuleResponse>(`${ALERTS_ENDPOINT}/rules/${ruleId}`, {
        ...authed(accessToken, signal),
        data: rule,
    })
}

function deleteAlertRule(
    accessToken: string,
    ruleId: number,
    signal?: AbortSignal
): Promise<{ data: { deleted: boolean } }> {
    return deleteRequest(
        `${ALERTS_ENDPOINT}/rules/${ruleId}`,
        authed(accessToken, signal)
    )
}

/**
 * Alerts delivered after `after`. Without `after` the server returns no alerts and the latest ID,
 * which is where the caller should start, so nothing old is replayed on page load.
 */
function getAlertInbox(
    accessToken: string,
    after?: string,
    signal?: AbortSignal
): Promise<AlertInboxResponse> {
    return getRequest<AlertInboxResponse>(`${ALERTS_ENDPOINT}/inbox`, {
        ...authed(accessToken, signal),
        params: after ? { after } : undefined,
        noRetry: true,
    })
}

function sendTestAlert(
    accessToken: string,
    signal?: AbortSignal
): Promise<{ data: { queued: boolean } }> {
    return postRequest(`${ALERTS_ENDPOINT}/test`, {
        ...authed(accessToken, signal),
        noRetry: true,
    })
}

export {
    getAlertRules,
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
    getAlertInbox,
    sendTestAlert,
}
