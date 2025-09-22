import React, { useEffect, useRef, useCallback, CSSProperties } from "react"
import { Character } from "../../models/Character.ts"
import {
    convertMillisecondsToPrettyString,
    mapClassesToString,
} from "../../utils/stringUtils.ts"
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
    LAST_SEEN,
}

export interface CharacterTableRow {
    character: Character
    actions: React.ReactNode
}

interface Props {
    characterRows?: CharacterTableRow[]
    noCharactersMessage?: string | React.ReactNode
    isLoaded?: boolean
    visibleColumns?: ColumnType[]
    tableSortFunction?: (a: CharacterTableRow, b: CharacterTableRow) => number
    maxBodyHeight?: number | string
    defaultSortValue?: string
    // Called when the user scrolls to the bottom of the table body
    onReachBottom?: () => void
    // Optional pixel threshold from bottom to trigger onReachBottom
    bottomThreshold?: number
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
    maxBodyHeight,
    onReachBottom,
    bottomThreshold = 80,
}: Props) => {
    const areaContext = useAreaContext()
    const { areas } = areaContext
    const containerRef = useRef<HTMLDivElement>(null)
    // Prevent repeated bottom-callback triggers when already at bottom
    const hasTriggeredBottomRef = useRef<boolean>(false)

    const containerStyle: CSSProperties | undefined =
        maxBodyHeight !== undefined
            ? {
                  maxHeight:
                      typeof maxBodyHeight === "number"
                          ? `${maxBodyHeight}px`
                          : maxBodyHeight,
              }
            : undefined

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

    // Handle scroll: update right-side shadow and detect reaching bottom
    const handleScroll = useCallback(() => {
        updateScrollShadow()

        const container = containerRef.current
        if (!container || !onReachBottom) return

        const atBottom =
            container.scrollTop + container.clientHeight >=
            container.scrollHeight - bottomThreshold

        if (atBottom && !hasTriggeredBottomRef.current) {
            hasTriggeredBottomRef.current = true
            onReachBottom()
        } else if (!atBottom && hasTriggeredBottomRef.current) {
            // Reset latch when user moves away from bottom
            hasTriggeredBottomRef.current = false
        }
    }, [bottomThreshold, onReachBottom, updateScrollShadow])

    // Set up scroll listener and initial shadow state
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        // Initial state
        handleScroll()

        container.addEventListener("scroll", handleScroll)
        window.addEventListener("resize", handleScroll)

        return () => {
            container.removeEventListener("scroll", handleScroll)
            window.removeEventListener("resize", handleScroll)
        }
    }, [handleScroll])

    // Update shadow when data changes
    useEffect(() => {
        // Small delay to ensure DOM is updated
        const timeoutId = setTimeout(() => {
            // Re-evaluate scroll state after DOM updates
            handleScroll()
        }, 10)
        return () => clearTimeout(timeoutId)
    }, [characterRows, visibleColumns, handleScroll])

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
        const lastSeenCell = (
            <td title={character.last_save || undefined}>
                {character.last_save
                    ? convertMillisecondsToPrettyString(
                          new Date().getTime() -
                              new Date(character.last_save).getTime(),
                          false,
                          false,
                          true,
                          2
                      )
                    : "N/A"}
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
                {visibleColumns.includes(ColumnType.LAST_SEEN) && lastSeenCell}
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
        <div
            className="character-table-container"
            ref={containerRef}
            style={containerStyle}
        >
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
                        {visibleColumns.includes(ColumnType.LAST_SEEN) && (
                            <th>Last Seen</th>
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
