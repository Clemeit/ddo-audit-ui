import React from "react"
import PropTypes from "prop-types"
import "./VerificationTable.css"
import { Character } from "../../models/Character.ts"
// @ts-ignore
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
// @ts-ignore
import { ReactComponent as Delete } from "../../assets/svg/delete.svg"
import Button from "../global/Button.tsx"
import { AccessToken } from "../../models/Verification.ts"

const VerificationTable = ({
    characters,
    accessTokens,
    noCharactersMessage,
    selectCharacter,
    removeCharacter,
}: {
    characters: Character[]
    accessTokens: AccessToken[]
    noCharactersMessage: string
    selectCharacter: Function
    removeCharacter: Function
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
                    {accessTokens.some(
                        (token: AccessToken) =>
                            token.character_id === character.id
                    ) ? (
                        <div className="verified-and-remove-cell">
                            <Checkmark />
                            <Delete
                                className="clickable-icon"
                                onClick={() => {
                                    removeCharacter(character)
                                }}
                            />
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
    accessTokens: PropTypes.array,
    noCharactersMessage: PropTypes.string,
    selectCharacter: PropTypes.func,
    removeCharacter: PropTypes.func,
}

VerificationTable.defaultProps = {
    characters: [],
    accessTokens: [],
    noCharactersMessage: "No characters found",
    selectCharacter: () => {},
    removeCharacter: () => {},
}

export default VerificationTable
