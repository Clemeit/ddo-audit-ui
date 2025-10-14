import React, { useCallback, useMemo } from "react"
import Stack from "../global/Stack.tsx"
import ColoredText from "../global/ColoredText.tsx"
import LiveDuration from "../global/LiveDuration.tsx"
import { characterClassIconContainer } from "../../utils/classIconUtils.tsx"
import { RAID_TIMER_MILLIS } from "../../constants/game.ts"
import { ReactComponent as Delete } from "../../assets/svg/delete.svg"
import { Character } from "../../models/Character.ts"
import { QuestInstances } from "../../hooks/useGetCharacterTimers.ts"
import { RaidTimerCharacterSortEnum } from "../../models/Common.ts"

export interface HiddenTimer {
    characterId: number
    timestamp: string
}

interface Props {
    registeredCharacters: Character[]
    characterTimers: { [characterId: number]: QuestInstances[] } | undefined
    sortCharacterBy: { type: RaidTimerCharacterSortEnum; order: string }
    hiddenTimers: HiddenTimer[]
    quests: { [id: number]: { name?: string } | undefined }
    image: HTMLImageElement | null
    onDeleteClick: (characterId: number, timer: QuestInstances) => void
}

const CharacterTimersList = ({
    registeredCharacters,
    characterTimers,
    sortCharacterBy,
    hiddenTimers,
    quests,
    image,
    onDeleteClick,
}: Props) => {
    // Styles hoisted to avoid recreating objects per render
    const waitingStyle: React.CSSProperties = useMemo(
        () => ({
            width: "100%",
            height: "10vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }),
        []
    )

    const headingStyle: React.CSSProperties = useMemo(
        () => ({ display: "flex", alignItems: "center", gap: "10px" }),
        []
    )

    const tableContainerStyle: React.CSSProperties = useMemo(
        () => ({ maxHeight: "410px" }),
        []
    )

    // Build quick-lookup maps/sets for efficient filtering and joins
    const characterById = useMemo(() => {
        const map = new Map<number, Character>()
        for (const c of registeredCharacters) {
            map.set(c.id, c)
        }
        return map
    }, [registeredCharacters])

    const hiddenKeySet = useMemo(() => {
        // Key format: `${characterId}|${timestamp}`
        const set = new Set<string>()
        for (const ht of hiddenTimers) {
            set.add(`${ht.characterId}|${ht.timestamp}`)
        }
        return set
    }, [hiddenTimers])

    type PreparedRow = {
        characterId: number
        character: Character
        filteredTimers: QuestInstances[]
        latestVisibleMillis: number
    }

    const preparedRows: PreparedRow[] = useMemo(() => {
        const entries = Object.entries(characterTimers || {})
        const rows: PreparedRow[] = []

        for (const [idStr, timers] of entries) {
            const characterId = Number(idStr)
            const character = characterById.get(characterId)
            if (!character) continue

            const tArray = timers as QuestInstances[]
            const filteredTimersPre = tArray.filter(
                (t) => !hiddenKeySet.has(`${characterId}|${t.timestamp}`)
            )

            // Ensure reverse-chronological order (most recent first)
            const sortedByTimestampDesc = filteredTimersPre
                .slice()
                .sort(
                    (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                )

            // Dedupe by quest_ids set (order-insensitive): keep most recent only
            const seen = new Set<string>()
            const filteredTimers: QuestInstances[] = []
            for (const t of sortedByTimestampDesc) {
                // Sort quest_ids to make key independent of order
                const key = (t.quest_ids || [])
                    .slice()
                    .sort((a, b) => a - b)
                    .join(",")
                if (!seen.has(key)) {
                    seen.add(key)
                    filteredTimers.push(t)
                }
            }
            if (filteredTimers.length === 0) continue

            // Assume timers are in reverse-chron order already; use first visible
            const latestVisibleMillis = new Date(
                filteredTimers[0].timestamp
            ).getTime()

            rows.push({
                characterId,
                character,
                filteredTimers,
                latestVisibleMillis,
            })
        }

        const orderMult = sortCharacterBy.order === "asc" ? 1 : -1
        rows.sort((a, b) => {
            switch (sortCharacterBy.type) {
                case RaidTimerCharacterSortEnum.NAME:
                    return (
                        orderMult *
                        a.character.name.localeCompare(b.character.name)
                    )
                case RaidTimerCharacterSortEnum.LEVEL:
                    return (
                        orderMult *
                        (a.character.total_level - b.character.total_level)
                    )
                case RaidTimerCharacterSortEnum.RECENT_RAID: {
                    return (
                        orderMult *
                        (b.latestVisibleMillis - a.latestVisibleMillis)
                    )
                }
                default:
                    return 0
            }
        })

        return rows
    }, [characterTimers, characterById, hiddenKeySet, sortCharacterBy])

    const handleDelete = useCallback(
        (characterId: number, timer: QuestInstances) => () =>
            onDeleteClick(characterId, timer),
        [onDeleteClick]
    )

    if (!registeredCharacters.length) {
        return (
            <div style={waitingStyle}>
                <span>Waiting for some registered characters...</span>
            </div>
        )
    }

    // No timers to display
    if (!preparedRows || preparedRows.length === 0) {
        return (
            <div style={waitingStyle}>
                <span>No timers found</span>
            </div>
        )
    }

    return (
        <>
            {preparedRows.map(({ characterId, character, filteredTimers }) => (
                <div key={characterId}>
                    <Stack gap="10px" align="center">
                        <h3 style={headingStyle}>
                            {character.name}
                            {characterClassIconContainer(character, image)}
                            <ColoredText color="secondary">
                                Level {character.total_level} |{" "}
                                {character.server_name}
                            </ColoredText>
                        </h3>
                    </Stack>
                    <div
                        className="table-container"
                        style={tableContainerStyle}
                    >
                        <table>
                            <thead>
                                <tr>
                                    <th>Quest</th>
                                    <th className="hide-on-small-mobile">
                                        Completed At
                                    </th>
                                    <th>Off Timer At</th>
                                    <th style={{ width: "30px" }} />
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTimers.map((timer) => {
                                    const completedAt = new Date(
                                        timer.timestamp
                                    )
                                    const offTimerMillis =
                                        completedAt.getTime() +
                                        RAID_TIMER_MILLIS
                                    const offTimerDate = new Date(
                                        offTimerMillis
                                    )

                                    return (
                                        <tr
                                            key={`${characterId}-${timer.timestamp}`}
                                        >
                                            <td>
                                                {timer.quest_ids
                                                    .map(
                                                        (qid) =>
                                                            quests[qid]?.name ||
                                                            "Unknown Quest"
                                                    )
                                                    .join(" / ")}
                                            </td>
                                            <td className="hide-on-small-mobile">
                                                {completedAt.toLocaleString()}{" "}
                                                <br />
                                                <ColoredText color="secondary">
                                                    (
                                                    <LiveDuration
                                                        start={timer.timestamp}
                                                    />{" "}
                                                    ago)
                                                </ColoredText>
                                            </td>
                                            <td>
                                                {offTimerDate.toLocaleString()}
                                                <br />
                                                <ColoredText color="secondary">
                                                    (
                                                    <LiveDuration
                                                        start={Date.now()}
                                                        end={offTimerMillis}
                                                    />
                                                    )
                                                </ColoredText>
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    aria-label={`Delete timer for ${character.name}`}
                                                    title={`Delete timer for ${character.name}`}
                                                    onClick={handleDelete(
                                                        characterId,
                                                        timer
                                                    )}
                                                    style={{
                                                        background:
                                                            "transparent",
                                                        border: 0,
                                                        padding: 0,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <Delete className="clickable-icon" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </>
    )
}

export default CharacterTimersList
