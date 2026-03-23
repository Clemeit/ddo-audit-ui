import type { Character } from "../models/Character.ts"
import { getCharactersByIds } from "../services/characterService.ts"
import logMessage from "./logUtils.ts"

async function attemptHydration(
    ids: number[],
    signal?: AbortSignal
): Promise<Character[]> {
    const expectedIds = Array.from(
        new Set(
            ids.filter((id): id is number => typeof id === "number" && id > 0)
        )
    )
    const expectedIdSet = new Set(expectedIds)

    const response = await getCharactersByIds(expectedIds, { signal })
    const hydratedCharacters = Object.values(response.data || {}).filter(
        (c): c is Character =>
            c != null && typeof c === "object" && typeof c.id === "number"
    )

    const returnedById = new Map<number, Character>()
    for (const character of hydratedCharacters) {
        if (!returnedById.has(character.id)) {
            returnedById.set(character.id, character)
        }
    }

    const returnedIdSet = new Set(returnedById.keys())
    const missingIds = expectedIds.filter((id) => !returnedIdSet.has(id))
    const unexpectedIds = Array.from(returnedIdSet).filter(
        (id) => !expectedIdSet.has(id)
    )

    if (missingIds.length > 0 || unexpectedIds.length > 0) {
        logMessage("Character hydration returned mismatched IDs", "warn", {
            metadata: {
                expectedIds,
                returnedIds: Array.from(returnedIdSet),
                missingIds,
                unexpectedIds,
            },
        })
        throw new Error("Character hydration response ID mismatch")
    }

    return expectedIds
        .map((id) => returnedById.get(id))
        .filter((character): character is Character => Boolean(character))
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
    const dedupedIds = Array.from(
        new Set(
            ids.filter((id): id is number => typeof id === "number" && id > 0)
        )
    )

    if (dedupedIds.length === 0) return []

    try {
        return await attemptHydration(dedupedIds, signal)
    } catch (firstError) {
        if ((firstError as { name?: string })?.name === "AbortError") {
            return null
        }
        if (signal?.aborted) return null

        logMessage("Character hydration failed, retrying once", "warn", {
            metadata: {
                ids: dedupedIds,
                error:
                    firstError instanceof Error
                        ? firstError.message
                        : String(firstError),
            },
        })

        try {
            return await attemptHydration(dedupedIds, signal)
        } catch (secondError) {
            if ((secondError as { name?: string })?.name === "AbortError") {
                return null
            }
            if (signal?.aborted) return null

            logMessage(
                "Character hydration failed after retry, keeping existing local data",
                "warn",
                {
                    metadata: {
                        ids: dedupedIds,
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
