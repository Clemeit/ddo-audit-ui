import { SPRITE_MAP } from "../constants/spriteMap.ts"

function mapRaceAndGenderToRaceIconBoundingBox(
    race: string = "human",
    gender: string = "male"
) {
    let raceIconBoundingBox: {
        x: number
        y: number
        width: number
        height: number
    }
    switch (race.toLowerCase()) {
        case "dragonborn":
            raceIconBoundingBox = SPRITE_MAP.RACES.DRAGONBORN
            break
        case "drow elf":
            raceIconBoundingBox = SPRITE_MAP.RACES.DROW
            break
        case "dwarf":
            raceIconBoundingBox = SPRITE_MAP.RACES.DWARF
            break
        case "elf":
        case "wood elf":
        case "sun elf":
            raceIconBoundingBox = SPRITE_MAP.RACES.ELF
            break
        case "gnome":
        case "deep gnome":
            raceIconBoundingBox = SPRITE_MAP.RACES.GNOME
            break
        case "halfling":
            raceIconBoundingBox = SPRITE_MAP.RACES.HALFLING
            break
        case "half elf":
            raceIconBoundingBox = SPRITE_MAP.RACES.HALF_ELF
            break
        case "half orc":
            raceIconBoundingBox = SPRITE_MAP.RACES.HALF_ORC
            break
        case "human":
        case "shadar-kai":
            raceIconBoundingBox = SPRITE_MAP.RACES.HUMAN
            break
        case "tiefling":
        case "tiefling scoundrel":
            raceIconBoundingBox = SPRITE_MAP.RACES.TIEFLING
            break
        case "warforged":
        case "bladeforged":
            raceIconBoundingBox = SPRITE_MAP.RACES.WARFORGED
            break
        case "aasimar":
        case "aasimar scourge":
            raceIconBoundingBox = SPRITE_MAP.RACES.AASIMAR
            break
        case "eladrin":
            raceIconBoundingBox = SPRITE_MAP.RACES.ELADRIN
            break
        case "shifter":
        case "razorclaw shifter":
            raceIconBoundingBox = SPRITE_MAP.RACES.SHIFTER
            break
        case "tabaxi":
        case "tabaxi trailblazer":
            raceIconBoundingBox = SPRITE_MAP.RACES.TABAXI
            break
        case "eladrin chaosmancer":
            raceIconBoundingBox = SPRITE_MAP.RACES.CHAOSMANCER
            break
        default:
            raceIconBoundingBox = SPRITE_MAP.RACES.HUMAN
    }

    return {
        x:
            raceIconBoundingBox.x +
            (gender.toLowerCase() === "female" ? 108 : 0),
        y: raceIconBoundingBox.y,
        width: raceIconBoundingBox.width,
        height: raceIconBoundingBox.height,
    }
}

export { mapRaceAndGenderToRaceIconBoundingBox }
