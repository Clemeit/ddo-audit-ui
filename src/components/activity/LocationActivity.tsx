import { useEffect, useMemo, useRef, useState } from "react"
import { CharacterActivityData } from "../../models/Activity"
import { Quest } from "../../models/Lfm"
import { dateToShortStringWithTime } from "../../utils/dateUtils"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"
import Stack from "../global/Stack"
import Checkbox from "../global/Checkbox"
import ColoredText from "../global/ColoredText"
import LiveDuration from "../global/LiveDuration"
import { Area } from "../../models/Area"

interface Props {
    quests: { [key: number]: Quest }
    areas: { [key: number]: Area }
    locationActivity: CharacterActivityData[]
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

const LocationActivity = ({
    quests,
    areas,
    locationActivity,
    onlineActivity,
    selectedTimestampRange,
    handleActivityClick,
    lastSelectionSource,
    selectionVersion,
}: Props) => {
    const selfSource = "location" as const
    const containerRef = useRef<HTMLDivElement | null>(null)
    const questsArray = useMemo(() => Object.values(quests), [quests])

    const getQuestForArea = (areaId: number): Quest | undefined => {
        if (areas[areaId]?.is_public || areas[areaId]?.is_wilderness) {
            return undefined
        }
        return questsArray.find((quest) => quest.area_id === areaId)
    }

    const [hidePublicAreas, setHidePublicAreas] = useState<boolean>(false)
    const [hidewildernessAreas, setHidewildernessAreas] =
        useState<boolean>(false)
    const [discardLoggedOutTime, setDiscardLoggedOutTime] =
        useState<boolean>(true)

    // If the character was logged out for all or part of the time between two activities,
    // and the user has chosen to discard logged out time, then we remove that time from the duration calculation.
    // We do this by transforming each location window into one or more segments with a start and end,
    // splitting at online/offline boundaries and keeping only online portions. The Time column shows start,
    // and Duration is end - start (live when end is undefined).
    const adjustedLocationActivity = useMemo(() => {
        type LocationSegment = {
            // Original location event start (for Time column)
            displayStart: string
            // Actual segment start for duration calculation (>= displayStart)
            start: string
            // Segment end; undefined means live (now)
            end?: string
            data: CharacterActivityData["data"]
            character_id?: number
        }

        if (!locationActivity?.length) return [] as LocationSegment[]

        const now = new Date()

        // Build status segments from latest -> older
        const statusSegments = (onlineActivity || []).map((s, i) => ({
            start: new Date(s.timestamp),
            end: i === 0 ? now : new Date(onlineActivity[i - 1].timestamp),
            online: s.data?.status === true,
            isLatest: i === 0,
        }))

        const segments: LocationSegment[] = []

        for (let i = 0; i < locationActivity.length; i++) {
            const loc = locationActivity[i]
            const windowStart = new Date(loc.timestamp)
            const windowEnd =
                i === 0 ? now : new Date(locationActivity[i - 1].timestamp)

            if (isNaN(windowStart.getTime()) || isNaN(windowEnd.getTime())) {
                continue
            }
            if (windowEnd.getTime() <= windowStart.getTime()) {
                continue
            }

            const displayStartIso = windowStart.toISOString()

            if (!discardLoggedOutTime) {
                // Single segment per location window
                const isLive = i === 0
                segments.push({
                    displayStart: displayStartIso,
                    start: windowStart.toISOString(),
                    end: isLive ? undefined : windowEnd.toISOString(),
                    data: loc.data,
                    character_id: loc.character_id,
                })
                continue
            }

            // Split by online segments; include only online overlaps
            if (!statusSegments.length) {
                // Fallback: treat entire window as online if no status data
                const isLive = i === 0
                segments.push({
                    displayStart: displayStartIso,
                    start: windowStart.toISOString(),
                    end: isLive ? undefined : windowEnd.toISOString(),
                    data: loc.data,
                    character_id: loc.character_id,
                })
                continue
            }

            for (let j = 0; j < statusSegments.length; j++) {
                const ss = statusSegments[j]
                if (!ss.online) continue

                const overlapStartMs = Math.max(
                    windowStart.getTime(),
                    ss.start.getTime()
                )
                const overlapEndMs = Math.min(
                    windowEnd.getTime(),
                    ss.end.getTime()
                )
                if (overlapEndMs > overlapStartMs) {
                    const endsAtNow =
                        ss.isLatest && overlapEndMs === now.getTime()
                    segments.push({
                        displayStart: displayStartIso,
                        start: new Date(overlapStartMs).toISOString(),
                        end: endsAtNow
                            ? undefined
                            : new Date(overlapEndMs).toISOString(),
                        data: loc.data,
                        character_id: loc.character_id,
                    })
                }
            }
        }

        return segments
    }, [discardLoggedOutTime, locationActivity, onlineActivity])

    // When a selection comes from another table, scroll to the first highlighted row
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
    }, [selectionVersion, lastSelectionSource, adjustedLocationActivity])

    return (
        <Stack direction="column" gap="10px" style={{ width: "100%" }}>
            <h3
                style={{
                    marginTop: 0,
                    marginBottom: "5px",
                    textDecoration: "underline",
                }}
            >
                Location and Quest Activity
            </h3>
            <Stack gap="15px" wrap style={{ rowGap: "0px" }}>
                <Checkbox
                    onChange={(e) => setHidePublicAreas(e.target.checked)}
                    checked={hidePublicAreas}
                >
                    Hide public areas
                </Checkbox>
                <Checkbox
                    onChange={(e) => setHidewildernessAreas(e.target.checked)}
                    checked={hidewildernessAreas}
                >
                    Hide wilderness areas
                </Checkbox>
                <Checkbox
                    onChange={(e) => setDiscardLoggedOutTime(e.target.checked)}
                    checked={discardLoggedOutTime}
                >
                    Don't count time logged out
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
                            <th>Location</th>
                            <th>Quest</th>
                            <th>Time</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!adjustedLocationActivity ||
                            (adjustedLocationActivity.length === 0 && (
                                <tr>
                                    <td className="no-data-row" colSpan={99}>
                                        No data to show
                                    </td>
                                </tr>
                            ))}
                        {adjustedLocationActivity?.map((activity) => {
                            // Highlight this row if the selected timestamp range intersects this activity segment
                            const isSelected =
                                selectedTimestampRange && activity.end
                                    ? !(
                                          Date.parse(activity.end) <=
                                              (selectedTimestampRange.start ||
                                                  0) ||
                                          Date.parse(activity.start) >=
                                              (selectedTimestampRange.end || 0)
                                      )
                                    : selectedTimestampRange &&
                                      !activity.end &&
                                      (new Date(activity.start).getTime() <=
                                          (selectedTimestampRange.end || 0) ||
                                          selectedTimestampRange.end === null)

                            const isPublic =
                                areas[activity.data?.location_id || 0]
                                    ?.is_public
                            const isWilderness =
                                areas[activity.data?.location_id || 0]
                                    ?.is_wilderness

                            if (isWilderness && hidewildernessAreas) {
                                return null
                            }
                            if (hidePublicAreas && isPublic) {
                                return null
                            }

                            return (
                                <tr
                                    className={`clickable${isSelected ? " selected-row" : ""}`}
                                    key={`${activity.start}-${activity.data?.location_id}`}
                                    onClick={() =>
                                        handleActivityClick({
                                            start: new Date(
                                                activity.start
                                            ).getTime(),
                                            end: activity.end
                                                ? new Date(
                                                      activity.end
                                                  ).getTime()
                                                : null,
                                        })
                                    }
                                    style={{
                                        cursor: "pointer",
                                    }}
                                >
                                    <td>
                                        {
                                            areas[
                                                activity.data?.location_id || 0
                                            ].name
                                        }
                                    </td>
                                    <td>
                                        {
                                            getQuestForArea(
                                                activity.data?.location_id
                                            )?.name
                                        }
                                    </td>
                                    <td>
                                        {dateToShortStringWithTime(
                                            new Date(activity.displayStart)
                                        )}
                                    </td>
                                    <td>
                                        {activity.end == null ? (
                                            <LiveDuration
                                                start={activity.start}
                                                intervalMs={1000}
                                                onlyWhenVisible
                                                compact
                                            />
                                        ) : (
                                            convertMillisecondsToPrettyString(
                                                new Date(
                                                    activity.end
                                                ).getTime() -
                                                    new Date(
                                                        activity.start
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
                        })}
                        {adjustedLocationActivity &&
                            adjustedLocationActivity.length >= 0 && (
                                <tr>
                                    <td className="no-data-row" colSpan={99}>
                                        End of history
                                    </td>
                                </tr>
                            )}
                    </tbody>
                </table>
            </div>
            <div>
                <InfoSVG
                    className="page-message-icon"
                    style={{ fill: `var(--info)` }}
                />
                <ColoredText color="secondary">
                    Not all quests are tracked. Some data may be missing or
                    incomplete.
                </ColoredText>
            </div>
        </Stack>
    )
}

export default LocationActivity
