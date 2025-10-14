import React from "react"
import YesNoModal from "../modal/YesNoModal.tsx"
import { QuestInstances } from "../../hooks/useGetCharacterTimers.ts"
import { Character } from "../../models/Character.ts"

interface Props {
    isOpen: boolean
    character: Character | null
    timer: QuestInstances | null
    quests: { [id: number]: { name?: string } | undefined }
    onConfirm: (payload: { characterId: number; timestamp: string }) => void
    onClose: () => void
}

const DeleteTimerModal = ({
    isOpen,
    character,
    timer,
    quests,
    onConfirm,
    onClose,
}: Props) => {
    if (!isOpen || !character || !timer) return null

    const date = new Date(timer.timestamp)
    const questNames = (timer?.quest_ids || [])
        .map((qid) => quests[qid]?.name || "Unknown Quest")
        .join(" / ")

    return (
        <YesNoModal
            title="Delete Timer"
            onYes={() => {
                if (character?.id && timer?.timestamp) {
                    onConfirm({
                        characterId: character.id,
                        timestamp: timer.timestamp,
                    })
                }
                onClose()
            }}
            onNo={onClose}
            fullScreenOnMobile
        >
            <p>
                Are you sure you want to delete the following raid timer for{" "}
                <span className="orange-text">{character.name}</span>?
                <br />
                <br />
                <strong>{questNames}</strong>
                <br />
                Completed At: {date.toLocaleString()}
            </p>
        </YesNoModal>
    )
}

export default DeleteTimerModal
