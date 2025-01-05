const DEFAULT_GROUPING_PANEL_WIDTH = 848
const LFM_HEIGHT = 90
const LFM_PADDING = {
    top: 0,
    right: 5,
    bottom: 0,
    left: 7,
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
        y: 26,
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
}

const DEFAULT_BASE_FONT_SIZE = 14

const FONTS = (baseFontSize: number = DEFAULT_BASE_FONT_SIZE) => ({
    LEADER_NAME: `${baseFontSize + 2}px 'Trebuchet MS'`,
    QUEST_NAME: `${baseFontSize + 4}px Arial`,
    COMMENT: `${baseFontSize}px Arial`,
    MEMBER_COUNT: `${baseFontSize}px Arial`,
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
    SECONDARY_TEXT: "#B6B193",
}

export {
    DEFAULT_GROUPING_PANEL_WIDTH,
    LFM_HEIGHT,
    LFM_PADDING,
    GROUPING_SPRITE_MAP,
    GROUPING_COLORS,
    DEFAULT_BASE_FONT_SIZE,
    FONTS,
}
