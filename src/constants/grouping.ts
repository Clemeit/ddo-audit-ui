const DEFAULT_GROUPING_PANEL_WIDTH = 848
const MINIMUM_GROUPING_PANEL_WIDTH = 600
const MAXIMUM_GROUPING_PANEL_WIDTH = 1600
const LFM_HEIGHT = 90
const LFM_PADDING = {
    top: 0,
    right: 5,
    bottom: 0,
    left: 5,
}

const GROUPING_SPRITE_MAP = {
    HEADER_LEFT: {
        x: 0,
        y: 0,
        width: 46,
        height: 27,
    },
    HEADER_RIGHT: {
        x: 46,
        y: 0,
        width: 15,
        height: 27,
    },
    HEADER_BAR: {
        x: 61,
        y: 0,
        width: 87,
        height: 27,
    },
    CONTENT_TOP_LEFT: {
        x: 0,
        y: 27,
        width: 12,
        height: 11,
    },
    CONTENT_TOP_RIGHT: {
        x: 50,
        y: 27,
        width: 11,
        height: 11,
    },
    CONTENT_BOTTOM_LEFT: {
        x: 0,
        y: 46,
        width: 12,
        height: 12,
    },
    CONTENT_BOTTOM_RIGHT: {
        x: 50,
        y: 46,
        width: 11,
        height: 12,
    },
    CONTENT_TOP: {
        x: 12,
        y: 27,
        width: 38,
        height: 11,
    },
    CONTENT_LEFT: {
        x: 0,
        y: 38,
        width: 12,
        height: 8,
    },
    CONTENT_BOTTOM: {
        x: 12,
        y: 46,
        width: 38,
        height: 12,
    },
    CONTENT_RIGHT: {
        x: 50,
        y: 38,
        width: 11,
        height: 8,
    },
    CONTENT_HANDLE: {
        x: 61,
        y: 32,
        width: 13,
        height: 14,
    },
    CLASSES: {
        ALL: {
            x: 0,
            y: 58,
            width: 104,
            height: 62,
        },
        BARBARIAN: {
            x: 0,
            y: 58,
            width: 20,
            height: 20,
        },
        BARD: {
            x: 21,
            y: 58,
            width: 20,
            height: 20,
        },
        CLERIC: {
            x: 42,
            y: 58,
            width: 20,
            height: 20,
        },
        FIGHTER: {
            x: 63,
            y: 58,
            width: 20,
            height: 20,
        },
        PALADIN: {
            x: 84,
            y: 58,
            width: 20,
            height: 20,
        },
        RANGER: {
            x: 0,
            y: 79,
            width: 20,
            height: 20,
        },
        ROGUE: {
            x: 21,
            y: 79,
            width: 20,
            height: 20,
        },
        SORCERER: {
            x: 42,
            y: 79,
            width: 20,
            height: 20,
        },
        WIZARD: {
            x: 63,
            y: 79,
            width: 20,
            height: 20,
        },
        MONK: {
            x: 84,
            y: 79,
            width: 20,
            height: 20,
        },
        FAVORED_SOUL: {
            x: 0,
            y: 100,
            width: 20,
            height: 20,
        },
        ARTIFICER: {
            x: 21,
            y: 100,
            width: 20,
            height: 20,
        },
        DRUID: {
            x: 42,
            y: 100,
            width: 20,
            height: 20,
        },
        WARLOCK: {
            x: 63,
            y: 100,
            width: 20,
            height: 20,
        },
        ALCHEMIST: {
            x: 84,
            y: 100,
            width: 20,
            height: 20,
        },
    },
}

const TOTAL_GROUPING_PANEL_BORDER_HEIGHT =
    GROUPING_SPRITE_MAP.HEADER_BAR.height +
    GROUPING_SPRITE_MAP.CONTENT_TOP.height +
    GROUPING_SPRITE_MAP.CONTENT_BOTTOM.height

const DEFAULT_BASE_FONT_SIZE = 14

const FONTS = (baseFontSize: number = DEFAULT_BASE_FONT_SIZE) => ({
    LEADER_NAME: `${baseFontSize + 2}px 'Trebuchet MS'`,
    QUEST_NAME: `${baseFontSize + 4}px Arial`,
    QUEST_GUESS_NAME: `italic ${baseFontSize + 4}px Arial`,
    COMMENT: `${baseFontSize}px Arial`,
    TIP: `italic ${baseFontSize}px Arial`,
    MEMBER_COUNT: `${baseFontSize}px Arial`,
    LEVEL_RANGE: `${baseFontSize + 2}px Arial`,
})

const GROUPING_COLORS = {
    BLACK_BACKGROUND: "#040404",
    ELIGIBLE_GRADIENT_CENTER: "#4C4A31",
    ELIGIBLE_GRADIENT_EDGE: "#3B3827",
    INELIGIBLE_FILL: "#120704",
    LFM_BORDER: "#898E6F",
    ADVENTURE_ACTIVE: "#02ADFB",
    LFM_EXPIRED: "#02ADFB",
    LEADER_NAME: "#F3EDCD",
    STANDARD_TEXT: "#e0dbd2",
    COMMENT_TEXT: "#BFBFBF",
    SECONDARY_TEXT: "#B6B193",
    GUESS_TEXT: "#D3F6F6",
}

export {
    DEFAULT_GROUPING_PANEL_WIDTH,
    MINIMUM_GROUPING_PANEL_WIDTH,
    MAXIMUM_GROUPING_PANEL_WIDTH,
    LFM_HEIGHT,
    LFM_PADDING,
    GROUPING_SPRITE_MAP,
    GROUPING_COLORS,
    DEFAULT_BASE_FONT_SIZE,
    TOTAL_GROUPING_PANEL_BORDER_HEIGHT,
    FONTS,
}
