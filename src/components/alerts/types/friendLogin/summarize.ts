import { FriendLoginCriteria } from "../../../../models/Alert"

const MAX_NAMES_LISTED = 3
const MAX_FRIENDS = 50

function listNames(
    ids: number[],
    characterName: (id: number) => string | undefined
): string {
    const names = ids.map((id) => characterName(id) ?? "Unknown character")
    if (names.length <= MAX_NAMES_LISTED) return names.join(", ")
    const rest = names.length - MAX_NAMES_LISTED
    return `${names.slice(0, MAX_NAMES_LISTED).join(", ")} and ${rest} more`
}

function friendsText(
    criteria: FriendLoginCriteria,
    characterName: (id: number) => string | undefined
): string {
    return criteria.all_friends
        ? "Any of my friends"
        : listNames(criteria.character_ids ?? [], characterName)
}

/** One-line description, e.g. "Somebody, Someone logs in". */
function summarizeFriendLogin(
    criteria: FriendLoginCriteria,
    characterName: (id: number) => string | undefined
): string {
    return `${friendsText(criteria, characterName)} logs in`
}

function describeFriendLogin(
    criteria: FriendLoginCriteria,
    characterName: (id: number) => string | undefined
): { title: string; chips: string[] } {
    const count = criteria.character_ids?.length ?? 0
    return {
        title: friendsText(criteria, characterName),
        chips: [
            criteria.all_friends
                ? "Whole friends list"
                : `${count} friend${count === 1 ? "" : "s"}`,
        ],
    }
}

function validateFriendLogin(criteria: FriendLoginCriteria): string | null {
    if (criteria.all_friends) return null
    if (!criteria.character_ids?.length)
        return "Choose at least one friend, or all friends."
    if (criteria.character_ids.length > MAX_FRIENDS)
        return `Choose at most ${MAX_FRIENDS} friends.`
    return null
}

function defaultFriendLoginCriteria(): FriendLoginCriteria {
    return { all_friends: true, character_ids: [] }
}

export {
    summarizeFriendLogin,
    describeFriendLogin,
    validateFriendLogin,
    defaultFriendLoginCriteria,
}
