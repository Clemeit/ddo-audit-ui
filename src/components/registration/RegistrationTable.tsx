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
    verifiedCharacterIds,
    noCharactersMessage,
    minimal,
    reload,
}: {
    characters: Character[]
    verifiedCharacterIds: string[]
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
                    <td className="hide-on-small-mobile">
                        {character.total_level}
                    </td>
                    {!minimal && (
                        <td className="hide-on-mobile">
                            {character.guild_name}
                        </td>
                    )}
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
                    {!minimal &&
                        (verifiedCharacterIds.includes(character.id) ? (
                            <td className="verify-cell">
                                <Checkmark title="Verified" />
                            </td>
                        ) : (
                            <td className="verify-cell">
                                <Button
                                    text="Verify"
                                    type="secondary"
                                    small
                                    onClick={() => {
                                        // TODO: Navigate to verification page for this character
                                        navigate(
                                            `/verification?id=${character.id}`
                                        )
                                    }}
                                />
                            </td>
                        ))}
                    {!minimal && (
                        <td>
                            <Delete
                                className="clickable-icon"
                                onClick={() => {
                                    removeCharacterId(character.id)
                                }}
                            />
                        </td>
                    )}
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
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th style={{ width: "0px" }}></th>
                        <th>Name</th>
                        <th>Server</th>
                        <th className="hide-on-small-mobile">Level</th>
                        {!minimal && <th className="hide-on-mobile">Guild</th>}
                        {!minimal && (
                            <th className="hide-on-mobile">Classes</th>
                        )}
                        {!minimal && (
                            <th className="hide-on-mobile">Location</th>
                        )}
                        {!minimal && <th className="verify-cell"></th>}
                        {!minimal && <th style={{ position: "sticky" }}></th>}
                    </tr>
                </thead>
                <tbody>
                    {characters.length
                        ? characters.map(characterRow)
                        : noCharactersMessageRow}
                </tbody>
            </table>
        </div>
    )
}

CharacterTable.propTypes = {
    characters: PropTypes.array,
    verifiedCharacterIds: PropTypes.array,
    noCharactersMessage: PropTypes.string,
    minimal: PropTypes.bool,
    reload: PropTypes.func,
}

CharacterTable.defaultProps = {
    characters: [],
    verifiedCharacterIds: [],
    noCharactersMessage: "No characters found",
    minimal: false,
    reload: () => {},
}

export default CharacterTable
