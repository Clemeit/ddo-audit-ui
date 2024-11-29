import React, { version } from "react"
import PropTypes from "prop-types"
import "./CharacterTable.css"

const CharacterTable = ({
    characters,
    verifiedCharacters,
}: {
    characters: Character[]
    verifiedCharacters: string[]
}) => {
    const characterRow = (character: Character) => {
        return (
            <tr key={character.id}>
                <td>{character.name}</td>
                <td>{character.total_level}</td>
                <td>
                    {verifiedCharacters.includes(character.id)
                        ? "Verified"
                        : "Next"}
                </td>
            </tr>
        )
    }

    return (
        <table className="character-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Level</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>{characters.map(characterRow)}</tbody>
        </table>
    )
}

CharacterTable.propTypes = {
    characters: PropTypes.array,
    verifiedCharacters: PropTypes.array,
}

CharacterTable.defaultProps = {}

export default CharacterTable
