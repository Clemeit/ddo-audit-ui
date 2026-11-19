import { deleteRequest, getRequest, postRequest } from "./apiHelper"

interface VapidKeyResponse {
    data: { public_key: string }
}

function authed(accessToken: string, signal?: AbortSignal) {
    return {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
        withCredentials: true,
    }
}

function getVapidPublicKey(signal?: AbortSignal): Promise<VapidKeyResponse> {
    return getRequest<VapidKeyResponse>("push/vapid-public-key", { signal })
}

/** Save this browser's subscription (the result of PushSubscription.toJSON()). */
function savePushSubscription(
    accessToken: string,
    subscription: PushSubscriptionJSON,
    signal?: AbortSignal
): Promise<{ data: { saved: boolean } }> {
    return postRequest("user/push-subscriptions", {
        ...authed(accessToken, signal),
        data: subscription,
        noRetry: true,
    })
}

function deletePushSubscription(
    accessToken: string,
    endpoint: string,
    signal?: AbortSignal
): Promise<{ data: { deleted: boolean } }> {
    return deleteRequest("user/push-subscriptions", {
        ...authed(accessToken, signal),
        data: { endpoint },
        noRetry: true,
    })
}

export { getVapidPublicKey, savePushSubscription, deletePushSubscription }
