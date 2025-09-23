import { useEffect, useRef, useState } from "react"
import { CharacterActivityData } from "../../models/Activity"
import { dateToShortStringWithTime } from "../../utils/dateUtils"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"
import Stack from "../global/Stack"
import Checkbox from "../global/Checkbox"
import ColoredText from "../global/ColoredText"
import LiveDuration from "../global/LiveDuration"

interface Props {
    onlineActivity: CharacterActivityData[]
    selectedTimestampRange?: {
        start: number | null
        end: number | null
    } | null
    handleActivityClick: (timestampRange: {
        start: number | null
        end: number | null
    }) => void
    lastSelectionSource?: "location" | "level" | "online" | null
    selectionVersion?: number
}

const OnlineActivity = ({
    onlineActivity,
    selectedTimestampRange,
    handleActivityClick,
    lastSelectionSource,
    selectionVersion,
}: Props) => {
    const [showOnlineOnly, setShowOnlineOnly] = useState<boolean>(false)
    const selfSource = "online" as const
    const containerRef = useRef<HTMLDivElement | null>(null)

    // When a selection is set by another table, scroll to our first highlighted row
    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        if (!lastSelectionSource || lastSelectionSource === selfSource) return
        const firstSelected = container.querySelector(
            "tr.selected-row"
        ) as HTMLElement | null
        if (firstSelected) {
            const containerRect = container.getBoundingClientRect()
            const rowRect = firstSelected.getBoundingClientRect()
            const alreadyVisible =
                rowRect.top >= containerRect.top &&
                rowRect.bottom <= containerRect.bottom

            if (!alreadyVisible) {
                const currentScroll = container.scrollTop
                const relativeTop = rowRect.top - containerRect.top
                const desiredOffset = container.clientHeight * 0.25
                const rawTarget = currentScroll + (relativeTop - desiredOffset)
                const maxScroll =
                    container.scrollHeight - container.clientHeight
                const targetTop = Math.max(0, Math.min(rawTarget, maxScroll))
                container.scrollTo({ top: targetTop, behavior: "smooth" })
            }
        }
    }, [
        selectionVersion,
        lastSelectionSource,
        onlineActivity,
        selectedTimestampRange,
    ])

    return (
        <Stack direction="column" gap="10px" style={{ width: "100%" }}>
            <h3
                style={{
                    marginTop: 0,
                    marginBottom: "5px",
                    textDecoration: "underline",
                }}
            >
                Online Activity
            </h3>
            <Stack gap="15px" wrap style={{ rowGap: "0px" }}>
                <Checkbox
                    onChange={(e) => setShowOnlineOnly(e.target.checked)}
                    checked={showOnlineOnly}
                >
                    Only show when I'm online
                </Checkbox>
            </Stack>
            <div
                className="table-container"
                style={{
                    maxHeight: "410px",
                }}
                ref={containerRef}
            >
                <table>
                    <thead>
                        <tr>
                            <th>Status Activity</th>
                            <th>Time</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!onlineActivity ||
                            (onlineActivity.length === 0 && (
                                <tr>
                                    <td className="no-data-row" colSpan={99}>
                                        No data to show
                                    </td>
                                </tr>
                            ))}
                        {onlineActivity?.map((activity, index) => {
                            if (
                                !showOnlineOnly ||
                                activity.data?.status === true
                            ) {
                                const startMs = new Date(
                                    activity.timestamp
                                ).getTime()
                                const endMs =
                                    index === 0
                                        ? null
                                        : new Date(
                                              onlineActivity[
                                                  Math.max(index - 1, 0)
                                              ].timestamp
                                          ).getTime()

                                // Highlight this row if the selected timestamp range intersects this activity segment
                                const isSelected = selectedTimestampRange
                                    ? endMs !== null
                                        ? !(
                                              endMs <=
                                                  (selectedTimestampRange.start ||
                                                      0) ||
                                              startMs >=
                                                  (selectedTimestampRange.end ||
                                                      0)
                                          )
                                        : startMs <=
                                              (selectedTimestampRange.end ||
                                                  0) ||
                                          selectedTimestampRange.end === null
                                    : false

                                return (
                                    <tr
                                        className={`clickable${isSelected ? " selected-row" : ""}`}
                                        key={`${activity.timestamp}-${index}`}
                                        onClick={() =>
                                            handleActivityClick({
                                                start: startMs,
                                                end: endMs,
                                            })
                                        }
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>
                                            {activity?.data?.status === true
                                                ? "Logged In"
                                                : "Logged Out"}
                                        </td>
                                        <td>
                                            {dateToShortStringWithTime(
                                                new Date(activity.timestamp)
                                            )}
                                        </td>
                                        <td>
                                            {index === 0 ? (
                                                <LiveDuration
                                                    start={activity.timestamp}
                                                    // live (now - start)
                                                    intervalMs={1000}
                                                    onlyWhenVisible
                                                    compact
                                                />
                                            ) : (
                                                convertMillisecondsToPrettyString(
                                                    new Date(
                                                        onlineActivity[
                                                            Math.max(
                                                                index - 1,
                                                                0
                                                            )
                                                        ].timestamp
                                                    ).getTime() -
                                                        new Date(
                                                            activity.timestamp
                                                        ).getTime(),
                                                    true,
                                                    true,
                                                    false,
                                                    2,
                                                    true
                                                )
                                            )}
                                        </td>
                                    </tr>
                                )
                            }
                            return null
                        })}
                    </tbody>
                </table>
            </div>
            <div>
                <InfoSVG
                    className="page-message-icon"
                    style={{ fill: `var(--info)` }}
                />
                <ColoredText color="secondary">
                    Some data may be missing or incomplete.
                </ColoredText>
            </div>
        </Stack>
    )
}

export default OnlineActivity
