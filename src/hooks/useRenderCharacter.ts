import { useMemo } from "react"
import { Character } from "../models/Character.ts"
import { calculateCommonFilterBoundingBoxes } from "../utils/whoUtils.ts"
import { useWhoContext } from "../contexts/WhoContext.tsx"
import { CHARACTER_HEIGHT, FONTS, WHO_COLORS } from "../constants/whoPanel.ts"
import { SPRITE_MAP } from "../constants/spriteMap.ts"
import {
    mapClassToIconBoundingBox,
    mapRaceAndGenderToRaceIconBoundingBox,
} from "../utils/socialUtils.ts"
import { CHARACTER_IDS } from "../constants/characterIds.ts"
import { truncateText } from "../utils/stringUtils.ts"
import { CLASS_LIST_LOWER } from "../constants/game.ts"
import { useAreaContext } from "../contexts/AreaContext.tsx"

interface Props {
    sprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
}

interface RenderCharacterProps {
    character: Character
    backgroundColorOverride?: string
    characterIndex?: number
}

const useRenderCharacter = ({ sprite, context }: Props) => {
    const { panelWidth, showInQuestIndicator } = useWhoContext()
    const {
        filterZone,
        lfmHeaderBoundingBox,
        nameHeaderBoundingBox,
        classHeaderBoundingBox,
        levelHeaderBoundingBox,
        guildHeaderBoundingBox,
    } = useMemo(
        () => calculateCommonFilterBoundingBoxes(panelWidth),
        [panelWidth]
    )
    const fonts = useMemo(() => FONTS(), [])
    const areaContext = useAreaContext()
    const { areas } = useMemo(
        () => ({ areas: areaContext.areas }),
        [areaContext.areas]
    )

    const renderCharacter = ({
        character,
        backgroundColorOverride,
        characterIndex,
    }: RenderCharacterProps) => {
        if (!sprite || !context) return

        const leftBound = lfmHeaderBoundingBox.x

        // render the background
        if (backgroundColorOverride) {
            context.fillStyle = backgroundColorOverride
            context.fillRect(0, 0, filterZone.width, CHARACTER_HEIGHT)
        } else {
            const gradient = context.createLinearGradient(
                0,
                0,
                0,
                CHARACTER_HEIGHT
            )
            let edgeColor = WHO_COLORS.CHARACTER_GRADIENT_EDGE
            if (character.metadata?.isFriend) {
                edgeColor = WHO_COLORS.FRIEND_GRADIENT_EDGE
            } else if (character.metadata?.isRegistered) {
                edgeColor = WHO_COLORS.REGISTERED_GRADIENT_EDGE
            }
            let centerColor = WHO_COLORS.CHARACTER_GRADIENT_CENTER
            if (character.metadata?.isFriend) {
                centerColor = WHO_COLORS.FRIEND_GRADIENT_CENTER
            } else if (character.metadata?.isRegistered) {
                centerColor = WHO_COLORS.REGISTERED_GRADIENT_CENTER
            }
            gradient.addColorStop(0, edgeColor)
            gradient.addColorStop(0.25, centerColor)
            gradient.addColorStop(0.75, centerColor)
            gradient.addColorStop(1, edgeColor)
            context.fillStyle = gradient
            context.fillRect(0, 0, filterZone.width, CHARACTER_HEIGHT)
        }

        // render the borders and dividers
        context.strokeStyle = WHO_COLORS.CHARACTER_BORDER
        context.lineWidth = 1
        context.strokeRect(0.5, 0.5, filterZone.width - 1, CHARACTER_HEIGHT - 1)
        const dividers = [
            nameHeaderBoundingBox,
            classHeaderBoundingBox,
            levelHeaderBoundingBox,
            guildHeaderBoundingBox,
        ]
        dividers.forEach((divider) => {
            context.beginPath()
            context.moveTo(
                Math.round(divider.x - lfmHeaderBoundingBox.x) - 0.5,
                1
            )
            context.lineTo(
                Math.round(divider.x - lfmHeaderBoundingBox.x) - 0.5,
                CHARACTER_HEIGHT - 3
            )
            context.stroke()
        })

        // render in-party icon
        if (characterIndex) {
            context.textAlign = "center"
            context.textBaseline = "middle"
            context.fillStyle = WHO_COLORS.CHARACTER_TEXT
            context.font = fonts.CHARACTER_LEVEL
            context.fillText(
                characterIndex.toString(),
                lfmHeaderBoundingBox.x / 2,
                CHARACTER_HEIGHT / 2
            )
        } else if (character.is_in_party) {
            context.drawImage(
                sprite,
                SPRITE_MAP.IN_PARTY_ICON.x,
                SPRITE_MAP.IN_PARTY_ICON.y,
                SPRITE_MAP.IN_PARTY_ICON.width,
                SPRITE_MAP.IN_PARTY_ICON.height,
                2,
                CHARACTER_HEIGHT / 2 - SPRITE_MAP.IN_PARTY_ICON.height / 2,
                SPRITE_MAP.IN_PARTY_ICON.width,
                SPRITE_MAP.IN_PARTY_ICON.height
            )
        }

        // render race icon
        const leaderRaceIcon = mapRaceAndGenderToRaceIconBoundingBox(
            character.race || "human",
            character.gender || "male"
        )
        context.drawImage(
            sprite,
            leaderRaceIcon.x,
            leaderRaceIcon.y,
            leaderRaceIcon.width,
            leaderRaceIcon.height,
            Math.round(nameHeaderBoundingBox.x - leftBound + 2),
            2,
            leaderRaceIcon.width,
            leaderRaceIcon.height
        )

        // render name
        context.textAlign = "left"
        context.textBaseline = "middle"
        context.fillStyle = WHO_COLORS.CHARACTER_TEXT
        context.font = fonts.CHARACTER_NAME
        const characterNameText = character.is_anonymous
            ? "???"
            : character.name || ""
        context.fillText(
            characterNameText,
            nameHeaderBoundingBox.x -
                leftBound +
                SPRITE_MAP.RACES.HUMAN.width +
                5,
            13
        )
        if (CHARACTER_IDS.includes(character.id)) {
            const characterNameWidth =
                context.measureText(characterNameText).width
            context.drawImage(
                sprite,
                SPRITE_MAP.CROWN.x,
                SPRITE_MAP.CROWN.y,
                SPRITE_MAP.CROWN.width,
                SPRITE_MAP.CROWN.height,
                nameHeaderBoundingBox.x -
                    leftBound +
                    SPRITE_MAP.RACES.HUMAN.width +
                    characterNameWidth +
                    7,
                2,
                SPRITE_MAP.CROWN.width,
                SPRITE_MAP.CROWN.height
            )
        }

        // render location
        let locationName = "Somewhere in the Aether"
        context.font = fonts.CHARACTER_LOCATION
        if (character.location_id) {
            const location = areas[character.location_id]
            if (location) {
                locationName = truncateText(
                    `${showInQuestIndicator && location.is_public === false ? "✓ " : ""}${location.name}`,
                    nameHeaderBoundingBox.width - 10,
                    context.font,
                    context
                )
            }
        }
        context.fillText(
            locationName,
            nameHeaderBoundingBox.x - leftBound + 7,
            leaderRaceIcon.height + 14
        )

        // render classes
        character.classes
            ?.filter((classData) =>
                CLASS_LIST_LOWER.includes(classData.name.toLowerCase())
            )
            .sort((a, b) => b.level - a.level)
            .forEach((classData, index) => {
                const classIconBoundingBox = mapClassToIconBoundingBox(
                    classData.name
                )
                context.drawImage(
                    sprite,
                    classIconBoundingBox.x,
                    classIconBoundingBox.y,
                    classIconBoundingBox.width,
                    classIconBoundingBox.height,
                    Math.round(
                        classHeaderBoundingBox.x +
                            index * (classIconBoundingBox.width + 1)
                    ),
                    Math.round(
                        (CHARACTER_HEIGHT - classIconBoundingBox.height) / 2
                    ),
                    classIconBoundingBox.width,
                    classIconBoundingBox.height
                )

                // shadow under text
                context.save()
                context.shadowColor = "black"
                context.shadowBlur = 1
                context.shadowOffsetX = 0
                context.shadowOffsetY = 0
                context.textAlign = "right"
                context.textBaseline = "bottom"
                context.fillStyle = WHO_COLORS.WHITE_TEXT
                context.font = fonts.MEMBER_CLASS_LEVEL
                context.fillText(
                    classData.level.toString(),
                    classHeaderBoundingBox.x +
                        classIconBoundingBox.width +
                        index * (classIconBoundingBox.width + 1),
                    (CHARACTER_HEIGHT - classIconBoundingBox.height) / 2 +
                        classIconBoundingBox.height
                )

                context.restore()
            })

        // render total level
        context.textAlign = "center"
        context.font = fonts.CHARACTER_LEVEL
        context.fillText(
            character.total_level?.toString() || "",
            Math.round(levelHeaderBoundingBox.centerX() - leftBound),
            Math.round(CHARACTER_HEIGHT / 2)
        )

        // render guild name
        if (character.guild_name) {
            context.font = fonts.CHARACTER_GUILD_NAME
            const guildName = character.is_anonymous
                ? "???"
                : truncateText(
                      character.guild_name || "",
                      guildHeaderBoundingBox.width - 10,
                      context.font,
                      context
                  )
            context.fillText(
                guildName,
                Math.round(guildHeaderBoundingBox.centerX() - leftBound),
                Math.round(CHARACTER_HEIGHT / 2)
            )
        }
    }

    return renderCharacter
}

export default useRenderCharacter
