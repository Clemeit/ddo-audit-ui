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
