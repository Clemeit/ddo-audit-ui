const DEFAULT_WHO_PANEL_WIDTH = 848
const CHARACTER_HEIGHT = 50
const MINIMUM_CHARACTER_COUNT = 5
const MAXIMUM_CHARACTER_COUNT = 100

const GROUP_COLORS = [
    "#4d3636",
    "#364d3b",
    "#40364d",
    "#4d4536",
    "#364d4a",
    "#4d364a",
    "#454d36",
    "#36404d",
    "#4d363b",
    "#364d36",
    "#3a364d",
    "#4d3f36",
    "#364d44",
    "#49364d",
    "#4b4d36",
    "#36464d",
    "#4d3641",
    "#3c4d36",
]

const DEFAULT_BASE_FONT_SIZE = 14

const FONTS = (baseFontSize: number = DEFAULT_BASE_FONT_SIZE) => ({
    LEADER_NAME: `${baseFontSize + 2}px 'Trebuchet MS'`,
    QUEST_NAME: `${baseFontSize + 4}px Arial`,
    QUEST_GUESS_NAME: `italic ${baseFontSize + 4}px Arial`,
    COMMENT: `${baseFontSize}px Arial`,
    TIP: `italic ${baseFontSize}px Arial`,
    MEMBER_COUNT: `${baseFontSize}px Arial`,
    LEVEL_RANGE: `${baseFontSize + 2}px Arial`,
    MAIN_HEADER: "14px 'Trebuchet MS'",
    SORT_HEADER: "12px 'Trebuchet MS'",
    GROUPS_HIDDEN_MESSAGE: `italic ${baseFontSize + 6}px 'Trebuchet MS`,
})

export {
    DEFAULT_WHO_PANEL_WIDTH,
    GROUP_COLORS,
    CHARACTER_HEIGHT,
    MINIMUM_CHARACTER_COUNT,
    MAXIMUM_CHARACTER_COUNT,
    FONTS,
}
