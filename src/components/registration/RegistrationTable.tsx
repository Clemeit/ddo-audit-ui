import React, { useMemo } from "react"
import "./RegistrationTable.css"
import { Character } from "../../models/Character.ts"
import { ReactComponent as Delete } from "../../assets/svg/delete.svg"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import { useNavigate } from "react-router-dom"
import Button from "../global/Button.tsx"
import { AccessToken } from "../../models/Verification.ts"
import Stack from "../global/Stack.tsx"
import { mapClassesToString } from "../../utils/stringUtils.ts"
import { useAreaContext } from "../../contexts/AreaContext.tsx"

interface Props {
    characters: Character[]
    accessTokens?: AccessToken[]
    noCharactersMessage?: string
    isLoaded?: boolean
    minimal?: boolean
    unregisterCharacter?: (character: Character) => void
}

const RegistrationTable = ({
    characters = [],
    accessTokens = [],
    noCharactersMessage = "No characters found",
    isLoaded = true,
    minimal = false,
    unregisterCharacter = () => { },
}: Props) => {
    const navigate = useNavigate()
    const areaContext = useAreaContext()
    const { areas } = useMemo(() => areaContext, [areaContext])

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
                        type="secondary"
                        className="verify-button"
                        small
                        onClick={() => {
                            navigate(`/verification?id=${character.id}`)
                        }}
                    >
                        Verify
                    </Button>
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
            <tr key={character.id}>
                <td>
                    <div
                        className="character-status-dot"
                        style={{
                            backgroundColor: character.is_anonymous ? "#1111FF" :
                                character.is_online ?
                                    "#00BB00"
                                    : "#DD0000",
                        }}
                    />
                </td>
                <td className="character-cell">
                    <span>
                        {character.is_anonymous ? "Anonymous" : character.name}
                    </span>
                </td>
                <td>{character.server_name}</td>
                <td className="hide-on-small-mobile">
                    {character.total_level}
                </td>
                {!minimal && (
                    <td className="hide-on-mobile">
                        {character.is_anonymous ? "-" : character.guild_name}
                    </td>
                )}
                {!minimal && (
                    <td className="hide-on-mobile">
                        {mapClassesToString(character.classes)}
                    </td>
                )}
                {!minimal && (
                    <td className="hide-on-mobile">
                        {character.is_anonymous
                            ? "-"
                            : areas[character.location_id || 0]?.name}
                    </td>
                )}
                {!minimal && actionCell}
            </tr>
        )
    }

    const noCharactersMessageRow = (
        <tr>
            <td className="no-data-row" colSpan={100}>
                {noCharactersMessage}
            </td>
        </tr>
    )

    const loadingRow = (
        <tr>
            <td className="no-data-row" colSpan={100}>
                Loading...
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
                    {characters.length === 0 && !isLoaded && loadingRow}
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

export default RegistrationTable
