import { getServerColor as getServerColorFromLookup } from "../../utils/chartUtils.ts"

/**
 * Creates a color function that handles highlighting and transparency for chart series
 * @param highlightedSeries - The currently highlighted series ID, if any
 * @returns A function that returns the appropriate color for a given series ID
 */
export const createHighlightColorFunction = (highlightedSeries?: string) => {
    return (serverId: string): string => {
        if (!highlightedSeries) {
            return getServerColorFromLookup(serverId)
        }

        if (serverId === highlightedSeries) {
            return getServerColorFromLookup(serverId)
        }

        // Use the proper color but with transparency for non-highlighted series
        const color = getServerColorFromLookup(serverId)

        if (color.startsWith("hsl")) {
            return color.replace("hsl", "hsla").replace(")", ", 0.1)")
        }

        return color.replace("rgba", "rgba").replace(")", ", 0.1)")
    }
}
