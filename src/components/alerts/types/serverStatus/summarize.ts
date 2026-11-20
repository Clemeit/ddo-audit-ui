import { ServerStatusCriteria } from "../../../../models/Alert"
import { serversText } from "../../shared/ServerPills"

function directionText(criteria: ServerStatusCriteria): string {
    if (criteria.on_offline && criteria.on_online)
        return "Goes offline or comes online"
    return criteria.on_offline ? "Goes offline" : "Comes online"
}

/** One-line description, e.g. "Thrane, Cormyr · goes offline". */
function summarizeServerStatus(criteria: ServerStatusCriteria): string {
    return `${serversText(criteria.server_names)} · ${directionText(criteria).toLowerCase()}`
}

function describeServerStatus(criteria: ServerStatusCriteria): {
    title: string
    chips: string[]
} {
    return {
        title: serversText(criteria.server_names),
        chips: [directionText(criteria)],
    }
}

function validateServerStatus(criteria: ServerStatusCriteria): string | null {
    if (!criteria.on_offline && !criteria.on_online)
        return "Choose going offline, coming online, or both."
    return null
}

function defaultServerStatusCriteria(): ServerStatusCriteria {
    return { server_names: [], on_offline: true, on_online: true }
}

export {
    summarizeServerStatus,
    describeServerStatus,
    validateServerStatus,
    defaultServerStatusCriteria,
}
