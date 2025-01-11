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
import { AccessToken } from "../../models/Verification.ts"
import Stack from "../global/Stack.tsx"
import { mapClassesToString } from "../../utils/stringUtils.ts"

const CharacterTable = ({
    characters,
    accessTokens,
    noCharactersMessage,
    minimal,
    unregisterCharacter,
}: {
    characters: Character[]
    accessTokens: AccessToken[]
    noCharactersMessage: string
    minimal: boolean
    unregisterCharacter: (character: Character) => void
}) => {
    const navigate = useNavigate()

    const characterRow = (character: Character) => {
        // action cell
        const actionCell = accessTokens.some(
            (accessToken: AccessToken) =>
                accessToken.character_id === character.id
        ) ? (
            <td className="action-cell">
                <Stack gap="5px" justify="flex-end">
                    <Checkmark title="Verified" />
                    <Delete
                        className="clickable-icon"
                        onClick={() => {
                            unregisterCharacter(character)
                        }}
                    />
                </Stack>
            </td>
        ) : (
            <td className="action-cell">
                <Stack gap="5px" justify="flex-end">
                    <Button
                        text="Verify"
                        type="secondary"
                        className="verify-button"
                        small
                        onClick={() => {
                            // TODO: Navigate to verification page for this character
                            navigate(`/verification?id=${character.id}`)
                        }}
                    />
                    <Delete
                        className="clickable-icon"
                        onClick={() => {
                            unregisterCharacter(character)
                        }}
                    />
                </Stack>
            </td>
        )

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
                    {!minimal && actionCell}
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
            <table className="registration-table">
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
                        {!minimal && <th style={{ position: "sticky" }}></th>}
                    </tr>
                </thead>
                <tbody>
                    {characters.length
                        ? characters
                              .sort((a, b) =>
                                  (a.name || "").localeCompare(b.name || "")
                              )
                              .map(characterRow)
                        : noCharactersMessageRow}
                </tbody>
            </table>
        </div>
    )
}

CharacterTable.propTypes = {
    characters: PropTypes.array,
    accessTokens: PropTypes.array,
    noCharactersMessage: PropTypes.string,
    minimal: PropTypes.bool,
    unregisterCharacter: PropTypes.func,
}

CharacterTable.defaultProps = {
    characters: [],
    accessTokens: [],
    noCharactersMessage: "No characters found",
    minimal: false,
    unregisterCharacter: () => {},
}

export default CharacterTable
