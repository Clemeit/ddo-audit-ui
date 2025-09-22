import React, {
    useEffect,
    useRef,
    useCallback,
    CSSProperties,
    useState,
} from "react"
import { Character } from "../../models/Character.ts"
import {
    convertMillisecondsToPrettyString,
    mapClassesToString,
} from "../../utils/stringUtils.ts"
import { useAreaContext } from "../../contexts/AreaContext.tsx"
import "./CharacterTable.css"
import { ReactComponent as ExpandSVG } from "../../assets/svg/expand.svg"
import { ReactComponent as ContractSVG } from "../../assets/svg/contract.svg"
import Stack from "../global/Stack.tsx"
import logMessage from "../../utils/logUtils.ts"

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
    showAnonymous?: boolean
    onRowClick?: (character: Character) => void
    defaultSortType?: ColumnType
    defaultSortAscending?: boolean
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
    tableSortFunction,
    maxBodyHeight,
    onReachBottom,
    bottomThreshold = 80,
    showAnonymous = false,
    onRowClick,
    defaultSortType = ColumnType.NAME,
    defaultSortAscending = true,
}: Props) => {
    const areaContext = useAreaContext()
    const { areas } = areaContext
    const containerRef = useRef<HTMLDivElement>(null)
    // Prevent repeated bottom-callback triggers when already at bottom
    const hasTriggeredBottomRef = useRef<boolean>(false)
    const [sortBy, setSortBy] = useState<{
        key: ColumnType
        ascending: boolean
    }>({
        key: defaultSortType,
        ascending: defaultSortAscending,
    })

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
                        backgroundColor:
                            character.is_anonymous && !showAnonymous
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
                    {character.is_anonymous && !showAnonymous
                        ? "Anonymous"
                        : character.name || "Anonymous"}
                </span>
            </td>
        )
        const serverNameCell = <td>{character.server_name}</td>
        const totalLevelCell = <td>{character.total_level}</td>
        const guildNameCell = (
            <td>
                {character.is_anonymous && !showAnonymous
                    ? "-"
                    : character.guild_name}
            </td>
        )
        const classesCell = (
            <td>{mapClassesToString(character.classes, true)}</td>
        )
        const locationCell = (
            <td>
                {character.is_anonymous && !showAnonymous
                    ? "-"
                    : areas[character.location_id || 0]?.name}
            </td>
        )
        const lastSeenCell = (
            <td
                title={new Date(
                    character.last_save || new Date()
                ).toLocaleString()}
            >
                {character.last_save
                    ? convertMillisecondsToPrettyString(
                          new Date().getTime() -
                              new Date(character.last_save).getTime(),
                          true,
                          false,
                          true,
                          2,
                          true
                      )
                    : "N/A"}
            </td>
        )
        const actionsCell = <td style={{ width: 0 }}>{actions}</td>

        return (
            <tr
                className={`character-row${onRowClick ? " clickable" : ""}`}
                key={rowData.character.id}
                onClick={() => {
                    onRowClick?.(character)
                    logMessage("User navigating to character", "info", {
                        metadata: { characterId: character.id },
                    })
                }}
            >
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
            if (tableSortFunction) {
                return characterRows.sort(tableSortFunction).map(characterRow)
            } else {
                const sortFunction = (
                    a: CharacterTableRow,
                    b: CharacterTableRow
                ): number => {
                    let comparison = 0
                    switch (sortBy.key) {
                        case ColumnType.NAME:
                            comparison = (a.character.name || "").localeCompare(
                                b.character.name || ""
                            )
                            break
                        case ColumnType.SERVER_NAME:
                            comparison = (
                                a.character.server_name || ""
                            ).localeCompare(b.character.server_name || "")
                            break
                        case ColumnType.GUILD:
                            comparison = (
                                a.character.guild_name || ""
                            ).localeCompare(b.character.guild_name || "")
                            break
                        case ColumnType.LEVEL:
                            comparison =
                                (a.character.total_level || 0) -
                                (b.character.total_level || 0)
                            break
                        case ColumnType.LAST_SEEN:
                            const aTime = a.character.last_save
                                ? new Date(a.character.last_save).getTime()
                                : 0
                            const bTime = b.character.last_save
                                ? new Date(b.character.last_save).getTime()
                                : 0
                            comparison = aTime - bTime
                            break
                        case ColumnType.CLASSES:
                            comparison = mapClassesToString(
                                a.character.classes
                            ).localeCompare(
                                mapClassesToString(b.character.classes)
                            )
                            break
                        case ColumnType.LOCATION:
                            comparison = (
                                areas[a.character.location_id || 0]?.name || ""
                            ).localeCompare(
                                areas[b.character.location_id || 0]?.name || ""
                            )
                            break
                        default:
                            comparison = 0
                    }
                    if (!sortBy.ascending) {
                        comparison = -comparison
                    }
                    return comparison === 0
                        ? a.character?.id - b.character?.id
                        : comparison
                }
                return characterRows.sort(sortFunction).map(characterRow)
            }
        }
        if (!isLoaded) {
            return isLoadingRow
        }
        return noCharactersMessageRow
    }

    // Helper to render a sortable header cell and avoid duplication
    const renderSortableHeader = useCallback(
        (type: ColumnType, label: string) => {
            if (!visibleColumns.includes(type)) return null

            const isActive = sortBy.key === type
            const Icon = isActive
                ? sortBy.ascending
                    ? ExpandSVG
                    : ContractSVG
                : null

            const handleClick = () => {
                setSortBy((prevSort) => ({
                    key: type,
                    ascending:
                        prevSort.key === type ? !prevSort.ascending : true,
                }))
                logMessage("User sorting table", "info", {
                    metadata: {
                        sortBy: type,
                    },
                })
            }

            return (
                <th style={{ cursor: "pointer" }} onClick={handleClick}>
                    <Stack direction="row" gap="4px" align="center">
                        <span>{label}</span>
                        {Icon ? (
                            <Icon className="sort-icon" aria-hidden="true" />
                        ) : null}
                    </Stack>
                </th>
            )
        },
        [sortBy, visibleColumns, logMessage]
    )

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
                        {renderSortableHeader(ColumnType.NAME, "Name")}
                        {renderSortableHeader(ColumnType.SERVER_NAME, "Server")}
                        {renderSortableHeader(ColumnType.GUILD, "Guild")}
                        {renderSortableHeader(ColumnType.LEVEL, "Level")}
                        {renderSortableHeader(ColumnType.CLASSES, "Classes")}
                        {renderSortableHeader(ColumnType.LOCATION, "Location")}
                        {renderSortableHeader(
                            ColumnType.LAST_SEEN,
                            "Last Seen"
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
