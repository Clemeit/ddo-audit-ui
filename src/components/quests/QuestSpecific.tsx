import { useMemo, useState } from "react"
import Page from "../global/Page"
import { ContentCluster, ContentClusterGroup } from "../global/ContentCluster"
import Link from "../global/Link"
import useGetQuestMetrics from "../../hooks/useGetQuestMetrics"
import { useQuestContext } from "../../contexts/QuestContext"
import QuestLengthHistogram from "./QuestLengthHistogram"
import QuestActivityByHour from "./QuestActivityByHour"
import QuestActivityOverTime from "./QuestActivityOverTime"
import QuestActivityByDayOfWeek from "./QuestActivityByDayOfWeek"
import { Quest } from "../../models/Lfm"
import Checkbox from "../global/Checkbox"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils"
import ColoredText from "../global/ColoredText"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"

const QuestSpecific = () => {
    const { quests } = useQuestContext()

    const { currentQuest, rawQuestName } = useMemo(() => {
        // Check for injection risk
        const pathParts = window.location.pathname.split("/")
        const decodedString = decodeURIComponent(
            pathParts[pathParts.length - 1]
        )
        const nameWithSpaces = decodedString.replace(/_/g, " ")

        let currentQuest: Quest = null
        for (const quest of Object.values(quests || {})) {
            if (quest.name === nameWithSpaces) {
                currentQuest = quest
                break
            }
        }

        return { currentQuest, rawQuestName: nameWithSpaces }
    }, [quests])

    const { questMetrics, isLoading } = useGetQuestMetrics(currentQuest?.id)

    const [rawNumbers, setRawNumbers] = useState<boolean>(false)

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
            console.log("xp", xp)
            console.log("averageTimeSeconds", averageTimeSeconds)
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

    const pageContent = () => {
        if (currentQuest == undefined) {
            return (
                <ContentCluster title="Quest Not Found">
                    <p>
                        Sorry, we could not find a quest with the name "
                        {rawQuestName}".
                    </p>
                </ContentCluster>
            )
        }

        if (!questMetrics) {
            return (
                <ContentCluster title="Quest Not Found">
                    <p>
                        Sorry, there's no data currently available for "
                        {currentQuest.name}". Please check back later.
                    </p>
                </ContentCluster>
            )
        }

        return (
            <ContentClusterGroup>
                <ContentCluster title={currentQuest?.name}>
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
                                {xpRows.map(({ label, xp, xpPerMin }) => (
                                    <tr key={label}>
                                        <td style={{ padding: "6px 8px" }}>
                                            {label}
                                        </td>
                                        <td style={{ padding: "6px 8px" }}>
                                            {xp ?? "N/A"}
                                        </td>
                                        <td style={{ padding: "6px 8px" }}>
                                            {xpPerMin ?? "N/A"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Checkbox
                        onChange={(e) => setRawNumbers(e.target.checked)}
                        checked={rawNumbers}
                        style={{
                            marginTop: "5px",
                        }}
                    >
                        Raw numbers
                    </Checkbox>
                    <br />
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
                                                    ?.total_sessions ?? 0
                                            )
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Average duration:</td>
                                    <td>
                                        {convertMillisecondsToPrettyString({
                                            millis:
                                                (questMetrics?.data
                                                    ?.analytics_data
                                                    ?.average_duration_seconds ??
                                                    0) * 1000,
                                            commaSeparated: true,
                                            useFullWords: true,
                                        })}
                                    </td>
                                </tr>
                                <tr>
                                    <td>Standard deviation duration:</td>
                                    <td>
                                        {convertMillisecondsToPrettyString({
                                            millis:
                                                (questMetrics?.data
                                                    ?.analytics_data
                                                    ?.standard_deviation_seconds ??
                                                    0) * 1000,
                                            commaSeparated: true,
                                            useFullWords: true,
                                        })}
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
                            Some XP values may be incorrect. Report issues{" "}
                            <Link to="/feedback">here</Link>.
                        </ColoredText>
                    </div>
                </ContentCluster>
                <ContentCluster title={`${currentQuest?.name} Activity`}>
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
