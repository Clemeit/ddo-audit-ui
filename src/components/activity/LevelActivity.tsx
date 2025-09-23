import { useEffect, useMemo, useRef, useState } from "react"
import { CharacterActivityData } from "../../models/Activity"
import { dateToShortStringWithTime } from "../../utils/dateUtils"
import {
    convertMillisecondsToPrettyString,
    mapClassesToString,
} from "../../utils/stringUtils"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"
import Stack from "../global/Stack"
import Checkbox from "../global/Checkbox"
import ColoredText from "../global/ColoredText"
import LiveDuration from "../global/LiveDuration"
import { Area } from "../../models/Area"

interface Props {
    areas: { [key: number]: Area }
    levelActivity: CharacterActivityData[]
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

const LevelActivity = ({
    areas,
    levelActivity,
    locationActivity,
    onlineActivity,
    selectedTimestampRange,
    handleActivityClick,
    lastSelectionSource,
    selectionVersion,
}: Props) => {
    const selfSource = "level" as const
    const containerRef = useRef<HTMLDivElement | null>(null)
    const isAreaPublicSpace = (areaId: number): boolean => {
        const area = areas[areaId]
        if (!area) return false
        return area.is_public
    }

    const [discardPublicAreaTime, setDiscardPublicAreaTime] =
        useState<boolean>(false)
    const [discardLoggedOutTime, setDiscardLoggedOutTime] =
        useState<boolean>(true)

    // If the character was logged out for all or part of the time between two activities,
    // and the user has chosen to discard logged out time, then we remove that time from the duration calculation.
    // We do this by transforming each level window into one or more segments with a start and end,
    // splitting at online/offline boundaries and keeping only online portions. The Time column shows start,
    // and Duration is end - start (live when end is undefined).
    const adjustedLevelActivity = useMemo(() => {
        type LevelSegment = {
            // Original level event start (for Time column)
            displayStart: string
            // Window boundaries (retain original start/end)
            start: string
            end?: string // undefined means live (now)
            // Adjusted duration in ms, subtracting logged-out and/or public-area time
            duration: number
            data: CharacterActivityData["data"]
            character_id?: number
        }

        if (!levelActivity?.length) return [] as LevelSegment[]

        const now = new Date()

        // Build status segments from latest -> older
        const statusSegments = (onlineActivity || []).map((s, i) => ({
            start: new Date(s.timestamp),
            end: i === 0 ? now : new Date(onlineActivity[i - 1].timestamp),
            online: s.data?.status === true,
            isLatest: i === 0,
        }))

        // Build public-area segments from latest -> older
        const publicSegments = (locationActivity || [])
            .map((s, i) => ({
                start: new Date(s.timestamp),
                end:
                    i === 0 ? now : new Date(locationActivity[i - 1].timestamp),
                isPublic: isAreaPublicSpace(s.data?.location_id || 0),
                isLatest: i === 0,
            }))
            .filter(
                (seg) =>
                    !isNaN(seg.start.getTime()) && !isNaN(seg.end.getTime())
            )

        const nowMs = now.getTime()

        // Helpers
        const overlap = (
            aStart: number,
            aEnd: number,
            bStart: number,
            bEnd: number
        ) => {
            const start = Math.max(aStart, bStart)
            const end = Math.min(aEnd, bEnd)
            return end > start ? [start, end] : null
        }

        const subtractInterval = (
            fromStart: number,
            fromEnd: number,
            subStart: number,
            subEnd: number
        ): Array<[number, number]> => {
            // No overlap
            if (subEnd <= fromStart || subStart >= fromEnd)
                return [[fromStart, fromEnd]]
            // sub covers entire interval
            if (subStart <= fromStart && subEnd >= fromEnd) return []
            const pieces: Array<[number, number]> = []
            // left piece
            if (subStart > fromStart)
                pieces.push([fromStart, Math.min(subStart, fromEnd)])
            // right piece
            if (subEnd < fromEnd)
                pieces.push([Math.max(subEnd, fromStart), fromEnd])
            return pieces.filter(([s, e]) => e > s)
        }

        const segments: LevelSegment[] = []

        for (let i = 0; i < levelActivity.length; i++) {
            const loc = levelActivity[i]
            const windowStart = new Date(loc.timestamp)
            const windowEnd =
                i === 0 ? now : new Date(levelActivity[i - 1].timestamp)

            if (isNaN(windowStart.getTime()) || isNaN(windowEnd.getTime())) {
                continue
            }
            if (windowEnd.getTime() <= windowStart.getTime()) {
                continue
            }

            const displayStartIso = windowStart.toISOString()

            // Build base kept pieces: either full window or only online overlaps
            const wStartMs = windowStart.getTime()
            const wEndMs = windowEnd.getTime()
            type Piece = { startMs: number; endMs: number; endsAtNow: boolean }
            let pieces: Piece[] = []

            if (!discardLoggedOutTime) {
                pieces = [
                    {
                        startMs: wStartMs,
                        endMs: wEndMs,
                        endsAtNow: i === 0 && wEndMs === nowMs,
                    },
                ]
            } else if (!statusSegments.length) {
                // No status data; treat entire window as online
                pieces = [
                    {
                        startMs: wStartMs,
                        endMs: wEndMs,
                        endsAtNow: i === 0 && wEndMs === nowMs,
                    },
                ]
            } else {
                for (let j = 0; j < statusSegments.length; j++) {
                    const ss = statusSegments[j]
                    if (!ss.online) continue

                    const ov = overlap(
                        wStartMs,
                        wEndMs,
                        ss.start.getTime(),
                        ss.end.getTime()
                    )
                    if (ov) {
                        const [sMs, eMs] = ov
                        const endsAtNow = ss.isLatest && eMs === nowMs
                        pieces.push({ startMs: sMs, endMs: eMs, endsAtNow })
                    }
                }
            }

            // Subtract public area time if requested
            if (discardPublicAreaTime && publicSegments.length) {
                const refined: Piece[] = []
                for (const p of pieces) {
                    // Start with this piece as the only remaining interval
                    let current: Array<[number, number]> = [
                        [p.startMs, p.endMs],
                    ]

                    for (const ps of publicSegments) {
                        if (!ps.isPublic) continue
                        const next: Array<[number, number]> = []
                        for (const [rs, re] of current) {
                            const parts = subtractInterval(
                                rs,
                                re,
                                ps.start.getTime(),
                                ps.end.getTime()
                            )
                            next.push(...parts)
                        }
                        current = next
                        if (!current.length) break
                    }

                    for (const [rs, re] of current) {
                        const endsAtNow = p.endsAtNow && re === nowMs
                        refined.push({ startMs: rs, endMs: re, endsAtNow })
                    }
                }
                pieces = refined
            }

            // Calculate total adjusted duration for this window and determine if live time is included
            let totalMs = 0
            let hasLiveIncluded = false
            for (const p of pieces) {
                totalMs += Math.max(0, p.endMs - p.startMs)
                if (p.endsAtNow) hasLiveIncluded = true
            }

            // Emit single segment per level window, retaining original start/end
            segments.push({
                displayStart: displayStartIso,
                start: displayStartIso,
                end: hasLiveIncluded
                    ? undefined
                    : new Date(wEndMs).toISOString(),
                duration: totalMs,
                data: loc.data,
                character_id: loc.character_id,
            })
        }

        return segments
    }, [
        discardLoggedOutTime,
        discardPublicAreaTime,
        levelActivity,
        onlineActivity,
        areas,
    ])

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
    }, [selectionVersion, lastSelectionSource, adjustedLevelActivity])

    return (
        <Stack direction="column" gap="10px" style={{ width: "100%" }}>
            <h3
                style={{
                    marginTop: 0,
                    marginBottom: "5px",
                    textDecoration: "underline",
                }}
            >
                Level Activity
            </h3>
            <Stack gap="15px" wrap style={{ rowGap: "0px" }}>
                <Checkbox
                    onChange={(e) => setDiscardLoggedOutTime(e.target.checked)}
                    checked={discardLoggedOutTime}
                >
                    Don't count time logged out
                </Checkbox>
                <Checkbox
                    onChange={(e) => setDiscardPublicAreaTime(e.target.checked)}
                    checked={discardPublicAreaTime}
                >
                    Don't count time in public areas
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
                            <th>Level</th>
                            <th>Classes</th>
                            <th>Time</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!adjustedLevelActivity ||
                            (adjustedLevelActivity.length === 0 && (
                                <tr>
                                    <td className="no-data-row" colSpan={99}>
                                        No data to show
                                    </td>
                                </tr>
                            ))}
                        {adjustedLevelActivity?.map((activity) => {
                            // Highlight this row if the selected timestamp is within its time window
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

                            return (
                                <tr
                                    className={`clickable${isSelected ? " selected-row" : ""}`}
                                    key={`${activity.start}-${activity.data?.total_level}`}
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
                                    <td>{activity.data?.total_level ?? "-"}</td>
                                    <td>
                                        {mapClassesToString(
                                            activity.data?.classes ?? []
                                        )}
                                    </td>
                                    <td>
                                        {dateToShortStringWithTime(
                                            new Date(activity.displayStart)
                                        )}
                                    </td>
                                    <td>
                                        {activity.end == null ? (
                                            // For live rows, seed LiveDuration so it shows the already-accumulated adjusted time.
                                            <LiveDuration
                                                start={new Date(
                                                    Date.now() -
                                                        activity.duration
                                                ).toISOString()}
                                                intervalMs={1000}
                                                onlyWhenVisible
                                                compact
                                            />
                                        ) : (
                                            convertMillisecondsToPrettyString(
                                                activity.duration,
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

export default LevelActivity
