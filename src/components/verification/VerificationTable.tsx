import React from "react"
import PropTypes from "prop-types"
import "./VerificationTable.css"
import { Character } from "../../models/Character.ts"
// @ts-ignore
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
// @ts-ignore
import { ReactComponent as Delete } from "../../assets/svg/delete.svg"
import Button from "../global/Button.tsx"

const VerificationTable = ({
    characters,
    verifiedCharacters,
    noCharactersMessage,
    selectCharacter,
}: {
    characters: Character[]
    verifiedCharacters: string[]
    noCharactersMessage: string
    selectCharacter: Function
}) => {
    const characterRow = (character: Character) => {
        return (
            <tr key={character.id}>
                <td>{character.name}</td>
                <td>{character.server_name}</td>
                <td className="hide-on-small-mobile">
                    {character.total_level}
                </td>
                <td>
                    {verifiedCharacters.includes(character.id) ? (
                        <div className="verified-and-remove-cell">
                            <Checkmark />
                            <Delete className="clickable-icon" />
                        </div>
                    ) : (
                        <Button
                            text="Verify"
                            type="secondary"
                            onClick={() => {
                                selectCharacter(character)
                            }}
                        />
                    )}
                </td>
            </tr>
        )
    }

    const noCharactersMessageRow = (
        <tr>
            <td className="no-data-row" colSpan={4}>
                {noCharactersMessage}
            </td>
        </tr>
    )

    return (
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Server</th>
                    <th className="hide-on-small-mobile">Level</th>
                    <th>Status</th>
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

VerificationTable.propTypes = {
    characters: PropTypes.array,
    verifiedCharacters: PropTypes.array,
    noCharactersMessage: PropTypes.string,
}

VerificationTable.defaultProps = {
    characters: [],
    verifiedCharacters: [],
    noCharactersMessage: "No characters found",
}

export default VerificationTable
