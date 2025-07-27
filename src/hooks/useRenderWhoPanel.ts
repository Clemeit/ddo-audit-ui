import { useCallback, useMemo } from "react"
import { SPRITE_MAP } from "../constants/spriteMap.ts"
import { useWhoContext } from "../contexts/WhoContext.tsx"
import { FONTS, WHO_COLORS, CLASS_FILTER_GAP } from "../constants/whoPanel.ts"
import useRenderBox from "../utils/renderUtils.ts"
import { BoundingBox } from "../models/Geometry.ts"
import { CLASS_LIST_LOWER } from "../constants/game.ts"
import { Character, CharacterSortType } from "../models/Character.ts"
import { calculateCommonFilterBoundingBoxes } from "../utils/whoUtils.ts"
import { useAreaContext } from "../contexts/AreaContext.tsx"

interface Props {
    sprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
}

interface RenderWhoPanelProps {
    characters?: Character[]
    displayedCharacters?: Character[]
    panelHeight: number
    isLoading: boolean
}

const useRenderWhoPanel = ({ sprite, context }: Props) => {
    const {
        panelWidth,
        classNameFilter,
        isExactMatch,
        sortBy,
        isGroupView,
        onlineRegisteredCharacters,
        isMyGroupView,
    } = useWhoContext()
    const fonts = useMemo(() => FONTS(), [])
    const { renderBox, renderHeader, renderSortHeader } = useRenderBox({
        sprite,
        context,
    })
    const { areas } = useAreaContext()
    const {
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
        groupViewHeaderTextBoundingBox,
        groupViewCheckboxBoundingBox,
    } = useMemo(
        () => calculateCommonFilterBoundingBoxes(panelWidth),
        [panelWidth]
    )

    const renderWhoPanel = useCallback(
        ({
            characters,
            displayedCharacters,
            panelHeight = 0,
            isLoading = false,
        }: RenderWhoPanelProps) => {
            if (!context || !sprite) return
            if (panelHeight === 0) return
            context.imageSmoothingEnabled = false

            context.fillStyle = WHO_COLORS.BLACK_BACKGROUND
            context.fillRect(
                0,
                SPRITE_MAP.HEADER_BAR.height,
                panelWidth,
                panelHeight
            )

            // render the header
            renderHeader({
                boundingBox: new BoundingBox(
                    0,
                    0,
                    panelWidth,
                    SPRITE_MAP.HEADER_BAR.height
                ),
                text: "Who List - DDO Audit",
                font: fonts.MAIN_HEADER,
                left: SPRITE_MAP.HEADER_LEFT,
                center: SPRITE_MAP.HEADER_BAR,
                right: SPRITE_MAP.HEADER_RIGHT,
                textOffsetY: 2,
            })

            // render the border
            renderBox({
                boundingBox: new BoundingBox(
                    0,
                    SPRITE_MAP.HEADER_BAR.height,
                    panelWidth,
                    panelHeight - SPRITE_MAP.HEADER_BAR.height
                ),
                topLeft: SPRITE_MAP.CONTENT_TOP_LEFT,
                topRight: SPRITE_MAP.CONTENT_TOP_RIGHT,
                bottomLeft: SPRITE_MAP.CONTENT_BOTTOM_LEFT,
                bottomRight: SPRITE_MAP.CONTENT_BOTTOM_RIGHT,
                top: SPRITE_MAP.CONTENT_TOP,
                bottom: SPRITE_MAP.CONTENT_BOTTOM,
                right: SPRITE_MAP.CONTENT_RIGHT,
                left: SPRITE_MAP.CONTENT_LEFT,
            })

            // render the filter zone
            renderBox({
                boundingBox: filterZone,
                topLeft: SPRITE_MAP.SINGLE_BORDER_TOP_LEFT,
                topRight: SPRITE_MAP.SINGLE_BORDER_TOP_RIGHT,
                bottomLeft: SPRITE_MAP.SINGLE_BORDER_BOTTOM_LEFT,
                bottomRight: SPRITE_MAP.SINGLE_BORDER_BOTTOM_RIGHT,
                top: SPRITE_MAP.SINGLE_BORDER_TOP,
                bottom: SPRITE_MAP.SINGLE_BORDER_BOTTOM,
                right: SPRITE_MAP.SINGLE_BORDER_RIGHT,
                left: SPRITE_MAP.SINGLE_BORDER_LEFT,
            })

            // set the transform
            // context.translate(filterZoneOffsetX, filterZoneOffsetY)

            // render filter text
            context.fillStyle = WHO_COLORS.YELLOW_TEXT
            context.font = fonts.FILTER_PRIMARY_HEADER
            context.textBaseline = "top"
            context.textAlign = "left"
            context.fillText(
                "Filter by Class:",
                filterHeaderTextBoundingBox.x,
                filterHeaderTextBoundingBox.y
            )

            // render "any" checkbox
            const allClassesSelected =
                classNameFilter.length === CLASS_LIST_LOWER.length
            const checkboxSource = allClassesSelected ? "CHECKED" : "UNCHECKED"
            context.drawImage(
                sprite,
                SPRITE_MAP.CHECKBOX[checkboxSource].x,
                SPRITE_MAP.CHECKBOX[checkboxSource].y,
                SPRITE_MAP.CHECKBOX[checkboxSource].width,
                SPRITE_MAP.CHECKBOX[checkboxSource].height,
                anyCheckboxBoundingBox.x,
                anyCheckboxBoundingBox.y,
                SPRITE_MAP.CHECKBOX[checkboxSource].width,
                SPRITE_MAP.CHECKBOX[checkboxSource].height
            )
            context.fillStyle = WHO_COLORS.WHITE_TEXT
            context.font = fonts.FILTER_CHECKBOX
            context.fillText(
                "Any",
                anyCheckboxBoundingBox.right() + 5,
                anyCheckboxBoundingBox.y + 2
            )

            // render class filters
            context.strokeStyle = "#ffffff"
            context.lineWidth = 2
            CLASS_LIST_LOWER.forEach((className, index) => {
                const isSelected = classNameFilter.includes(className)
                const filterName = className.replace(" ", "_").toUpperCase()
                const posX = Math.round(
                    index *
                        (CLASS_FILTER_GAP +
                            SPRITE_MAP.CLASS_FILTER.FIGHTER.width) +
                        classFiltersBoundingBox.x
                )
                if (isSelected) {
                    context.strokeRect(
                        posX,
                        classFiltersBoundingBox.y,
                        SPRITE_MAP.CLASS_FILTER[filterName].width,
                        SPRITE_MAP.CLASS_FILTER[filterName].height
                    )
                }
                context.drawImage(
                    sprite,
                    SPRITE_MAP.CLASS_FILTER[filterName].x,
                    SPRITE_MAP.CLASS_FILTER[filterName].y +
                        (isSelected ? 29 : 0),
                    SPRITE_MAP.CLASS_FILTER[filterName].width,
                    SPRITE_MAP.CLASS_FILTER[filterName].height,
                    posX,
                    classFiltersBoundingBox.y,
                    SPRITE_MAP.CLASS_FILTER[filterName].width,
                    SPRITE_MAP.CLASS_FILTER[filterName].height
                )
            })

            // render search text and search box
            context.fillStyle = WHO_COLORS.YELLOW_TEXT
            context.font = fonts.FILTER_PRIMARY_HEADER
            context.fillText(
                "Search by Name, Guild, or Location:",
                searchHeaderTextBoundingBox.x,
                searchHeaderTextBoundingBox.y
            )
            context.fillStyle = "#000000"
            context.strokeStyle = WHO_COLORS.FADED_WHITE
            context.lineWidth = 2
            context.strokeRect(
                searchInputBoundingBox.x,
                searchInputBoundingBox.y,
                searchInputBoundingBox.width,
                searchInputBoundingBox.height
            )
            context.fillRect(
                searchInputBoundingBox.x,
                searchInputBoundingBox.y,
                searchInputBoundingBox.width,
                searchInputBoundingBox.height
            )

            // render level range text and level range box
            context.fillStyle = WHO_COLORS.YELLOW_TEXT
            context.fillText(
                "Level Range:",
                levelRangeHeaderTextBoundingBox.x,
                levelRangeHeaderTextBoundingBox.y
            )
            context.fillStyle = WHO_COLORS.WHITE_TEXT
            context.textAlign = "center"
            context.textBaseline = "middle"
            context.fillText(
                "to",
                levelRangeToTextBoundingBox.centerX(),
                levelRangeToTextBoundingBox.centerY()
            )
            context.textAlign = "left"
            context.textBaseline = "top"
            context.strokeStyle = WHO_COLORS.FADED_WHITE
            context.fillStyle = "#000000"
            context.lineWidth = 2
            context.strokeRect(
                levelRangeLowerInputBoundingBox.x,
                levelRangeLowerInputBoundingBox.y,
                levelRangeLowerInputBoundingBox.width,
                levelRangeLowerInputBoundingBox.height
            )
            context.fillRect(
                levelRangeLowerInputBoundingBox.x,
                levelRangeLowerInputBoundingBox.y,
                levelRangeLowerInputBoundingBox.width,
                levelRangeLowerInputBoundingBox.height
            )
            context.strokeRect(
                levelRangeUpperInputBoundingBox.x,
                levelRangeUpperInputBoundingBox.y,
                levelRangeUpperInputBoundingBox.width,
                levelRangeUpperInputBoundingBox.height
            )
            context.fillRect(
                levelRangeUpperInputBoundingBox.x,
                levelRangeUpperInputBoundingBox.y,
                levelRangeUpperInputBoundingBox.width,
                levelRangeUpperInputBoundingBox.height
            )

            // render group view text and checkbox
            const hasOnlineRegisteredCharacters =
                onlineRegisteredCharacters.length > 0 && !isMyGroupView
            context.fillStyle = WHO_COLORS.YELLOW_TEXT
            context.fillText(
                "Group View:",
                groupViewHeaderTextBoundingBox.x,
                groupViewHeaderTextBoundingBox.y
            )
            const groupViewCheckboxType = isGroupView ? "CHECKED" : "UNCHECKED"
            context.drawImage(
                sprite,
                SPRITE_MAP.GROUP_VIEW_CHECKBOX[groupViewCheckboxType].x,
                SPRITE_MAP.GROUP_VIEW_CHECKBOX[groupViewCheckboxType].y,
                SPRITE_MAP.GROUP_VIEW_CHECKBOX[groupViewCheckboxType].width,
                SPRITE_MAP.GROUP_VIEW_CHECKBOX[groupViewCheckboxType].height,
                groupViewCheckboxBoundingBox.x -
                    (hasOnlineRegisteredCharacters ? 15 : 0),
                groupViewCheckboxBoundingBox.y,
                SPRITE_MAP.GROUP_VIEW_CHECKBOX[groupViewCheckboxType].width,
                SPRITE_MAP.GROUP_VIEW_CHECKBOX[groupViewCheckboxType].height
            )
            if (hasOnlineRegisteredCharacters) {
                context.filter = "hue-rotate(150deg) saturate(250%)"
                context.drawImage(
                    sprite,
                    SPRITE_MAP.GROUP_VIEW_CHECKBOX["UNCHECKED"].x,
                    SPRITE_MAP.GROUP_VIEW_CHECKBOX["UNCHECKED"].y,
                    SPRITE_MAP.GROUP_VIEW_CHECKBOX["UNCHECKED"].width,
                    SPRITE_MAP.GROUP_VIEW_CHECKBOX["UNCHECKED"].height,
                    groupViewCheckboxBoundingBox.x + 15,
                    groupViewCheckboxBoundingBox.y,
                    SPRITE_MAP.GROUP_VIEW_CHECKBOX["UNCHECKED"].width,
                    SPRITE_MAP.GROUP_VIEW_CHECKBOX["UNCHECKED"].height
                )
                context.filter = "hue-rotate(0deg)"
            }

            // render exact match checkbox
            const exactMatchCheckboxType = isExactMatch
                ? "CHECKED"
                : "UNCHECKED"
            context.drawImage(
                sprite,
                SPRITE_MAP.CHECKBOX[exactMatchCheckboxType].x,
                SPRITE_MAP.CHECKBOX[exactMatchCheckboxType].y,
                SPRITE_MAP.CHECKBOX[exactMatchCheckboxType].width,
                SPRITE_MAP.CHECKBOX[exactMatchCheckboxType].height,
                exactMatchCheckboxBoundingBox.x,
                exactMatchCheckboxBoundingBox.y,
                SPRITE_MAP.CHECKBOX[exactMatchCheckboxType].width,
                SPRITE_MAP.CHECKBOX[exactMatchCheckboxType].height
            )
            context.fillStyle = WHO_COLORS.WHITE_TEXT
            context.font = fonts.FILTER_CHECKBOX
            context.fillText(
                "Exact Match",
                exactMatchCheckboxBoundingBox.right() + 5,
                exactMatchCheckboxBoundingBox.y + 2
            )

            // render stats
            const numberOfAnonymousCharacters = characters?.filter(
                (character) => character.is_anonymous
            ).length
            const numberOfCharacters = characters?.length
            const statsY = exactMatchCheckboxBoundingBox.bottom() + 15
            context.fillStyle = WHO_COLORS.YELLOW_TEXT
            context.font = fonts.FILTER_PRIMARY_HEADER

            const stat1Width = context.measureText("Online:").width
            const stat2Width = context.measureText("Anonymous:").width
            const stat3Width = context.measureText("Displaying:").width

            context.translate(filterZoneOffsetX, statsY)
            context.fillText("Online:", 0, 0)
            context.fillStyle = WHO_COLORS.WHITE_TEXT
            context.translate(stat1Width + 10, 0)
            context.fillText(`${numberOfCharacters ?? 0}`, 0, 0)

            context.translate(100, 0)
            context.fillStyle = WHO_COLORS.YELLOW_TEXT
            context.fillText("Anonymous:", 0, 0)
            context.fillStyle = WHO_COLORS.WHITE_TEXT
            context.translate(stat2Width + 10, 0)
            context.fillText(`${numberOfAnonymousCharacters ?? 0}`, 0, 0)

            context.translate(100, 0)
            context.fillStyle = WHO_COLORS.YELLOW_TEXT
            context.fillText("Displaying:", 0, 0)
            context.fillStyle = WHO_COLORS.WHITE_TEXT
            context.translate(stat3Width + 10, 0)
            context.fillText(`${displayedCharacters?.length ?? 0}`, 0, 0)

            context.setTransform(1, 0, 0, 1, 0, 0)

            // render sort headers
            const headers = [
                {
                    boundingBox: lfmHeaderBoundingBox,
                    type: CharacterSortType.Lfm,
                    text: "",
                },
                {
                    boundingBox: nameHeaderBoundingBox,
                    type: CharacterSortType.Name,
                    text: "Name",
                },
                {
                    boundingBox: classHeaderBoundingBox,
                    type: CharacterSortType.Class,
                    text: "Class",
                },
                {
                    boundingBox: levelHeaderBoundingBox,
                    type: CharacterSortType.Level,
                    text: "Level",
                },
                {
                    boundingBox: guildHeaderBoundingBox,
                    type: CharacterSortType.Guild,
                    text: "Guild",
                },
            ]
            headers.forEach(({ boundingBox, type, text }) => {
                const sortHeaderType =
                    sortBy.type === type
                        ? "SORT_HEADER_HIGHLIGHTED"
                        : "SORT_HEADER"
                renderSortHeader({
                    boundingBox: boundingBox,
                    text: text,
                    font: fonts.SORT_HEADER,
                    left: SPRITE_MAP[sortHeaderType].LEFT,
                    center: SPRITE_MAP[sortHeaderType].CENTER,
                    right: SPRITE_MAP[sortHeaderType].RIGHT,
                    textOffsetX: sortBy.type === type ? 20 : 10,
                })
                if (sortBy.type === type) {
                    // draw a little triangle to indicate sorting
                    context.save()
                    context.shadowBlur = 2
                    context.shadowColor = "black"
                    context.shadowOffsetX = 1
                    context.shadowOffsetY = 1
                    const triangleX = boundingBox.x + 10
                    if (sortBy.ascending) {
                        const triangleY = boundingBox.centerY() - 3
                        context.beginPath()
                        context.moveTo(triangleX, triangleY + 5)
                        context.lineTo(triangleX + 5, triangleY + 5)
                        context.lineTo(triangleX + 2.5, triangleY)
                        context.fill()
                    } else {
                        const triangleY = boundingBox.centerY() - 2
                        context.beginPath()
                        context.moveTo(triangleX, triangleY)
                        context.lineTo(triangleX + 5, triangleY)
                        context.lineTo(triangleX + 2.5, triangleY + 5)
                        context.fill()
                    }
                    context.restore()
                }
            })
            context.drawImage(
                sprite,
                SPRITE_MAP.LFM_SORT_ICON.x,
                SPRITE_MAP.LFM_SORT_ICON.y,
                SPRITE_MAP.LFM_SORT_ICON.width,
                SPRITE_MAP.LFM_SORT_ICON.height,
                lfmHeaderBoundingBox.x + 3,
                lfmHeaderBoundingBox.y + 2,
                SPRITE_MAP.LFM_SORT_ICON.width,
                SPRITE_MAP.LFM_SORT_ICON.height
            )

            if (isLoading) {
                if (context) {
                    context.fillStyle = WHO_COLORS.BLACK_BACKGROUND
                    context.fillRect(50, 330, panelWidth - 100, 40)
                    context.fillStyle = WHO_COLORS.SECONDARY_TEXT
                    context.font = fonts.MISC_INFO_MESSAGE
                    context.textAlign = "center"
                    context.fillText(`Content loading...`, panelWidth / 2, 350)
                }
            }
        },
        [
            sprite,
            context,
            panelWidth,
            isGroupView,
            classNameFilter,
            isExactMatch,
            sortBy,
            areas,
            onlineRegisteredCharacters,
            isMyGroupView,
        ]
    )

    return renderWhoPanel
}

export default useRenderWhoPanel
