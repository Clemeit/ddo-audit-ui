import { areCharactersEquivalent } from "../whoUtils"

describe("whoUtils", () => {
    describe("areCharactersEquivalent", () => {
        const baseCharacter = {
            id: 1,
            name: "TestChar",
            total_level: 20,
            location_id: 100,
            is_in_party: false,
            is_anonymous: false,
            guild_name: "TestGuild",
        } as any

        it("returns true for identical characters", () => {
            expect(areCharactersEquivalent(baseCharacter, { ...baseCharacter })).toBe(true)
        })

        it("returns false when location changes", () => {
            expect(
                areCharactersEquivalent(baseCharacter, {
                    ...baseCharacter,
                    location_id: 200,
                })
            ).toBe(false)
        })

        it("returns false when total_level changes", () => {
            expect(
                areCharactersEquivalent(baseCharacter, {
                    ...baseCharacter,
                    total_level: 21,
                })
            ).toBe(false)
        })

        it("returns false when is_in_party changes", () => {
            expect(
                areCharactersEquivalent(baseCharacter, {
                    ...baseCharacter,
                    is_in_party: true,
                })
            ).toBe(false)
        })

        it("returns false when is_anonymous changes", () => {
            expect(
                areCharactersEquivalent(baseCharacter, {
                    ...baseCharacter,
                    is_anonymous: true,
                })
            ).toBe(false)
        })

        it("returns false when name changes", () => {
            expect(
                areCharactersEquivalent(baseCharacter, {
                    ...baseCharacter,
                    name: "OtherChar",
                })
            ).toBe(false)
        })

        it("returns false when guild_name changes", () => {
            expect(
                areCharactersEquivalent(baseCharacter, {
                    ...baseCharacter,
                    guild_name: "OtherGuild",
                })
            ).toBe(false)
        })

        it("returns false when previous is defined and current is undefined", () => {
            expect(areCharactersEquivalent(baseCharacter, undefined as any)).toBe(false)
        })

        it("returns false when previous is undefined and current is defined", () => {
            expect(areCharactersEquivalent(undefined as any, baseCharacter)).toBe(false)
        })
    })
})
