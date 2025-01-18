const RANSACK_HOURS = 168
const RANSACK_THRESHOLD = 7
const MIN_LEVEL = 1
const MAX_LEVEL = 34

const CLASS_LIST = [
    "Barbarian",
    "Bard",
    "Cleric",
    "Fighter",
    "Paladin",
    "Ranger",
    "Rogue",
    "Sorcerer",
    "Wizard",
    "Monk",
    "Favored Soul",
    "Artificer",
    "Druid",
    "Warlock",
    "Alchemist",
]

const CLASS_LIST_LOWER = CLASS_LIST.map((c) => c.toLowerCase())

export {
    RANSACK_HOURS,
    RANSACK_THRESHOLD,
    MIN_LEVEL,
    MAX_LEVEL,
    CLASS_LIST,
    CLASS_LIST_LOWER,
}
