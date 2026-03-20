import type { Character } from "../models/Character.ts"
import { getCharactersByIds } from "../services/characterService.ts"
import logMessage from "./logUtils.ts"

async function attemptHydration(
    ids: number[],
    signal?: AbortSignal
): Promise<Character[]> {
    const response = await getCharactersByIds(ids, { signal })
    return Object.values(response.data || {}).filter(
        (c): c is Character =>
            c != null && typeof c === "object" && typeof c.id === "number"
    )
}

/**
 * Fetches full Character objects for a list of IDs.
 * Retries once on failure. Returns null if both attempts fail, so the caller
 * can leave existing local data untouched rather than overwriting with empty.
 */
export async function hydrateCharacterIds(
    ids: number[],
    signal?: AbortSignal
): Promise<Character[] | null> {
    if (ids.length === 0) return []

    try {
        return await attemptHydration(ids, signal)
    } catch (firstError) {
        if ((firstError as { name?: string })?.name === "AbortError") {
            return null
        }
        if (signal?.aborted) return null

        logMessage("Character hydration failed, retrying once", "warn", {
            metadata: {
                ids,
                error:
                    firstError instanceof Error
                        ? firstError.message
                        : String(firstError),
            },
        })

        try {
            return await attemptHydration(ids)
        } catch (secondError) {
            logMessage(
                "Character hydration failed after retry, keeping existing local data",
                "warn",
                {
                    metadata: {
                        ids,
                        error:
                            secondError instanceof Error
                                ? secondError.message
                                : String(secondError),
                    },
                }
            )
            return null
        }
    }
}
