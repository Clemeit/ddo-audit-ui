import { CSSProperties, useEffect, useMemo, useRef } from "react"
import { Quest } from "../../models/Lfm"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils"
import {
    getRelativeMetricColor,
    getRelativeString,
    calculateQuestXpPerMinute,
} from "../../utils/questUtils"
import { useNavigate } from "react-router-dom"
import logMessage from "../../utils/logUtils"
import { ReactComponent as UpSVG } from "../../assets/svg/contract.svg"
import { ReactComponent as DownSVG } from "../../assets/svg/expand.svg"
interface Props {
    quests: Quest[]
    maxBodyHeight?: number | string
    isLoading?: boolean
    highlightQuestId?: number
    hideHeroicLevelColumn?: boolean
    hideEpicLevelColumn?: boolean
    hideHeroicXpColumn?: boolean
    hideEpicXpColumn?: boolean
    sortField?: string
    setSortField?: React.Dispatch<React.SetStateAction<string>>
    sortDirection?: "asc" | "desc"
    setSortDirection?: React.Dispatch<React.SetStateAction<"asc" | "desc">>
    onTableScroll?: (scrollPos: number) => void
    initialScrollPosition?: number
    scrollResetKey?: number
}

const QuestTable = ({
    quests = [],
    maxBodyHeight,
    isLoading,
    highlightQuestId,
    hideHeroicLevelColumn = false,
    hideEpicLevelColumn = false,
    hideHeroicXpColumn = false,
    hideEpicXpColumn = false,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    onTableScroll,
    initialScrollPosition = 0,
    scrollResetKey,
}: Props) => {
    const tableBodyRef = useRef<HTMLDivElement | null>(null)
    const navigate = useNavigate()

    // Wire scroll events and persistence to the table container
    useEffect(() => {
        const el = tableBodyRef.current
        if (!el || !onTableScroll) return

        const handleScroll = () => onTableScroll(el.scrollTop)

        el.addEventListener("scroll", handleScroll)
        return () => el.removeEventListener("scroll", handleScroll)
    }, [onTableScroll])

    // Restore prior scroll position after data changes
    useEffect(() => {
        const el = tableBodyRef.current
        if (!el) return
        setTimeout(() => {
            if (el) el.scrollTop = initialScrollPosition
        }, 0)
    }, [quests, initialScrollPosition, scrollResetKey])

    const containerStyle: CSSProperties | undefined =
        maxBodyHeight !== undefined
            ? {
                  maxHeight:
                      typeof maxBodyHeight === "number"
                          ? `${maxBodyHeight}px`
                          : maxBodyHeight,
                  overflowY: "auto",
              }
            : undefined

    const visibleColumnCount = useMemo(() => {
        let count = 8
        if (hideHeroicLevelColumn) count -= 1
        if (hideEpicLevelColumn) count -= 1
        if (hideHeroicXpColumn) count -= 1
        if (hideEpicXpColumn) count -= 1
        return count
    }, [
        hideEpicLevelColumn,
        hideEpicXpColumn,
        hideHeroicLevelColumn,
        hideHeroicXpColumn,
    ])

    const handleHeaderClick = (
        fieldName: string,
        defaultOrder: "asc" | "desc" = "asc"
    ) => {
        if (!setSortField || !setSortDirection) return

        if (sortField === fieldName) {
            // Toggle direction if clicking the same field
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            // Set new field with ascending direction
            setSortField(fieldName)
            setSortDirection(defaultOrder)
        }
    }

    const handleRowClick = (quest: Quest) => {
        const withUnderscores = quest.name?.replace(/\s/g, "_") || ""
        const questNameEncoded = encodeURIComponent(withUnderscores)

        navigate(`/quests/${questNameEncoded}`)
        logMessage("User navigating to quest specific", "info", {
            metadata: {
                questId: quest.id,
                questName: quest.name,
                questNameEncoded: questNameEncoded,
            },
        })
    }

    const getTableContent = () => {
        if (quests.length === 0) {
            return (
                <tr>
                    <td className="no-data-row" colSpan={visibleColumnCount}>
                        No quests to display
                    </td>
                </tr>
            )
        }

        return quests
            .filter((quest) => quest.id && quest.name)
            .map((quest) => {
                const key = `quest_${quest.id}`
                const isHighlightedRow =
                    highlightQuestId != null && quest.id === highlightQuestId

                const heroicXpPerMin = calculateQuestXpPerMinute(
                    quest,
                    "heroic"
                )
                const heroicXpLabel = heroicXpPerMin
                    ? `${heroicXpPerMin}${quest.heroic_xp_per_minute_relative != null ? ` (${getRelativeString(quest.heroic_xp_per_minute_relative).replace(/\s/g, "\u00A0")})` : ""}`
                    : ""

                const epicXpPerMin = calculateQuestXpPerMinute(quest, "epic")
                const epicXpLabel = epicXpPerMin
                    ? `${epicXpPerMin}${quest.epic_xp_per_minute_relative != null ? ` (${getRelativeString(quest.epic_xp_per_minute_relative).replace(/\s/g, "\u00A0")})` : ""}`
                    : ""

                return (
                    <tr
                        key={key}
                        className={`clickable ${isHighlightedRow ? "selected-row" : ""}`.trim()}
                        onClick={() => {
                            if (quest) handleRowClick(quest)
                        }}
                    >
                        <td>{quest.name || "Unknown Quest"}</td>
                        {!hideHeroicLevelColumn && (
                            <td>{quest.heroic_normal_cr || ""}</td>
                        )}
                        {!hideEpicLevelColumn && (
                            <td>{quest.epic_normal_cr || ""}</td>
                        )}
                        <td>{quest.required_adventure_pack || ""}</td>
                        <td>
                            {quest.length != undefined
                                ? convertMillisecondsToPrettyString({
                                      millis: quest.length * 1000,
                                      commaSeparated: true,
                                      useFullWords: true,
                                      nonBreakingSpace: true,
                                  })
                                : ""}
                        </td>
                        {!hideHeroicXpColumn && (
                            <td
                                style={{
                                    color: getRelativeMetricColor(
                                        quest.heroic_xp_per_minute_relative
                                    ),
                                }}
                                title={
                                    quest.heroic_xp_per_minute_relative !=
                                    undefined
                                        ? `${
                                              Math.round(
                                                  quest.heroic_xp_per_minute_relative *
                                                      100
                                              ) / 100
                                          }/1`
                                        : "No data"
                                }
                            >
                                {heroicXpLabel}
                            </td>
                        )}
                        {!hideEpicXpColumn && (
                            <td
                                style={{
                                    color: getRelativeMetricColor(
                                        quest.epic_xp_per_minute_relative
                                    ),
                                }}
                                title={
                                    quest.epic_xp_per_minute_relative !=
                                    undefined
                                        ? `${Math.round(quest.epic_xp_per_minute_relative * 100) / 100}/1`
                                        : "No data"
                                }
                            >
                                {epicXpLabel}
                            </td>
                        )}
                        <td
                            style={{
                                color: getRelativeMetricColor(
                                    quest.heroic_popularity_relative
                                ),
                            }}
                            title={
                                quest.heroic_popularity_relative != undefined
                                    ? `${Math.round(quest.heroic_popularity_relative * 100) / 100}/1`
                                    : "No data"
                            }
                        >
                            {quest.heroic_popularity_relative != undefined
                                ? getRelativeString(
                                      quest.heroic_popularity_relative
                                  ).replace(/\s/g, "\u00A0")
                                : ""}
                        </td>
                    </tr>
                )
            })
    }

    const getSortIcon = (fieldName: string) => {
        const icon = sortDirection === "asc" ? <UpSVG /> : <DownSVG />
        if (sortField === fieldName) {
            return icon
        }
    }

    return (
        <div
            className="table-container"
            style={containerStyle}
            ref={tableBodyRef}
        >
            <table
                className={`quest-table ${isLoading ? "loading" : ""}`.trim()}
            >
                <thead>
                    <tr>
                        <th
                            style={{
                                cursor: "pointer",
                            }}
                            onClick={() => handleHeaderClick("name")}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                Quest&nbsp;Name
                                {getSortIcon("name")}
                            </div>
                        </th>
                        {!hideHeroicLevelColumn && (
                            <th
                                style={{
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    handleHeaderClick("heroic_normal_cr")
                                }
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    Level
                                    {!hideEpicLevelColumn && "\u00A0(Heroic)"}
                                    {getSortIcon("heroic_normal_cr")}
                                </div>
                            </th>
                        )}
                        {!hideEpicLevelColumn && (
                            <th
                                style={{
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    handleHeaderClick("epic_normal_cr")
                                }
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    Level
                                    {!hideHeroicLevelColumn && "\u00A0(Epic)"}
                                    {getSortIcon("epic_normal_cr")}
                                </div>
                            </th>
                        )}
                        <th
                            style={{
                                cursor: "pointer",
                            }}
                            onClick={() =>
                                handleHeaderClick("required_adventure_pack")
                            }
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                Adventure&nbsp;Pack
                                {getSortIcon("required_adventure_pack")}
                            </div>
                        </th>
                        <th
                            style={{
                                cursor: "pointer",
                            }}
                            onClick={() => handleHeaderClick("length")}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                Length
                                {getSortIcon("length")}
                            </div>
                        </th>
                        {!hideHeroicXpColumn && (
                            <th
                                style={{
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    handleHeaderClick(
                                        "heroic_xp_per_minute",
                                        "desc"
                                    )
                                }
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    XP/Minute
                                    {!hideEpicXpColumn && "\u00A0(HE)"}
                                    {getSortIcon("heroic_xp_per_minute")}
                                </div>
                            </th>
                        )}
                        {!hideEpicXpColumn && (
                            <th
                                style={{
                                    cursor: "pointer",
                                }}
                                onClick={() =>
                                    handleHeaderClick(
                                        "epic_xp_per_minute",
                                        "desc"
                                    )
                                }
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    XP/Minute
                                    {!hideHeroicXpColumn && "\u00A0(EE)"}
                                    {getSortIcon("epic_xp_per_minute")}
                                </div>
                            </th>
                        )}
                        <th
                            style={{
                                cursor: "pointer",
                            }}
                            onClick={() =>
                                handleHeaderClick("popularity", "desc")
                            }
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                Popularity
                                {getSortIcon("popularity")}
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>{getTableContent()}</tbody>
            </table>
        </div>
    )
}

export default QuestTable
