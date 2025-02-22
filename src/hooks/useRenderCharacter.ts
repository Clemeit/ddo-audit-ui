import { useMemo } from "react"
import { Character } from "../models/Character.ts"
import { calculateCommonFilterBoundingBoxes } from "../utils/whoUtils.ts"
import { useWhoContext } from "../contexts/WhoContext.tsx"
import { CHARACTER_HEIGHT, FONTS, WHO_COLORS } from "../constants/whoPanel.ts"
import { SPRITE_MAP } from "../constants/spriteMap.ts"
import { mapRaceAndGenderToRaceIconBoundingBox } from "../utils/socialUtils.ts"
import { CHARACTER_IDS } from "../constants/characterIds.ts"
import { truncateText, wrapText } from "../utils/stringUtils.ts"

interface Props {
    sprite?: HTMLImageElement | null
    context?: CanvasRenderingContext2D | null
}

interface RenderCharacterProps {
    character: Character
    backgroundColorOverride?: string
}

const useRenderCharacter = ({ sprite, context }: Props) => {
    const { panelWidth } = useWhoContext()
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

    const renderCharacter = ({
        character,
        backgroundColorOverride,
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
            gradient.addColorStop(0, WHO_COLORS.CHARACTER_GRADIENT_EDGE)
            gradient.addColorStop(0.25, WHO_COLORS.CHARACTER_GRADIENT_CENTER)
            gradient.addColorStop(0.75, WHO_COLORS.CHARACTER_GRADIENT_CENTER)
            gradient.addColorStop(1, WHO_COLORS.CHARACTER_GRADIENT_EDGE)
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
        if (character.is_in_party) {
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
            nameHeaderBoundingBox.x - leftBound + 2,
            0,
            leaderRaceIcon.width,
            leaderRaceIcon.height
        )

        // render name
        context.textAlign = "left"
        context.textBaseline = "middle"
        context.fillStyle = WHO_COLORS.CHARACTER_TEXT
        context.font = fonts.CHARACTER_NAME
        context.fillText(
            character.name || "",
            nameHeaderBoundingBox.x -
                leftBound +
                SPRITE_MAP.RACES.HUMAN.width +
                5,
            12
        )
        if (CHARACTER_IDS.includes(character.id)) {
            const characterNameWidth = context.measureText(
                character.name || ""
            ).width
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
        if (character.location?.name) {
            context.font = fonts.CHARACTER_LOCATION
            const locationName = truncateText(
                character.location?.name,
                nameHeaderBoundingBox.width - 10,
                context.font,
                context
            )
            context.fillText(
                locationName,
                nameHeaderBoundingBox.x - leftBound + 7,
                leaderRaceIcon.height + 13
            )
        }

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
            const guildName = truncateText(
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
