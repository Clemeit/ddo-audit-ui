import React from "react"
import PropTypes from "prop-types"
import "./RegistrationTable.css"
import { Character, CharacterClass } from "../../models/Character.ts"
// @ts-ignore
import { ReactComponent as Delete } from "../../assets/svg/delete.svg"
// @ts-ignore
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { useNavigate } from "react-router-dom"
import Button from "../global/Button.tsx"

const CharacterTable = ({
    characters,
    verifiedCharacters,
    noCharactersMessage,
    minimal,
    reload,
}: {
    characters: Character[]
    verifiedCharacters: string[]
    noCharactersMessage: string
    minimal: boolean
    reload: () => void
}) => {
    const navigate = useNavigate()

    function mapClassesToString(classes?: CharacterClass[]): string {
        const excludedClasses = ["Epic", "Legendary"]

        if (!classes) return ""
        return classes
            .filter(
                (characterClass) =>
                    !excludedClasses.includes(characterClass.name)
            )
            .map(
                (characterClass) =>
                    `${characterClass.name} ${characterClass.level}`
            )
            .join(", ")
    }

    function removeCharacterId(id: string) {
        const currentIds = JSON.parse(
            localStorage.getItem("registered-characters") || "[]"
        )
        const newIds = currentIds.filter(
            (currentId: string) => currentId !== id
        )
        localStorage.setItem("registered-characters", JSON.stringify(newIds))
        reload()
    }

    const characterRow = (character: Character) => {
        return (
            <>
                <tr key={character.id}>
                    <td>
                        <div
                            className="character-status-dot"
                            style={{
                                backgroundColor: character.is_online
                                    ? "#00BB00"
                                    : "#DD0000",
                            }}
                        />
                    </td>
                    <td className="character-cell">
                        <span>{character.name}</span>
                    </td>
                    <td>{character.server_name}</td>
                    <td>{character.total_level}</td>
                    {!minimal && <td>{character.guild_name}</td>}
                    {!minimal && (
                        <td className="hide-on-mobile">
                            {mapClassesToString(character.classes)}
                        </td>
                    )}
                    {!minimal && (
                        <td className="hide-on-mobile">
                            {character.location?.name}
                        </td>
                    )}
                    {!minimal && (
                        <td
                            className="options-cell"
                            onClick={() => {
                                removeCharacterId(character.id)
                            }}
                        >
                            <Delete />
                        </td>
                    )}
                    {!minimal &&
                        (verifiedCharacters.includes(character.id) ? (
                            <td className="options-cell disabled">
                                <Checkmark title="Verified" />
                            </td>
                        ) : (
                            <td>
                                <Button
                                    text="Verify"
                                    type="secondary"
                                    small
                                    onClick={() => {
                                        // TODO: Navigate to verification page for this character
                                        navigate(
                                            `/verification?page=3&id=${character.id}`
                                        )
                                    }}
                                />
                            </td>
                        ))}
                </tr>
            </>
        )
    }

    const noCharactersMessageRow = (
        <tr>
            <td className="no-data-row" colSpan={100}>
                {noCharactersMessage}
            </td>
        </tr>
    )

    return (
        <table>
            <thead>
                <tr>
                    <th style={{ width: "0px" }}></th>
                    <th>Name</th>
                    <th>Server</th>
                    <th>Level</th>
                    {!minimal && <th>Guild</th>}
                    {!minimal && <th className="hide-on-mobile">Classes</th>}
                    {!minimal && <th className="hide-on-mobile">Location</th>}
                    {!minimal && <th></th>}
                    {!minimal && <th></th>}
                </tr>
            </thead>
            <tbody>
                {characters.length
                    ? characters.map(characterRow)
                    : noCharactersMessageRow}
            </tbody>
        </table>
    )
}

CharacterTable.propTypes = {
    characters: PropTypes.array,
    verifiedCharacters: PropTypes.array,
    noCharactersMessage: PropTypes.string,
    minimal: PropTypes.bool,
    reload: PropTypes.func,
}

CharacterTable.defaultProps = {
    characters: [],
    verifiedCharacters: [],
    noCharactersMessage: "No characters found",
    minimal: false,
    reload: () => {},
}

export default CharacterTable
