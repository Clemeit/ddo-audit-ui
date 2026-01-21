import { CSSProperties, useCallback, useEffect, useMemo, useRef } from "react"
import { Quest } from "../../models/Lfm"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils"
import {
    getRelativeMetricColor,
    getRelativeString,
} from "../../utils/questUtils"
import { useNavigate } from "react-router-dom"
import logMessage from "../../utils/logUtils"
import { ReactComponent as UpSVG } from "../../assets/svg/contract.svg"
import { ReactComponent as DownSVG } from "../../assets/svg/expand.svg"

// Helper to get the best available XP value with fallback logic
const getBestXpValue = (
    xp: Quest["xp"],
    type: "heroic" | "epic"
): number | null => {
    const prefix = type === "heroic" ? "heroic" : "epic"

    const elite = xp[`${prefix}_elite` as keyof typeof xp]
    if (elite && elite > 0) return elite

    const hard = xp[`${prefix}_hard` as keyof typeof xp]
    if (hard && hard > 0) return hard

    const normal = xp[`${prefix}_normal` as keyof typeof xp]
    if (normal && normal > 0) return normal

    const casual = xp[`${prefix}_casual` as keyof typeof xp]
    if (casual && casual > 0) return casual

    return null
}

// Calculate XP per minute using best available XP value
const calculateXpPerMinute = (
    quest: Quest,
    type: "heroic" | "epic"
): number | null => {
    if (!quest.length) return null
    const xpValue = getBestXpValue(quest.xp, type)
    if (!xpValue) return null
    return Math.round(xpValue / (quest.length / 60))
}

interface Props {
    quests: Quest[]
    maxBodyHeight?: number | string
    isLoading?: boolean
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
                    <td className="no-data-row" colSpan={4}>
                        No quests to display
                    </td>
                </tr>
            )
        }

        return quests
            .filter((quest) => quest.id && quest.name)
            .flatMap((quest) => {
                const key = `quest_${quest.id}`

                return (
                    <tr
                        key={key}
                        className={"clickable"}
                        onClick={() => {
                            if (quest) handleRowClick(quest)
                        }}
                    >
                        <td>{quest.name || "Unknown Quest"}</td>
                        <td>{quest.heroic_normal_cr || ""}</td>
                        <td>{quest.epic_normal_cr || ""}</td>
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
                        <td
                            style={{
                                color: getRelativeMetricColor(
                                    quest.heroic_xp_per_minute_relative
                                ),
                            }}
                            title={`${
                                Math.round(
                                    quest.heroic_xp_per_minute_relative * 100
                                ) / 100
                            }/1`}
                        >
                            {(() => {
                                const xpPerMin = calculateXpPerMinute(
                                    quest,
                                    "heroic"
                                )
                                if (!xpPerMin) return ""
                                return `${xpPerMin}${
                                    quest.heroic_xp_per_minute_relative != null
                                        ? ` (${getRelativeString(
                                              quest.heroic_xp_per_minute_relative
                                          ).replace(/\s/g, "\u00A0")})`
                                        : ""
                                }`
                            })()}
                        </td>
                        <td
                            style={{
                                color: getRelativeMetricColor(
                                    quest.epic_xp_per_minute_relative
                                ),
                            }}
                            title={`${Math.round(quest.epic_xp_per_minute_relative * 100) / 100}/1`}
                        >
                            {(() => {
                                const xpPerMin = calculateXpPerMinute(
                                    quest,
                                    "epic"
                                )
                                if (!xpPerMin) return ""
                                return `${xpPerMin}${
                                    quest.epic_xp_per_minute_relative != null
                                        ? ` (${getRelativeString(
                                              quest.epic_xp_per_minute_relative
                                          ).replace(/\s/g, "\u00A0")})`
                                        : ""
                                }`
                            })()}
                        </td>
                        <td
                            style={{
                                color: getRelativeMetricColor(
                                    quest.heroic_popularity_relative
                                ),
                            }}
                            title={`${Math.round(quest.heroic_popularity_relative * 100) / 100}/1`}
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

    const getSortIcon = useCallback(
        (fieldName: string) => {
            const icon = sortDirection === "asc" ? <UpSVG /> : <DownSVG />
            if (sortField === fieldName) {
                return icon
            }
        },
        [sortField, sortDirection]
    )

    return (
        <div
            className="table-container"
            style={containerStyle}
            ref={tableBodyRef}
        >
            <table className={`quest-table  ${isLoading ? "loading" : ""}`}>
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
                                Level&nbsp;(Heroic)
                                {getSortIcon("heroic_normal_cr")}
                            </div>
                        </th>
                        <th
                            style={{
                                cursor: "pointer",
                            }}
                            onClick={() => handleHeaderClick("epic_normal_cr")}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                Level&nbsp;(Epic)
                                {getSortIcon("epic_normal_cr")}
                            </div>
                        </th>
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
                                XP/Minute&nbsp;(HE)
                                {getSortIcon("heroic_xp_per_minute")}
                            </div>
                        </th>
                        <th
                            style={{
                                cursor: "pointer",
                            }}
                            onClick={() =>
                                handleHeaderClick("epic_xp_per_minute", "desc")
                            }
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                XP/Minute&nbsp;(EE)
                                {getSortIcon("epic_xp_per_minute")}
                            </div>
                        </th>
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
