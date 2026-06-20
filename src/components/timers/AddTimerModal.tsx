import { useEffect, useMemo, useState } from "react"
import { Character } from "../../models/Character.ts"
import { Quest } from "../../models/Lfm.ts"
import { RAID_TIMER_MILLIS } from "../../constants/game.ts"
import Modal from "../modal/Modal.tsx"
import { ContentCluster } from "../global/ContentCluster.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import Select from "../global/Select.tsx"
import Checkbox from "../global/Checkbox.tsx"
import RadioButton from "../global/RadioButton.tsx"
import ValidationMessage from "../global/ValidationMessage.tsx"
import useWindowSize from "../../hooks/useWindowSize.ts"

interface Props {
    isOpen: boolean
    registeredCharacters: Character[]
    quests: { [id: number]: Quest }
    onSave: (payload: {
        characterId: number
        questIds: number[]
        questName: string
        completedAt: string
    }) => void
    onClose: () => void
}

type CompletionMode = "completed-at" | "remaining-time"

const normalizeQuestName = (value: string) => value.trim().toLowerCase()

const toLocalDatetimeString = (ms: number) =>
    new Date(ms - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)

const AddTimerModal = ({
    isOpen,
    registeredCharacters,
    quests,
    onSave,
    onClose,
}: Props) => {
    const [characterId, setCharacterId] = useState<number>(0)
    const [questName, setQuestName] = useState("")
    const [completedJustNow, setCompletedJustNow] = useState(true)
    const [completionMode, setCompletionMode] =
        useState<CompletionMode>("remaining-time")
    const [completedAtValue, setCompletedAtValue] = useState("")
    const [remainingDays, setRemainingDays] = useState("0")
    const [remainingHours, setRemainingHours] = useState("0")
    const [remainingMinutes, setRemainingMinutes] = useState("0")
    const [error, setError] = useState<string | null>(null)

    const { isMobile, isSmallishMobile } = useWindowSize()

    const questLookup = useMemo(() => {
        const map = new Map<string, { ids: number[]; name: string }>()
        for (const quest of Object.values(quests || {})) {
            if (quest?.group_size !== "Raid") continue
            if (!quest?.name) continue
            const key = normalizeQuestName(quest.name)
            const existing = map.get(key)
            if (existing) {
                if (!existing.ids.includes(quest.id)) {
                    existing.ids.push(quest.id)
                }
            } else {
                map.set(key, { ids: [quest.id], name: quest.name })
            }
        }
        return map
    }, [quests])

    const questOptions = useMemo(() => {
        return Array.from(questLookup.values())
            .map((entry) => entry.name)
            .sort((a, b) => a.localeCompare(b))
    }, [questLookup])

    useEffect(() => {
        if (!isOpen) return

        setCharacterId(registeredCharacters[0]?.id ?? 0)
        setQuestName("")
        setCompletedJustNow(true)
        setCompletionMode("remaining-time")
        setCompletedAtValue("")
        setRemainingDays("0")
        setRemainingHours("0")
        setRemainingMinutes("0")
        setError(null)
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        if (registeredCharacters.length === 0) {
            if (characterId !== 0) {
                setCharacterId(0)
            }
            return
        }

        const hasSelectedCharacter = registeredCharacters.some(
            (character) => character.id === characterId
        )
        if (!hasSelectedCharacter) {
            setCharacterId(registeredCharacters[0].id)
        }
    }, [isOpen, registeredCharacters, characterId])

    const canSave = registeredCharacters.length > 0

    const handleSubmit = () => {
        setError(null)

        if (!canSave) {
            setError("Register a character before adding a timer.")
            return
        }

        const normalizedQuestName = normalizeQuestName(questName)
        const questEntry = questLookup.get(normalizedQuestName)
        if (!questEntry) {
            setError("Enter a valid raid quest.")
            return
        }

        const selectedCharacter = registeredCharacters.find(
            (character) => character.id === characterId
        )
        if (!selectedCharacter) {
            setError("Choose a registered character.")
            return
        }

        const now = Date.now()
        let completedAtMillis: number | null = null

        if (completedJustNow) {
            completedAtMillis = now
        } else if (completionMode === "completed-at") {
            if (completedAtValue) {
                const parsed = new Date(completedAtValue).getTime()
                completedAtMillis = Number.isNaN(parsed) ? null : parsed
            }
            if (completedAtMillis === null) {
                setError("Enter a valid completed-at date and time.")
                return
            }
            if (completedAtMillis > now) {
                setError("Completed-at time cannot be in the future.")
                return
            }
            if (completedAtMillis < now - RAID_TIMER_MILLIS) {
                setError(
                    "Completed-at time is too far in the past to create a timer."
                )
                return
            }
        } else {
            const days = Number.parseInt(remainingDays || "0", 10)
            const hours = Number.parseInt(remainingHours || "0", 10)
            const minutes = Number.parseInt(remainingMinutes || "0", 10)
            const remainingMillis =
                (Number.isNaN(days) ? 0 : days) * 24 * 60 * 60 * 1000 +
                (Number.isNaN(hours) ? 0 : hours) * 60 * 60 * 1000 +
                (Number.isNaN(minutes) ? 0 : minutes) * 60 * 1000

            if (remainingMillis <= 0) {
                setError("Enter a remaining time greater than zero.")
                return
            }
            if (remainingMillis > RAID_TIMER_MILLIS) {
                setError("Remaining time cannot exceed the full raid duration.")
                return
            }

            completedAtMillis = now - (RAID_TIMER_MILLIS - remainingMillis)
        }

        if (completedAtMillis === null) {
            setError("Enter a valid completion time.")
            return
        }

        onSave({
            characterId: selectedCharacter.id,
            questIds: questEntry.ids,
            questName: questEntry.name,
            completedAt: new Date(completedAtMillis).toISOString(),
        })
    }

    if (!isOpen) return null

    return (
        <Modal
            onClose={onClose}
            fullScreenOnMobile
            freezeBodyScroll
            maxWidth="720px"
            style={{ minWidth: isMobile ? "" : "368px" }}
        >
            <ContentCluster title="Add a timer">
                <Stack direction="column" gap="16px">
                    <Stack direction="column" style={{ width: "100%" }}>
                        <label htmlFor="custom-timer-character">
                            <strong>Character</strong>
                        </label>
                        <Select
                            id="custom-timer-character"
                            value={String(characterId)}
                            onChange={(event) =>
                                setCharacterId(Number(event.target.value))
                            }
                            disabled={registeredCharacters.length === 0}
                            style={{ width: "100%", boxSizing: "border-box" }}
                        >
                            {registeredCharacters.length === 0 ? (
                                <option value="0">
                                    No registered characters
                                </option>
                            ) : (
                                registeredCharacters.map((character) => (
                                    <option
                                        key={character.id}
                                        value={character.id}
                                    >
                                        {`${character.name} (${character.server_name || "Unknown"})`}
                                    </option>
                                ))
                            )}
                        </Select>
                    </Stack>

                    <Stack direction="column" style={{ width: "100%" }}>
                        <label htmlFor="custom-timer-raid">
                            <strong>Raid</strong>
                        </label>
                        <input
                            id="custom-timer-raid"
                            type="text"
                            list="custom-timer-quests"
                            autoComplete="off"
                            value={questName}
                            onChange={(event) =>
                                setQuestName(event.target.value)
                            }
                            style={{ width: "100%", boxSizing: "border-box" }}
                        />
                        <datalist id="custom-timer-quests">
                            {questOptions.map((name) => (
                                <option key={name} value={name} />
                            ))}
                        </datalist>
                    </Stack>

                    <Checkbox
                        checked={completedJustNow}
                        onChange={(event) =>
                            setCompletedJustNow(event.target.checked)
                        }
                    >
                        Completed just now
                    </Checkbox>

                    {!completedJustNow && (
                        <fieldset
                            style={{
                                border: 0,
                                padding: 0,
                                margin: 0,
                                width: "100%",
                            }}
                        >
                            <legend>
                                <strong>Choose one completion method</strong>
                            </legend>
                            <Stack
                                direction="column"
                                gap="12px"
                                style={{ marginTop: "8px" }}
                            >
                                <RadioButton
                                    checked={
                                        completionMode === "remaining-time"
                                    }
                                    onChange={() =>
                                        setCompletionMode("remaining-time")
                                    }
                                >
                                    Remaining time
                                </RadioButton>
                                <Stack
                                    direction="row"
                                    gap="8px"
                                    style={{
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Stack direction="column">
                                        Days
                                        <input
                                            type="number"
                                            min={0}
                                            max={2}
                                            value={remainingDays}
                                            disabled={
                                                completionMode !==
                                                "remaining-time"
                                            }
                                            onChange={(event) =>
                                                setRemainingDays(
                                                    event.target.value
                                                )
                                            }
                                            style={{ width: "90px" }}
                                        />
                                    </Stack>
                                    <Stack direction="column">
                                        Hours
                                        <input
                                            type="number"
                                            min={0}
                                            max={23}
                                            value={remainingHours}
                                            disabled={
                                                completionMode !==
                                                "remaining-time"
                                            }
                                            onChange={(event) =>
                                                setRemainingHours(
                                                    event.target.value
                                                )
                                            }
                                            style={{ width: "90px" }}
                                        />
                                    </Stack>
                                    <Stack direction="column">
                                        Minutes
                                        <input
                                            type="number"
                                            min={0}
                                            max={59}
                                            value={remainingMinutes}
                                            disabled={
                                                completionMode !==
                                                "remaining-time"
                                            }
                                            onChange={(event) =>
                                                setRemainingMinutes(
                                                    event.target.value
                                                )
                                            }
                                            style={{ width: "90px" }}
                                        />
                                    </Stack>
                                </Stack>

                                <RadioButton
                                    checked={completionMode === "completed-at"}
                                    onChange={() =>
                                        setCompletionMode("completed-at")
                                    }
                                >
                                    Completed at
                                </RadioButton>
                                <Stack
                                    direction="column"
                                    gap="8px"
                                    style={{ width: "100%" }}
                                >
                                    <input
                                        type="datetime-local"
                                        value={completedAtValue}
                                        max={toLocalDatetimeString(Date.now())}
                                        min={toLocalDatetimeString(
                                            Date.now() - RAID_TIMER_MILLIS
                                        )}
                                        disabled={
                                            completionMode !== "completed-at"
                                        }
                                        onChange={(event) =>
                                            setCompletedAtValue(
                                                event.target.value
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        </fieldset>
                    )}

                    <ValidationMessage
                        type="error"
                        visible={Boolean(error)}
                        message={error || ""}
                    />

                    <Stack
                        direction={isSmallishMobile ? "column" : "row"}
                        gap="10px"
                        style={{ width: "100%" }}
                    >
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            disabled={!canSave}
                            style={{
                                width: isMobile ? "100%" : "",
                            }}
                        >
                            Save
                        </Button>
                        <Button
                            type="secondary"
                            onClick={onClose}
                            style={{
                                width: isMobile ? "100%" : "",
                            }}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </ContentCluster>
        </Modal>
    )
}

export default AddTimerModal
