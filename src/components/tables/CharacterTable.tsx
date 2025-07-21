import React, { useEffect, useRef, useCallback } from "react"
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
    tableSortFunction?: (a: CharacterTableRow, b: CharacterTableRow) => number
}

const defaultTableSortFunction = (
    a: CharacterTableRow,
    b: CharacterTableRow
): number => {
    if (a.character.name === b.character.name)
        return a.character.id - b.character.id
    return (a.character.name || "").localeCompare(b.character.name || "")
}

const CharacterTable = ({
    characterRows = [],
    noCharactersMessage = "No characters to display",
    isLoaded = false,
    visibleColumns = [
        ColumnType.STATUS,
        ColumnType.NAME,
        ColumnType.SERVER_NAME,
        ColumnType.GUILD,
        ColumnType.LEVEL,
        ColumnType.CLASSES,
        ColumnType.LOCATION,
        ColumnType.ACTIONS,
    ],
    tableSortFunction = defaultTableSortFunction,
}: Props) => {
    const areaContext = useAreaContext()
    const { areas } = areaContext
    const containerRef = useRef<HTMLDivElement>(null)

    // Function to update shadow based on scroll position
    const updateScrollShadow = useCallback(() => {
        const container = containerRef.current
        if (!container) return

        const table = container.querySelector(".character-table") as HTMLElement
        if (!table) return

        const isScrollable = table.scrollWidth > container.clientWidth

        const isNotAtRightEnd =
            container.scrollLeft < table.scrollWidth - container.clientWidth - 1

        const shouldShowShadow = isScrollable && isNotAtRightEnd
        if (shouldShowShadow) {
            container.classList.add("has-scroll-shadow")
        } else {
            container.classList.remove("has-scroll-shadow")
        }
    }, [])

    // Set up scroll listener and initial shadow state
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        updateScrollShadow()

        container.addEventListener("scroll", updateScrollShadow)
        window.addEventListener("resize", updateScrollShadow)

        return () => {
            container.removeEventListener("scroll", updateScrollShadow)
            window.removeEventListener("resize", updateScrollShadow)
        }
    }, [updateScrollShadow])

    // Update shadow when data changes
    useEffect(() => {
        // Small delay to ensure DOM is updated
        const timeoutId = setTimeout(updateScrollShadow, 10)
        return () => clearTimeout(timeoutId)
    }, [characterRows, visibleColumns, updateScrollShadow])

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
                <span
                    style={{
                        whiteSpace: "nowrap",
                    }}
                >
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
                {visibleColumns.includes(ColumnType.GUILD) && guildNameCell}
                {visibleColumns.includes(ColumnType.LEVEL) && totalLevelCell}
                {visibleColumns.includes(ColumnType.CLASSES) && classesCell}
                {visibleColumns.includes(ColumnType.LOCATION) && locationCell}
                {visibleColumns.includes(ColumnType.ACTIONS) && actionsCell}
            </tr>
        )
    }

    const getTableBody = () => {
        if (characterRows.length > 0) {
            return characterRows.sort(tableSortFunction).map(characterRow)
        }
        if (!isLoaded) {
            return isLoadingRow
        }
        return noCharactersMessageRow
    }

    return (
        <div className="character-table-container" ref={containerRef}>
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
