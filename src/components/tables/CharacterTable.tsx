import React from "react"
import { Character } from "../../models/Character.ts"
import { mapClassesToString } from "../../utils/stringUtils.ts"
import { useAreaContext } from "../../contexts/AreaContext.tsx"
import "./CharacterTable.css"

export enum ColumnType {
    STATUS,
    NAME,
    SERVER_NAME,
    LEVEL,
    GUILD,
    CLASSES,
    LOCATION,
    ACTIONS,
}

export interface CharacterTableRow {
    character: Character
    actions: React.ReactNode
}

interface Props {
    characterRows?: CharacterTableRow[]
    noCharactersMessage?: string
    isLoaded?: boolean
    visibleColumns?: ColumnType[]
}

const CharacterTable = ({
    characterRows = [],
    noCharactersMessage = "No characters to display",
    isLoaded = false,
    visibleColumns = [
        ColumnType.STATUS,
        ColumnType.NAME,
        ColumnType.SERVER_NAME,
        ColumnType.LEVEL,
        ColumnType.GUILD,
        ColumnType.CLASSES,
        ColumnType.LOCATION,
        ColumnType.ACTIONS,
    ],
}: Props) => {
    const areaContext = useAreaContext()
    const { areas } = areaContext

    const noCharactersMessageRow = (
        <tr>
            <td className="no-data-row" colSpan={100}>
                {noCharactersMessage}
            </td>
        </tr>
    )

    const isLoadingRow = (
        <tr>
            <td className="no-data-row" colSpan={100}>
                Loading...
            </td>
        </tr>
    )

    const characterRow = (rowData: CharacterTableRow) => {
        const { character, actions } = rowData

        const statusDotCell = (
            <td>
                <div
                    className="character-status-dot"
                    style={{
                        backgroundColor: character.is_anonymous
                            ? "#1111FF"
                            : character.is_online
                              ? "#00BB00"
                              : "#DD0000",
                    }}
                />
            </td>
        )
        const nameCell = (
            <td className="character-cell">
                <span>
                    {character.is_anonymous ? "Anonymous" : character.name}
                </span>
            </td>
        )
        const serverNameCell = <td>{character.server_name}</td>
        const totalLevelCell = <td>{character.total_level}</td>
        const guildNameCell = (
            <td>{character.is_anonymous ? "-" : character.guild_name}</td>
        )
        const classesCell = <td>{mapClassesToString(character.classes)}</td>
        const locationCell = (
            <td>
                {character.is_anonymous
                    ? "-"
                    : areas[character.location_id || 0]?.name}
            </td>
        )
        const actionsCell = <td style={{ width: 0 }}>{actions}</td>

        return (
            <tr key={rowData.character.id}>
                {visibleColumns.includes(ColumnType.STATUS) && statusDotCell}
                {visibleColumns.includes(ColumnType.NAME) && nameCell}
                {visibleColumns.includes(ColumnType.SERVER_NAME) &&
                    serverNameCell}
                {visibleColumns.includes(ColumnType.LEVEL) && totalLevelCell}
                {visibleColumns.includes(ColumnType.GUILD) && guildNameCell}
                {visibleColumns.includes(ColumnType.CLASSES) && classesCell}
                {visibleColumns.includes(ColumnType.LOCATION) && locationCell}
                {visibleColumns.includes(ColumnType.ACTIONS) && actionsCell}
            </tr>
        )
    }

    const getTableBody = () => {
        if (characterRows.length > 0) {
            return characterRows
                .sort((a, b) => a.character.id - b.character.id)
                .sort((a, b) =>
                    (a.character.name || "").localeCompare(
                        b.character.name || ""
                    )
                )
                .map(characterRow)
        }
        if (!isLoaded) {
            return isLoadingRow
        }
        return noCharactersMessageRow
    }

    return (
        <div className="character-table-container">
            <table className="character-table">
                <thead>
                    <tr>
                        {visibleColumns.includes(ColumnType.STATUS) && (
                            <th style={{ width: "0px" }} />
                        )}
                        {visibleColumns.includes(ColumnType.NAME) && (
                            <th>Name</th>
                        )}
                        {visibleColumns.includes(ColumnType.SERVER_NAME) && (
                            <th>Server</th>
                        )}
                        {visibleColumns.includes(ColumnType.GUILD) && (
                            <th>Guild</th>
                        )}
                        {visibleColumns.includes(ColumnType.LEVEL) && (
                            <th>Level</th>
                        )}
                        {visibleColumns.includes(ColumnType.CLASSES) && (
                            <th>Classes</th>
                        )}
                        {visibleColumns.includes(ColumnType.LOCATION) && (
                            <th>Location</th>
                        )}
                        {visibleColumns.includes(ColumnType.ACTIONS) && (
                            <th style={{ position: "sticky" }}></th>
                        )}
                    </tr>
                </thead>
                <tbody>{getTableBody()}</tbody>
            </table>
        </div>
    )
}

export default CharacterTable
