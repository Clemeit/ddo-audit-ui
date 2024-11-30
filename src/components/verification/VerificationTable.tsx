import React from "react"
import PropTypes from "prop-types"
import "./VerificationTable.css"
import { Character } from "../../models/Character.ts"
// @ts-ignore
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import Button from "../global/Button.tsx"
import { useNavigate } from "react-router-dom"

const VerificationTable = ({
    characters,
    verifiedCharacters,
    noCharactersMessage,
}: {
    characters: Character[]
    verifiedCharacters: string[]
    noCharactersMessage: string
}) => {
    const navigate = useNavigate()

    const characterRow = (character: Character) => {
        return (
            <tr key={character.id}>
                <td>{character.name}</td>
                <td>{character.server_name}</td>
                <td>{character.total_level}</td>
                <td className="status-column">
                    {verifiedCharacters.includes(character.id) ? (
                        <Checkmark />
                    ) : (
                        <Button
                            text="Verify"
                            type="secondary"
                            onClick={() => {
                                navigate(
                                    `/verification?page=3&id=${character.id}`
                                )
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
                    <th>Level</th>
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
