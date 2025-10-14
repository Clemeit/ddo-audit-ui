import React, { useEffect, useRef } from "react"
import Stack from "../global/Stack"
import Checkbox from "../global/Checkbox"
import ColoredText from "../global/ColoredText"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"
import LiveDuration from "../global/LiveDuration"
import { dateToShortStringWithTime } from "../../utils/dateUtils"
import {
    convertMillisecondsToPrettyString,
    mapClassesToString,
} from "../../utils/stringUtils"
import logMessage from "../../utils/logUtils"

// Row kinds unify different activity concepts.
export type ActivityRowKind = "location" | "level" | "online"

export interface BaseActivityRow {
    id: string
    kind: ActivityRowKind
    // Start of the displayed window (ISO)
    displayStart: string
    // Start used for duration (ISO)
    start: string
    // End (ISO) or undefined when live
    end?: string
    // Adjusted duration in ms (for level rows) or raw (computed as end-start for others)
    durationMs?: number
    // Additional data for rendering
    data: Record<string, any>
}

export interface CharacterActivityTableProps {
    title: string
    kind: ActivityRowKind
    rows: BaseActivityRow[]
    onSelect: (range: { start: number | null; end: number | null }) => void
    selectedRange: { start: number | null; end: number | null } | null
    lastSelectionSource: ActivityRowKind | null
    selectionVersion: number
    selfSource: ActivityRowKind
    // Column configuration
    columns: Array<{
        key: string
        header: string
        render: (row: BaseActivityRow) => React.ReactNode
        width?: string | number
    }>
    // Info footer text
    infoNote?: React.ReactNode
    // Filter controls (already lifted to Activity). Provide label, state, and handler.
    filters?: Array<{
        label: string
        checked: boolean
        onChange: (next: boolean) => void
    }>
    // Whether to always append an "End of history" row
    showEndOfHistory?: boolean
}

const CharacterActivityTable: React.FC<CharacterActivityTableProps> = ({
    title,
    kind,
    rows,
    onSelect,
    selectedRange,
    lastSelectionSource,
    selectionVersion,
    selfSource,
    columns,
    infoNote,
    filters = [],
    showEndOfHistory = true,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null)

    const scrollToTop = () => {
        const container = containerRef.current
        if (container) {
            container.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    // Scroll to top when rows change (new data loaded)
    useEffect(() => {
        scrollToTop()
    }, [rows])

    // Scroll to first selected row when selection sourced externally
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
    }, [selectionVersion, lastSelectionSource, rows, selfSource])

    const computeDuration = (row: BaseActivityRow): React.ReactNode => {
        if (row.end == null) {
            // Live
            const liveStartIso =
                row.durationMs != null
                    ? new Date(Date.now() - row.durationMs).toISOString()
                    : row.start
            return (
                <LiveDuration
                    start={liveStartIso}
                    intervalMs={1000}
                    onlyWhenVisible
                    compact
                />
            )
        }
        const ms =
            row.durationMs != null
                ? row.durationMs
                : new Date(row.end).getTime() - new Date(row.start).getTime()
        return convertMillisecondsToPrettyString({
            millis: ms,
            commaSeparated: true,
            useFullWords: true,
            onlyIncludeLargest: false,
            largestCount: 2,
            nonBreakingSpace: true,
        })
    }

    return (
        <Stack direction="column" gap="10px" style={{ width: "100%" }}>
            <h3
                style={{
                    marginTop: 0,
                    marginBottom: "5px",
                    textDecoration: "underline",
                }}
            >
                {title}
            </h3>
            {filters.length > 0 && (
                <Stack gap="15px" wrap style={{ rowGap: "0px" }}>
                    {filters.map((f, idx) => (
                        <Checkbox
                            key={idx}
                            checked={f.checked}
                            onChange={(e) => f.onChange(e.target.checked)}
                        >
                            {f.label}
                        </Checkbox>
                    ))}
                </Stack>
            )}
            <div
                className="table-container"
                style={{ maxHeight: "410px" }}
                ref={containerRef}
            >
                <table>
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    style={
                                        col.width
                                            ? { width: col.width }
                                            : undefined
                                    }
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(rows == null || rows.length === 0) && (
                            <tr>
                                <td className="no-data-row" colSpan={99}>
                                    No data to show
                                </td>
                            </tr>
                        )}
                        {rows.map((row) => {
                            const startMs = new Date(row.start).getTime()
                            const endMs = row.end
                                ? new Date(row.end).getTime()
                                : Date.now()
                            const isSelected =
                                selectedRange &&
                                selectedRange.start != null &&
                                selectedRange.end != null &&
                                !(
                                    endMs <= selectedRange.start ||
                                    startMs >= selectedRange.end
                                )
                            return (
                                <tr
                                    key={row.id}
                                    className={`clickable${isSelected ? " selected-row" : ""}`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        logMessage(
                                            `User selected ${kind} activity row`,
                                            "info",
                                            {
                                                metadata: {
                                                    rowId: row.id,
                                                },
                                            }
                                        )
                                        onSelect({
                                            start: startMs,
                                            end: row.end ? endMs : null,
                                        })
                                    }}
                                >
                                    {columns.map((col) => (
                                        <td key={col.key}>
                                            {col.key === "__duration__"
                                                ? computeDuration(row)
                                                : col.key === "__time__"
                                                  ? dateToShortStringWithTime(
                                                        new Date(
                                                            row.displayStart
                                                        )
                                                    )
                                                  : col.render(row)}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                        {showEndOfHistory && rows && rows.length > 0 && (
                            <tr>
                                <td className="no-data-row" colSpan={99}>
                                    End of history
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {infoNote && (
                <div>
                    <InfoSVG
                        className="page-message-icon"
                        style={{ fill: "var(--info)" }}
                    />
                    <ColoredText color="secondary">{infoNote}</ColoredText>
                </div>
            )}
        </Stack>
    )
}

export default CharacterActivityTable

// Helper renderers that Activity can import if convenient
export const renderLevelClasses = (row: BaseActivityRow) =>
    mapClassesToString(row.data?.classes ?? [])
export const renderLocationName = (row: BaseActivityRow) =>
    row.data?.locationName || "-"
export const renderQuestName = (row: BaseActivityRow) =>
    row.data?.questName || ""
export const renderLevelValue = (row: BaseActivityRow) =>
    row.data?.total_level ?? "-"
export const renderStatus = (row: BaseActivityRow) =>
    row.data?.status === true ? "Logged In" : "Logged Out"
