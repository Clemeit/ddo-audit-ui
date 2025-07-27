import { BoundingBox } from "../models/Geometry.ts"
import { SPRITE_MAP } from "./spriteMap.ts"

const DEFAULT_LFM_PANEL_WIDTH = 848
const MINIMUM_LFM_PANEL_WIDTH = 600
const MAXIMUM_LFM_PANEL_WIDTH = 1600
const LFM_HEIGHT = 90
const LFM_PADDING = {
    top: 0,
    right: 5,
    bottom: 0,
    left: 5,
}
const MINIMUM_LFM_COUNT = 6

const LFM_PANEL_TOP_BORDER_HEIGHT =
    SPRITE_MAP.HEADER_BAR.height + SPRITE_MAP.CONTENT_TOP.height

const LFM_PANEL_BOTTOM_BORDER_HEIGHT = SPRITE_MAP.CONTENT_BOTTOM.height

const TOTAL_LFM_PANEL_BORDER_HEIGHT =
    LFM_PANEL_TOP_BORDER_HEIGHT + LFM_PANEL_BOTTOM_BORDER_HEIGHT

const SORT_HEADER_HEIGHT = SPRITE_MAP.SORT_HEADER.CENTER.height

const LFM_AREA_PADDING = {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
}

const LFM_TOP_PADDING =
    LFM_PANEL_TOP_BORDER_HEIGHT + SORT_HEADER_HEIGHT + LFM_AREA_PADDING.top + 1
const LFM_LEFT_PADDING = SPRITE_MAP.CONTENT_LEFT.width + LFM_AREA_PADDING.left

const QUEST_INFO_GAP = 5

const DEFAULT_BASE_FONT_SIZE = 14
const MINIMUM_MOUSE_OVER_DELAY = 50
const DEFAULT_MOUSE_OVER_DELAY = 250
const MAXIMUM_MOUSE_OVER_DELAY = 1000
const DOUBLE_CLICK_DELAY = 300
const DOUBLE_CLICK_DISTANCE_THRESHOLD = 75

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
    MISC_INFO_MESSAGE: `italic ${baseFontSize + 6}px 'Trebuchet MS`,
})

const LFM_COLORS = {
    BLACK_BACKGROUND: "#040404",
    ELIGIBLE_GRADIENT_CENTER: "#4C4A31",
    ELIGIBLE_GRADIENT_EDGE: "#3B3827",
    INELIGIBLE_FILL: "#150A06",
    FRIEND_GRADIENT_CENTER: "#3e5531ff",
    FRIEND_GRADIENT_EDGE: "#2e3b23ff",
    INELIGIBLE_FRIEND_GRADIENT_CENTER: "#151d11ff",
    INELIGIBLE_FRIEND_GRADIENT_EDGE: "#11160eff",
    ELIGIBLE_RAID_GRADIENT_CENTER: "#e9a880ff",
    ELIGIBLE_RAID_GRADIENT_EDGE: "#884213ff",
    INELIGIBLE_RAID_GRADIENT_CENTER: "#a17559ff",
    INELIGIBLE_RAID_GRADIENT_EDGE: "#5e2e0eff",
    LFM_BORDER: "#898E6F",
    ADVENTURE_ACTIVE: "#02ADFB",
    LFM_POSTED: "#CC7116",
    LFM_EXPIRED: "#02ADFB",
    LEADER_NAME: "#F3EDCD",
    STANDARD_TEXT: "#e0dbd2",
    COMMENT_TEXT: "#BFBFBF",
    SECONDARY_TEXT: "#B6B193",
    GUESS_TEXT: "#D3F6F6",
    ELIGIBILITY_DIVIDER: "#f6e8d3ff",
}

const OVERLAY_COLORS = {
    OUTER_BORDER: "#ADA653",
    INNER_BORDER: "#5E6F4C",
    SIDE_BAR: "#938E57",
    CHARACTER_GRADIENT_CENTER: "#4E5956",
    CHARACTER_GRADIENT_EDGE: "#404947",
    FRIEND_GRADIENT_CENTER: "#425736ff",
    FRIEND_GRADIENT_EDGE: "#2e3a25ff",
    BLACK_BACKGROUND: "#060605",
    MEMBER_NAME: "#F3EDCD",
    MEMBER_LOCATION: "#DBD6A8",
    MEMBER_CLASS_LEVEL: "#FFFFFF",
    MEMBER_TOTAL_LEVEL: "#F3EDCD",
    COMMENT: "#BFBFBF",
    ACTIVITY_POSTED: "#4dacbf",
    ACTIVITY_MEMBER_JOINED: "#99bf9f",
    ACTIVITY_MEMBER_LEFT: "#bf9999",
    ACTIVITY_QUEST: "#bf9d73",
    ACTIVITY_COMMENT: "#BFBFBF",
    SECONDARY_TEXT: "#999999",
    QUEST_INFO: "#e0e0e0",
}

const OVERLAY_WIDTH = 287
const OVERLAY_SIDE_BAR_WIDTH = 6
const OVERLAY_CHARACTER_HEIGHT = 41
const OVERLAY_CHARACTER_HEIGHT_WITH_GUILD_NAME = 58
const OVERLAY_CHARACTER_WIDTH = 272
const OVERLAY_ACTIVITY_LEFT_PADDING = 50
const MAXIMUM_ACTIVITY_EVENTS = 11
const OVERLAY_QUEST_INFO_SPACING = 20
const OVERLAY_QUEST_INFO_LEFT_GAP = 120

const OVERLAY_FONTS = {
    MEMBER_NAME: "16px 'Trebuchet MS'",
    MEMBER_GUILD_NAME: "italic 14px 'Trebuchet MS'",
    MEMBER_LOCATION: "13px 'Trebuchet MS'",
    MEMBER_CLASS_LEVEL: "14px 'Trebuchet MS'",
    MEMBER_CLASS_LEVEL_BOLD: "bold 14px 'Trebuchet MS'",
    MEMBER_TOTAL_LEVEL: "16px 'Trebuchet MS'",
    COMMENT: "14px 'Trebuchet MS'",
    ACTIVITY: "14px 'Trebuchet MS'",
    ACTIVITY_COMMENT: "italic 14px 'Trebuchet MS'",
    QUEST_INFO_HEADER: "bold 16px 'Trebuchet MS'",
    QUEST_INFO: "16px 'Trebuchet MS'",
}

interface SortHeaderData {
    type: string
    boundingBox: BoundingBox
    displayText: string
}

const SORT_HEADERS = (commonBoundingBoxes): SortHeaderData[] => [
    {
        type: "leader",
        boundingBox: commonBoundingBoxes.mainPanelBoundingBox,
        displayText: "Leader Name",
    },
    {
        type: "quest",
        boundingBox: commonBoundingBoxes.questPanelBoundingBox,
        displayText: "Quest",
    },
    {
        type: "classes",
        boundingBox: commonBoundingBoxes.classPanelBoundingBox,
        displayText: "Classes Needed",
    },
    {
        type: "level",
        boundingBox: commonBoundingBoxes.levelPanelBoundingBox,
        displayText: "Lvl",
    },
]

const HARD_EXPRESSION = /\b(hard|h|eh)\b/i
const ELITE_EXPRESSION = /\b(elite|e|ee)\b/i
const REAPER_EXPRESSION = /\b(reaper|r|re)/i
const SKULL_EXPRESSION = /\b(r|r |reaper|reaper )(\d+)\b(\+)?/i

export {
    DEFAULT_LFM_PANEL_WIDTH,
    MINIMUM_LFM_PANEL_WIDTH,
    MAXIMUM_LFM_PANEL_WIDTH,
    LFM_HEIGHT,
    LFM_PADDING,
    LFM_COLORS,
    DEFAULT_BASE_FONT_SIZE,
    TOTAL_LFM_PANEL_BORDER_HEIGHT,
    LFM_PANEL_TOP_BORDER_HEIGHT,
    LFM_PANEL_BOTTOM_BORDER_HEIGHT,
    SORT_HEADER_HEIGHT,
    LFM_AREA_PADDING,
    MINIMUM_LFM_COUNT,
    QUEST_INFO_GAP,
    LFM_TOP_PADDING,
    LFM_LEFT_PADDING,
    OVERLAY_FONTS,
    FONTS,
    SORT_HEADERS,
    OVERLAY_COLORS,
    OVERLAY_WIDTH,
    OVERLAY_SIDE_BAR_WIDTH,
    OVERLAY_CHARACTER_HEIGHT,
    OVERLAY_CHARACTER_WIDTH,
    DEFAULT_MOUSE_OVER_DELAY,
    MINIMUM_MOUSE_OVER_DELAY,
    MAXIMUM_MOUSE_OVER_DELAY,
    OVERLAY_ACTIVITY_LEFT_PADDING,
    MAXIMUM_ACTIVITY_EVENTS,
    OVERLAY_CHARACTER_HEIGHT_WITH_GUILD_NAME,
    OVERLAY_QUEST_INFO_SPACING,
    OVERLAY_QUEST_INFO_LEFT_GAP,
    HARD_EXPRESSION,
    ELITE_EXPRESSION,
    REAPER_EXPRESSION,
    SKULL_EXPRESSION,
    DOUBLE_CLICK_DELAY,
    DOUBLE_CLICK_DISTANCE_THRESHOLD,
}
