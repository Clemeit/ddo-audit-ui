import { BoundingBox } from "../models/Geometry.ts"
import { SPRITE_MAP } from "../constants/spriteMap.ts"
import {
    CLASS_COLUMN_WIDTH,
    CLASS_FILTER_GAP,
    FILTER_ZONE_CONTENT_HEIGHT,
    FILTER_ZONE_MARGIN,
    FILTER_ZONE_PADDING,
    HEADER_HEIGHT,
    INPUT_BOX_HEIGHT,
    LEVEL_COLUMN_WIDTH,
    LFM_COLUMN_WIDTH,
    SORT_HEADER_PADDING_TOP,
} from "../constants/whoPanel.ts"
import { CLASS_LIST, CLASS_LIST_LOWER } from "../constants/game.ts"
import { Character } from "../models/Character.ts"

const calculateCommonFilterBoundingBoxes = (panelWidth: number) => {
    const filterZoneX = SPRITE_MAP.CONTENT_TOP_LEFT.width + FILTER_ZONE_MARGIN
    const filterZoneY =
        SPRITE_MAP.HEADER_BAR.height +
        SPRITE_MAP.CONTENT_TOP.height +
        FILTER_ZONE_MARGIN
    const filterZoneWidth =
        panelWidth -
        SPRITE_MAP.CONTENT_TOP_LEFT.width -
        SPRITE_MAP.CONTENT_TOP_RIGHT.width -
        FILTER_ZONE_MARGIN * 2
    const filterZoneHeight =
        FILTER_ZONE_CONTENT_HEIGHT + FILTER_ZONE_PADDING * 2
    const filterZone = new BoundingBox(
        filterZoneX,
        filterZoneY,
        filterZoneWidth,
        filterZoneHeight
    )

    const totalClassFilterWidth =
        CLASS_LIST_LOWER.length *
        (SPRITE_MAP.CLASS_FILTER.FIGHTER.width + CLASS_FILTER_GAP)
    const filterZoneOffsetX =
        SPRITE_MAP.CONTENT_LEFT.width +
        SPRITE_MAP.SINGLE_BORDER_LEFT.width +
        FILTER_ZONE_MARGIN +
        (filterZone.width -
            SPRITE_MAP.SINGLE_BORDER_LEFT.width -
            SPRITE_MAP.SINGLE_BORDER_RIGHT.width -
            totalClassFilterWidth) /
            2
    const filterZoneOffsetY =
        SPRITE_MAP.HEADER_BAR.height +
        SPRITE_MAP.CONTENT_TOP.height +
        SPRITE_MAP.SINGLE_BORDER_TOP.height +
        FILTER_ZONE_MARGIN +
        (filterZone.height -
            SPRITE_MAP.SINGLE_BORDER_TOP.height -
            SPRITE_MAP.SINGLE_BORDER_BOTTOM.height -
            FILTER_ZONE_CONTENT_HEIGHT) /
            2

    const filterHeaderTextBoundingBox = new BoundingBox(
        filterZoneOffsetX,
        filterZoneOffsetY,
        0,
        0
    )
    const classFiltersBoundingBox = new BoundingBox(
        filterZoneOffsetX + 2,
        filterZoneOffsetY + 20,
        CLASS_LIST.length *
            (SPRITE_MAP.CLASS_FILTER.FIGHTER.width + CLASS_FILTER_GAP),
        SPRITE_MAP.CLASS_FILTER.FIGHTER.height
    )
    const anyCheckboxBoundingBox = new BoundingBox(
        filterZoneOffsetX + (classFiltersBoundingBox.width * 3) / 4,
        filterZoneOffsetY,
        SPRITE_MAP.CHECKBOX.CHECKED.width,
        SPRITE_MAP.CHECKBOX.CHECKED.height
    )
    const searchHeaderTextBoundingBox = new BoundingBox(
        filterZoneOffsetX,
        classFiltersBoundingBox.y + classFiltersBoundingBox.height + 10,
        filterZoneWidth,
        20
    )
    const searchInputBoxWidth = 260
    const searchInputBoundingBox = new BoundingBox(
        filterZoneOffsetX,
        searchHeaderTextBoundingBox.y + searchHeaderTextBoundingBox.height,
        searchInputBoxWidth,
        INPUT_BOX_HEIGHT
    )
    const levelRangeHeaderTextBoundingBox = new BoundingBox(
        searchHeaderTextBoundingBox.x + searchInputBoxWidth + 20,
        searchHeaderTextBoundingBox.y,
        filterZoneWidth,
        20
    )
    const levelRangeInputBoxWidth = 30
    const levelRangeLowerInputBoundingBox = new BoundingBox(
        levelRangeHeaderTextBoundingBox.x,
        levelRangeHeaderTextBoundingBox.y +
            levelRangeHeaderTextBoundingBox.height,
        levelRangeInputBoxWidth,
        INPUT_BOX_HEIGHT
    )
    const levelRangeHeaderTextToInputGap = 30
    const levelRangeUpperInputBoundingBox = new BoundingBox(
        levelRangeLowerInputBoundingBox.right() +
            levelRangeHeaderTextToInputGap,
        levelRangeLowerInputBoundingBox.y,
        levelRangeInputBoxWidth,
        INPUT_BOX_HEIGHT
    )
    const levelRangeToTextBoundingBox = new BoundingBox(
        levelRangeLowerInputBoundingBox.right(),
        levelRangeLowerInputBoundingBox.y,
        levelRangeHeaderTextToInputGap,
        20
    )

    const groupViewHeaderTextBoundingBox = new BoundingBox(
        levelRangeUpperInputBoundingBox.right() + 22,
        searchHeaderTextBoundingBox.y,
        filterZoneWidth,
        20
    )
    const groupViewCheckboxBoundingBox = new BoundingBox(
        groupViewHeaderTextBoundingBox.x + 32,
        groupViewHeaderTextBoundingBox.y + 18,
        SPRITE_MAP.GROUP_VIEW_CHECKBOX.CHECKED.width,
        SPRITE_MAP.GROUP_VIEW_CHECKBOX.CHECKED.height
    )

    const exactMatchCheckboxBoundingBox = new BoundingBox(
        filterZoneOffsetX,
        searchInputBoundingBox.bottom() + 5,
        SPRITE_MAP.CHECKBOX.CHECKED.width,
        SPRITE_MAP.CHECKBOX.CHECKED.height
    )
    const headerYPosition =
        SPRITE_MAP.HEADER_BAR.height +
        SPRITE_MAP.CONTENT_TOP.height +
        SPRITE_MAP.SINGLE_BORDER_TOP.height +
        SPRITE_MAP.SINGLE_BORDER_BOTTOM.height +
        filterZoneHeight +
        SORT_HEADER_PADDING_TOP
    const lfmHeaderBoundingBox = new BoundingBox(
        SPRITE_MAP.CONTENT_LEFT.width + FILTER_ZONE_MARGIN,
        headerYPosition,
        LFM_COLUMN_WIDTH,
        HEADER_HEIGHT
    )
    const nameHeaderBoundingBox = new BoundingBox(
        lfmHeaderBoundingBox.right(),
        headerYPosition,
        (filterZoneWidth -
            LFM_COLUMN_WIDTH -
            CLASS_COLUMN_WIDTH -
            LEVEL_COLUMN_WIDTH) /
            2,
        HEADER_HEIGHT
    )
    const classHeaderBoundingBox = new BoundingBox(
        nameHeaderBoundingBox.right(),
        headerYPosition,
        CLASS_COLUMN_WIDTH,
        HEADER_HEIGHT
    )
    const levelHeaderBoundingBox = new BoundingBox(
        classHeaderBoundingBox.right(),
        headerYPosition,
        LEVEL_COLUMN_WIDTH,
        HEADER_HEIGHT
    )
    const guildHeaderBoundingBox = new BoundingBox(
        levelHeaderBoundingBox.right(),
        headerYPosition,
        nameHeaderBoundingBox.width,
        HEADER_HEIGHT
    )

    return {
        filterZone,
        filterHeaderTextBoundingBox,
        classFiltersBoundingBox,
        anyCheckboxBoundingBox,
        searchHeaderTextBoundingBox,
        searchInputBoundingBox,
        levelRangeHeaderTextBoundingBox,
        levelRangeLowerInputBoundingBox,
        levelRangeUpperInputBoundingBox,
        levelRangeToTextBoundingBox,
        exactMatchCheckboxBoundingBox,
        lfmHeaderBoundingBox,
        nameHeaderBoundingBox,
        classHeaderBoundingBox,
        levelHeaderBoundingBox,
        guildHeaderBoundingBox,
        filterZoneOffsetX,
        filterZoneOffsetY,
        searchInputBoxWidth,
        levelRangeInputBoxWidth,
        groupViewHeaderTextBoundingBox,
        groupViewCheckboxBoundingBox,
    }
}

function areCharactersEquivalent(
    previous: Character,
    current: Character
): boolean {
    if (previous !== undefined && current === undefined) return false
    if (previous === undefined && current !== undefined) return false
    if (previous.location?.name !== current.location?.name) return false
    if (previous.total_level !== current.total_level) return false
    if (previous.is_in_party !== current.is_in_party) return false
    if (previous.is_anonymous !== current.is_anonymous) return false
    if (previous.name !== current.name) return false
    if (previous.guild_name !== current.guild_name) return false

    return true
}

export { calculateCommonFilterBoundingBoxes, areCharactersEquivalent }
