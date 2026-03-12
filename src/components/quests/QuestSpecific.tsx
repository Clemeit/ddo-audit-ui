import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import Page from "../global/Page"
import { ContentCluster, ContentClusterGroup } from "../global/ContentCluster"
import Link from "../global/Link"
import useGetQuestMetrics from "../../hooks/useGetQuestMetrics"
import { useQuestContext } from "../../contexts/QuestContext"
import { useAreaContext } from "../../contexts/AreaContext"
import QuestLengthHistogram from "./QuestLengthHistogram"
import QuestActivityByHour from "./QuestActivityByHour"
import QuestActivityOverTime from "./QuestActivityOverTime"
import QuestActivityByDayOfWeek from "./QuestActivityByDayOfWeek"
import { Quest } from "../../models/Lfm"
import Checkbox from "../global/Checkbox"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils"
import ColoredText from "../global/ColoredText"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"
import { ReactComponent as OpenInNew } from "../../assets/svg/open-in-new.svg"
import WebLink from "../global/WebLink"
import QuestTable from "./QuestTable"
import {
    getRelativeMetricColor,
    getRelativeString,
} from "../../utils/questUtils"

const sortQuests = (
    quests: Quest[],
    sortField: string,
    sortDirection: "asc" | "desc"
): Quest[] => {
    return [...quests].sort((a, b) => {
        let aValue: string | number | null | undefined
        let bValue: string | number | null | undefined
        switch (sortField) {
            case "name":
                aValue = a.name
                bValue = b.name
                break
            case "heroic_normal_cr":
                aValue = a.heroic_normal_cr
                bValue = b.heroic_normal_cr
                break
            case "epic_normal_cr":
                aValue = a.epic_normal_cr
                bValue = b.epic_normal_cr
                break
            case "required_adventure_pack":
                aValue = a.required_adventure_pack
                bValue = b.required_adventure_pack
                break
            case "length":
                aValue = a.length
                bValue = b.length
                break
            case "heroic_xp_per_minute":
                aValue = a.heroic_xp_per_minute_relative
                bValue = b.heroic_xp_per_minute_relative
                break
            case "epic_xp_per_minute":
                aValue = a.epic_xp_per_minute_relative
                bValue = b.epic_xp_per_minute_relative
                break
            case "popularity":
                aValue = a.heroic_popularity_relative
                bValue = b.heroic_popularity_relative
                break
            default:
                aValue = a.name
                bValue = b.name
                break
        }

        const aIsEmpty = aValue == null || aValue === ""
        const bIsEmpty = bValue == null || bValue === ""

        if (aIsEmpty && bIsEmpty) {
            return (a.id - b.id) * (sortDirection === "asc" ? 1 : -1)
        }
        if (aIsEmpty) return 1
        if (bIsEmpty) return -1

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1

        return (a.id - b.id) * (sortDirection === "asc" ? 1 : -1)
    })
}

const formatBooleanValue = (value?: boolean): string => {
    if (value == null) return "Unknown"
    return value ? "Yes" : "No"
}

const getBestXpValue = (
    xp: Quest["xp"],
    type: "heroic" | "epic"
): number | null => {
    if (!xp) return null

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

const calculateQuestXpPerMinute = (
    quest: Quest | null,
    type: "heroic" | "epic"
): number | null => {
    if (!quest?.length || !quest.xp) return null
    const xpValue = getBestXpValue(quest.xp, type)
    if (!xpValue) return null
    return Math.round(xpValue / (quest.length / 60))
}

const formatRelativeRawValue = (value?: number | null): string => {
    if (value == null) return ""
    return `${Math.round(value * 1000) / 1000}`
}

const formatXpPerMinuteDisplayValue = (
    xpPerMinute: number | null,
    relativeValue?: number | null
): string => {
    if (!xpPerMinute) return ""
    return `${xpPerMinute}${
        relativeValue != null
            ? ` (${getRelativeString(relativeValue).replace(/\s/g, "\u00A0")})`
            : ""
    }`
}

const formatPopularityDisplayValue = (
    relativeValue?: number | null
): string => {
    if (relativeValue == null) return ""
    return getRelativeString(relativeValue).replace(/\s/g, "\u00A0")
}

const QuestSpecific = () => {
    const { quests } = useQuestContext()
    const { areas } = useAreaContext()
    const { questName } = useParams()

    const rawQuestName = questName?.replace(/_/g, " ") ?? null

    const currentQuest = useMemo<Quest | null>(
        () =>
            rawQuestName
                ? (Object.values(quests || {}).find(
                      (quest) => quest.name === rawQuestName
                  ) ?? null)
                : null,
        [quests, rawQuestName]
    )

    const { questMetrics, isLoading } = useGetQuestMetrics(currentQuest?.id)

    const [rawNumbers, setRawNumbers] = useState<boolean>(false)
    const [heroicSortField, setHeroicSortField] = useState<string>("name")
    const [heroicSortDirection, setHeroicSortDirection] = useState<
        "asc" | "desc"
    >("asc")
    const [epicSortField, setEpicSortField] = useState<string>("name")
    const [epicSortDirection, setEpicSortDirection] = useState<"asc" | "desc">(
        "asc"
    )

    const hasHeroicLevel = currentQuest?.heroic_normal_cr != null
    const hasEpicLevel = currentQuest?.epic_normal_cr != null

    const heroicPeerQuests = useMemo(() => {
        if (!currentQuest || currentQuest.heroic_normal_cr == null) return []

        const targetLevel = currentQuest.heroic_normal_cr
        const candidates = Object.values(quests || {}).filter((quest) => {
            if (!quest?.id) return false
            if (quest.id === currentQuest.id) return true

            if (areas?.[quest.area_id || 0]?.is_wilderness !== false) {
                return false
            }

            if (quest.heroic_normal_cr == null) return false

            return Math.abs(quest.heroic_normal_cr - targetLevel) <= 1
        })

        return sortQuests(candidates, heroicSortField, heroicSortDirection)
    }, [areas, currentQuest, quests, heroicSortDirection, heroicSortField])

    const epicPeerQuests = useMemo(() => {
        if (!currentQuest || currentQuest.epic_normal_cr == null) return []

        const targetLevel = currentQuest.epic_normal_cr
        const candidates = Object.values(quests || {}).filter((quest) => {
            if (!quest?.id) return false
            if (quest.id === currentQuest.id) return true

            if (areas?.[quest.area_id || 0]?.is_wilderness !== false) {
                return false
            }

            if (quest.epic_normal_cr == null) return false

            return Math.abs(quest.epic_normal_cr - targetLevel) <= 1
        })

        return sortQuests(candidates, epicSortField, epicSortDirection)
    }, [areas, currentQuest, quests, epicSortDirection, epicSortField])

    const questWikiLink = useMemo(() => {
        if (!currentQuest?.name) return null
        const pageName = currentQuest.name.replace(/\s+/g, "_")
        return `https://ddowiki.com/page/${encodeURIComponent(pageName)}`
    }, [currentQuest?.name])

    const requiredAdventurePackWikiLink = useMemo(() => {
        if (!currentQuest?.required_adventure_pack) return null
        const pageName = currentQuest.required_adventure_pack.replace(
            /\s+/g,
            "_"
        )
        return `https://ddowiki.com/page/${encodeURIComponent(pageName)}`
    }, [currentQuest?.required_adventure_pack])

    const xpRows = useMemo(() => {
        const averageTimeSeconds =
            questMetrics?.data?.analytics_data?.average_duration_seconds ?? 1
        const formatNumber = (value?: number | null) => {
            if (rawNumbers) return value
            return value != null
                ? new Intl.NumberFormat(undefined).format(Number(value))
                : null
        }
        const calculateXpPerMin = (xp?: number | null) => {
            return xp != null
                ? formatNumber(
                      rawNumbers
                          ? xp / (averageTimeSeconds / 60)
                          : Math.round(xp / (averageTimeSeconds / 60))
                  )
                : null
        }

        const allRows = [
            {
                label: "Heroic Casual",
                value: currentQuest?.xp?.heroic_casual,
            },
            {
                label: "Heroic Normal",
                value: currentQuest?.xp?.heroic_normal,
            },
            {
                label: "Heroic Hard",
                value: currentQuest?.xp?.heroic_hard,
            },
            {
                label: "Heroic Elite",
                value: currentQuest?.xp?.heroic_elite,
            },
            {
                label: "Epic Casual",
                value: currentQuest?.xp?.epic_casual,
            },
            {
                label: "Epic Normal",
                value: currentQuest?.xp?.epic_normal,
            },
            {
                label: "Epic Hard",
                value: currentQuest?.xp?.epic_hard,
            },
            {
                label: "Epic Elite",
                value: currentQuest?.xp?.epic_elite,
            },
        ]

        return allRows
            .filter(({ value }) => value && value != 0)
            .map(({ label, value }) => ({
                label,
                xp: formatNumber(value),
                xpPerMin: calculateXpPerMin(value),
            }))
    }, [currentQuest, rawNumbers, questMetrics])

    const relativeMetricRows = useMemo(() => {
        const metrics = questMetrics?.data?.metrics
        const heroicXpPerMinuteRelative =
            metrics?.heroic_xp_per_minute_relative ??
            currentQuest?.heroic_xp_per_minute_relative
        const epicXpPerMinuteRelative =
            metrics?.epic_xp_per_minute_relative ??
            currentQuest?.epic_xp_per_minute_relative
        const popularityRelative =
            metrics?.heroic_popularity_relative ??
            metrics?.epic_popularity_relative ??
            currentQuest?.heroic_popularity_relative ??
            currentQuest?.epic_popularity_relative

        const heroicXpPerMinute = calculateQuestXpPerMinute(
            currentQuest,
            "heroic"
        )
        const epicXpPerMinute = calculateQuestXpPerMinute(currentQuest, "epic")

        return [
            {
                metric: "XP/Minute (HE)",
                displayValue: formatXpPerMinuteDisplayValue(
                    heroicXpPerMinute,
                    heroicXpPerMinuteRelative
                ),
                rawRelativeValue: formatRelativeRawValue(
                    heroicXpPerMinuteRelative
                ),
                color:
                    heroicXpPerMinuteRelative != null
                        ? getRelativeMetricColor(heroicXpPerMinuteRelative)
                        : undefined,
            },
            {
                metric: "XP/Minute (EE)",
                displayValue: formatXpPerMinuteDisplayValue(
                    epicXpPerMinute,
                    epicXpPerMinuteRelative
                ),
                rawRelativeValue: formatRelativeRawValue(
                    epicXpPerMinuteRelative
                ),
                color:
                    epicXpPerMinuteRelative != null
                        ? getRelativeMetricColor(epicXpPerMinuteRelative)
                        : undefined,
            },
            {
                metric: "Popularity",
                displayValue: formatPopularityDisplayValue(popularityRelative),
                rawRelativeValue: formatRelativeRawValue(popularityRelative),
                color:
                    popularityRelative != null
                        ? getRelativeMetricColor(popularityRelative)
                        : undefined,
            },
        ]
    }, [currentQuest, questMetrics])

    const pageContent = () => {
        if (!currentQuest) {
            return (
                <ContentCluster title="Quest Not Found">
                    <p>
                        Sorry, we could not find a quest with the name "
                        {rawQuestName}".
                    </p>
                </ContentCluster>
            )
        }

        return (
            <ContentClusterGroup>
                <ContentCluster title={currentQuest?.name}>
                    {currentQuest ? (
                        <>
                            <div className="table-container">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Heroic level:</td>
                                            <td>
                                                {currentQuest.heroic_normal_cr ??
                                                    "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Epic level:</td>
                                            <td>
                                                {currentQuest.epic_normal_cr ??
                                                    "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Adventure area:</td>
                                            <td>
                                                {currentQuest.adventure_area ||
                                                    areas?.[
                                                        currentQuest.area_id ||
                                                            0
                                                    ]?.name ||
                                                    "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Quest journal group:</td>
                                            <td>
                                                {currentQuest.quest_journal_group ||
                                                    "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Group size:</td>
                                            <td>
                                                {currentQuest.group_size ||
                                                    "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Patron:</td>
                                            <td>
                                                {currentQuest.patron || "N/A"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Required adventure pack:</td>
                                            <td>
                                                {requiredAdventurePackWikiLink ? (
                                                    <WebLink
                                                        href={
                                                            requiredAdventurePackWikiLink
                                                        }
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "4px",
                                                        }}
                                                    >
                                                        {
                                                            currentQuest.required_adventure_pack
                                                        }
                                                        <OpenInNew
                                                            style={{
                                                                width: "1rem",
                                                                height: "1rem",
                                                                flexShrink: 0,
                                                            }}
                                                        />
                                                    </WebLink>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Free to play:</td>
                                            <td>
                                                {formatBooleanValue(
                                                    currentQuest.is_free_to_play
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Free to VIP:</td>
                                            <td>
                                                {formatBooleanValue(
                                                    currentQuest.is_free_to_vip
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Tip:</td>
                                            <td>{currentQuest.tip || "N/A"}</td>
                                        </tr>
                                        <tr>
                                            <td>DDO Wiki:</td>
                                            <td>
                                                {questWikiLink ? (
                                                    <WebLink
                                                        href={questWikiLink}
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "4px",
                                                        }}
                                                    >
                                                        {currentQuest.name}
                                                        <OpenInNew
                                                            style={{
                                                                width: "1rem",
                                                                height: "1rem",
                                                                flexShrink: 0,
                                                            }}
                                                        />
                                                    </WebLink>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ marginTop: "10px" }}>
                                <InfoSVG
                                    className="page-message-icon"
                                    style={{ fill: `var(--info)` }}
                                />
                                <ColoredText color="secondary">
                                    Report incorrect data{" "}
                                    <Link to="/feedback">here</Link>.
                                </ColoredText>
                            </div>
                        </>
                    ) : (
                        <p>Quest information is not available.</p>
                    )}
                </ContentCluster>
                <ContentCluster title="Quest Analytics">
                    {isLoading && <p>Loading quest analytics...</p>}
                    {!isLoading && !questMetrics && (
                        <p>
                            Sorry, there's no data currently available. Please
                            check back later.
                        </p>
                    )}
                    {!isLoading && questMetrics && (
                        <>
                            <div className="table-container">
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                style={{
                                                    textAlign: "left",
                                                    padding: "6px 8px",
                                                }}
                                            >
                                                Metric
                                            </th>
                                            <th
                                                style={{
                                                    textAlign: "left",
                                                    padding: "6px 8px",
                                                }}
                                            >
                                                Value
                                            </th>
                                            <th
                                                style={{
                                                    textAlign: "left",
                                                    padding: "6px 8px",
                                                }}
                                            >
                                                Raw Relative Value
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {relativeMetricRows.map(
                                            ({
                                                metric,
                                                displayValue,
                                                rawRelativeValue,
                                                color,
                                            }) => (
                                                <tr key={metric}>
                                                    <td
                                                        style={{
                                                            padding: "6px 8px",
                                                        }}
                                                    >
                                                        {metric}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "6px 8px",
                                                            color,
                                                        }}
                                                    >
                                                        {displayValue}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "6px 8px",
                                                            color,
                                                        }}
                                                    >
                                                        {rawRelativeValue}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <br />
                            {xpRows && xpRows.length > 0 && (
                                <>
                                    <div className="table-container">
                                        <table
                                            style={{
                                                width: "100%",
                                                borderCollapse: "collapse",
                                            }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th
                                                        style={{
                                                            textAlign: "left",
                                                            padding: "6px 8px",
                                                        }}
                                                    >
                                                        Difficulty
                                                    </th>
                                                    <th
                                                        style={{
                                                            textAlign: "left",
                                                            padding: "6px 8px",
                                                        }}
                                                    >
                                                        XP
                                                    </th>
                                                    <th
                                                        style={{
                                                            textAlign: "left",
                                                            padding: "6px 8px",
                                                        }}
                                                    >
                                                        XP/Min
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {xpRows.map(
                                                    ({
                                                        label,
                                                        xp,
                                                        xpPerMin,
                                                    }) => (
                                                        <tr key={label}>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px 8px",
                                                                }}
                                                            >
                                                                {label}
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px 8px",
                                                                }}
                                                            >
                                                                {xp ?? "N/A"}
                                                            </td>
                                                            <td
                                                                style={{
                                                                    padding:
                                                                        "6px 8px",
                                                                }}
                                                            >
                                                                {xpPerMin ??
                                                                    "N/A"}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Checkbox
                                        onChange={(e) =>
                                            setRawNumbers(e.target.checked)
                                        }
                                        checked={rawNumbers}
                                        style={{
                                            marginTop: "5px",
                                        }}
                                    >
                                        Raw numbers
                                    </Checkbox>
                                    <br />
                                </>
                            )}
                            <div className="table-container">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Total sessions tracked:</td>
                                            <td>
                                                {new Intl.NumberFormat(
                                                    undefined
                                                ).format(
                                                    Number(
                                                        questMetrics?.data
                                                            ?.analytics_data
                                                            ?.total_sessions ??
                                                            0
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Average duration:</td>
                                            <td>
                                                {convertMillisecondsToPrettyString(
                                                    {
                                                        millis:
                                                            (questMetrics?.data
                                                                ?.analytics_data
                                                                ?.average_duration_seconds ??
                                                                0) * 1000,
                                                        commaSeparated: true,
                                                        useFullWords: true,
                                                    }
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Standard deviation duration:
                                            </td>
                                            <td>
                                                {convertMillisecondsToPrettyString(
                                                    {
                                                        millis:
                                                            (questMetrics?.data
                                                                ?.analytics_data
                                                                ?.standard_deviation_seconds ??
                                                                0) * 1000,
                                                        commaSeparated: true,
                                                        useFullWords: true,
                                                    }
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Data last updated:</td>
                                            <td>
                                                {new Date(
                                                    questMetrics?.updated_at
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ marginTop: "10px" }}>
                                <InfoSVG
                                    className="page-message-icon"
                                    style={{ fill: `var(--info)` }}
                                />
                                <ColoredText color="secondary">
                                    Some XP values may be incorrect. Report
                                    issues <Link to="/feedback">here</Link>.
                                </ColoredText>
                            </div>
                        </>
                    )}
                </ContentCluster>
                <ContentCluster title="Peer Quests">
                    <ColoredText color="secondary">
                        Includes quests within one level. The current quest is
                        highlighted.
                    </ColoredText>

                    {hasHeroicLevel && (
                        <>
                            <h3
                                style={{
                                    marginTop: "20px",
                                    marginBottom: "8px",
                                }}
                            >
                                Heroic Peer Quests
                            </h3>
                            <div style={{ marginTop: "0px" }}>
                                <QuestTable
                                    quests={heroicPeerQuests}
                                    maxBodyHeight="280px"
                                    highlightQuestId={currentQuest.id}
                                    hideEpicLevelColumn
                                    hideEpicXpColumn
                                    sortField={heroicSortField}
                                    setSortField={setHeroicSortField}
                                    sortDirection={heroicSortDirection}
                                    setSortDirection={setHeroicSortDirection}
                                />
                            </div>
                        </>
                    )}

                    {hasEpicLevel && (
                        <>
                            <h3
                                style={{
                                    marginTop: "20px",
                                    marginBottom: "8px",
                                }}
                            >
                                Epic Peer Quests
                            </h3>
                            <div style={{ marginTop: "0px" }}>
                                <QuestTable
                                    quests={epicPeerQuests}
                                    maxBodyHeight="280px"
                                    highlightQuestId={currentQuest.id}
                                    hideHeroicLevelColumn
                                    hideHeroicXpColumn
                                    sortField={epicSortField}
                                    setSortField={setEpicSortField}
                                    sortDirection={epicSortDirection}
                                    setSortDirection={setEpicSortDirection}
                                />
                            </div>
                        </>
                    )}

                    {!hasHeroicLevel && !hasEpicLevel && (
                        <p style={{ marginTop: "10px" }}>
                            This quest does not have heroic or epic level data
                            for peer comparison.
                        </p>
                    )}
                </ContentCluster>
                <ContentCluster title={`Detailed Activity`}>
                    {isLoading && <p>Loading quest activity charts...</p>}
                    {!isLoading && !questMetrics && (
                        <p>No activity data currently available.</p>
                    )}
                    {!isLoading && questMetrics && (
                        <>
                            <QuestLengthHistogram
                                questMetrics={questMetrics?.data}
                                isLoading={isLoading}
                            />
                            <QuestActivityByHour
                                questMetrics={questMetrics?.data}
                                isLoading={isLoading}
                            />
                            <QuestActivityByDayOfWeek
                                questMetrics={questMetrics?.data}
                                isLoading={isLoading}
                            />
                            <QuestActivityOverTime
                                questMetrics={questMetrics?.data}
                                isLoading={isLoading}
                            />
                        </>
                    )}
                </ContentCluster>
            </ContentClusterGroup>
        )
    }

    return (
        <Page
            title={`${currentQuest?.name} | Quest Analytics`}
            description={`Detailed analytics and metrics for the quest ${currentQuest?.name}.`}
        >
            <div style={{ marginBottom: "15px" }}>
                <Link
                    to="/quests"
                    style={{
                        marginBottom: "15px",
                    }}
                >
                    ← Back to Quests
                </Link>
            </div>
            {pageContent()}
        </Page>
    )
}

export default QuestSpecific
