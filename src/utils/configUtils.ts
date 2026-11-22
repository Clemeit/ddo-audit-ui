import { ConfigEndpointResponse } from "../models/Config"
import logMessage from "./logUtils"

export const getIsNightRevels = (config: ConfigEndpointResponse): boolean => {
    try {
        const seasonalTheme = config?.data?.["seasonal_theme"]
        return (
            seasonalTheme &&
            seasonalTheme.is_enabled &&
            seasonalTheme.value == "night_revels"
        )
    } catch (error) {
        logMessage("Failed to determine night revels theme", "error", {
            metadata: {
                error: error instanceof Error ? error.message : String(error),
            },
        })
        return false
    }
}

/**
 * A feature flag from the server config table: on when the row exists and is_enabled is true.
 * Missing rows (and no config yet) count as off.
 */
export const getIsFeatureEnabled = (
    config: ConfigEndpointResponse | null | undefined,
    key: string
): boolean => config?.data?.[key]?.is_enabled === true

// Config key that launches the notifications feature: the Directory card and the grouping page link.
// The /notifications route itself always works, so it can be tested before launch.
export const NOTIFICATIONS_FEATURE_KEY = "notifications_enabled"

// Config key that turns on the /trends route (404 until the row exists and is enabled).
export const TRENDS_FEATURE_KEY = "trends_enabled"

export const SHARD_EXCHANGE_FEATURE_KEY = "shard_exchange_shown"
export const SHARD_EXCHANGE_ENABLED_FEATURE_KEY = "shard_exchange_enabled"
