import { useMemo, useState } from "react"
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
}

const LevelActivity = ({
    areas,
    levelActivity,
    locationActivity,
    onlineActivity,
}: Props) => {
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
            // Actual segment start for duration calculation (>= displayStart)
            start: string
            // Segment end; undefined means live (now)
            end?: string
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

            // Emit pieces as segments
            for (const p of pieces) {
                segments.push({
                    displayStart: displayStartIso,
                    start: new Date(p.startMs).toISOString(),
                    end: p.endsAtNow
                        ? undefined
                        : new Date(p.endMs).toISOString(),
                    data: loc.data,
                    character_id: loc.character_id,
                })
            }
        }

        // Consolidate segments that belong to the same level window (same displayStart)
        if (!segments.length) return [] as LevelSegment[]

        const consolidated: LevelSegment[] = []
        const seen = new Set<string>()

        for (const seg of segments) {
            if (seen.has(seg.displayStart)) continue
            seen.add(seg.displayStart)

            const group = segments.filter(
                (s) => s.displayStart === seg.displayStart
            )

            // Sum closed durations and detect a live segment start
            let closedMs = 0
            let liveStart: string | undefined
            for (const g of group) {
                if (g.end == null) {
                    // choose the earliest live start (there should be only one live segment per window)
                    if (!liveStart) liveStart = g.start
                    else if (
                        new Date(g.start).getTime() <
                        new Date(liveStart).getTime()
                    )
                        liveStart = g.start
                } else {
                    closedMs +=
                        new Date(g.end).getTime() - new Date(g.start).getTime()
                }
            }

            const base: Pick<
                LevelSegment,
                "displayStart" | "data" | "character_id"
            > = {
                displayStart: seg.displayStart,
                data: seg.data,
                character_id: seg.character_id,
            }

            if (liveStart) {
                // Offset the live start backwards by the closed duration so LiveDuration shows total live + closed
                const adjustedStartMs = new Date(liveStart).getTime() - closedMs
                consolidated.push({
                    ...base,
                    start: new Date(adjustedStartMs).toISOString(),
                    end: undefined,
                })
            } else {
                const startMs = new Date(seg.displayStart).getTime()
                const endMs = startMs + closedMs
                consolidated.push({
                    ...base,
                    start: new Date(startMs).toISOString(),
                    end: new Date(endMs).toISOString(),
                })
            }
        }

        return consolidated
    }, [
        discardLoggedOutTime,
        discardPublicAreaTime,
        levelActivity,
        onlineActivity,
        areas,
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
                Level Activity
            </h3>
            <Stack gap="15px">
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
                        {adjustedLevelActivity?.map((activity, index) => {
                            return (
                                <tr>
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
