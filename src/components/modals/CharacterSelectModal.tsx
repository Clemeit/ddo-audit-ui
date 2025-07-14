import React, { useEffect, useMemo, useState } from "react"
import { ContentCluster } from "../global/ContentCluster.tsx"
import { Character } from "../../models/Character.ts"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import ValidationMessage from "../global/ValidationMessage.tsx"
import Checkbox from "../global/Checkbox.tsx"
import { getCharacterByName } from "../../services/characterService.ts"
import { HttpStatusCode } from "axios"
import Modal from "../modal/Modal.tsx"
import "./CharacterSelectModal.css"
import CharacterTable, {
    CharacterTableRow,
    ColumnType,
} from "../tables/CharacterTable.tsx"

interface Props {
    previouslyAddedCharacters: Character[]
    onCharacterSelected: (character: Character) => void
    onClose: () => void
}

const CharacterSelectModal = ({
    previouslyAddedCharacters = [],
    onCharacterSelected = () => {},
    onClose = () => {},
}: Props) => {
    const [foundCharacters, setFoundCharacters] = useState<Character[]>([])
    const [foundAndAddedCharacterIds, setFoundAndAddedCharacterIds] = useState<
        number[]
    >([])
    const [keepModalOpen, setKeepModalOpen] = useState<boolean>(false)
    const [characterName, setCharacterName] = useState<string>("")
    const [validationErrorMessage, setValidationErrorMessage] = useState<
        string[]
    >([])
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [showRefineSelection, setShowRefineSelection] =
        useState<boolean>(false)

    const focusCharacterNameField = () => {
        document.getElementById("character-name")?.focus()
    }

    useEffect(() => {
        focusCharacterNameField()
    }, [showRefineSelection])

    const resetModal = () => {
        setCharacterName("")
        setShowRefineSelection(false)
        setFoundCharacters([])
        setFoundAndAddedCharacterIds([])
        focusCharacterNameField()
    }

    const handleClose = () => {
        resetModal()
        onClose()
    }

    const handleCharacterSelected = (character: Character) => {
        setFoundAndAddedCharacterIds((prev) => [...prev, character.id])
        onCharacterSelected(character)
    }

    const visibleColumns: ColumnType[] = [
        ColumnType.STATUS,
        ColumnType.NAME,
        ColumnType.SERVER_NAME,
        ColumnType.LEVEL,
        ColumnType.GUILD,
        ColumnType.ACTIONS,
    ]
    const characterRows: CharacterTableRow[] = useMemo(
        () =>
            foundCharacters.map((character) => ({
                character: character,
                actions: (
                    <Button
                        type="secondary"
                        small
                        onClick={() => handleCharacterSelected(character)}
                        disabled={foundAndAddedCharacterIds.includes(
                            character.id
                        )}
                    >
                        {foundAndAddedCharacterIds.includes(character.id)
                            ? "Added"
                            : "Add"}
                    </Button>
                ),
            })),
        [foundCharacters, foundAndAddedCharacterIds]
    )

    function registerCharacter() {
        if (isFetching) return
        focusCharacterNameField()
        if (!characterName) {
            setValidationErrorMessage(["Character name is required"])
            return
        }

        setIsFetching(true)

        getCharacterByName(characterName)
            .then((response) => {
                if (response && response.status === HttpStatusCode.Ok) {
                    // If there's exactly 1 character, we're done. Otherwise,
                    // present the use with the characters and allow them to
                    // choose which one(s) to register.
                    const responseData = response.data
                    const localFoundCharacters: Character[] = Object.values(
                        responseData.data
                    )
                    // Check to see if every character is already registered
                    if (
                        localFoundCharacters.every((character) =>
                            previouslyAddedCharacters.some(
                                (registeredCharacter) =>
                                    registeredCharacter.id === character.id
                            )
                        )
                    ) {
                        setValidationErrorMessage([
                            "All characters with that name have already been registered",
                        ])
                        return
                    }

                    if (localFoundCharacters.length === 1) {
                        onCharacterSelected(localFoundCharacters[0])
                    } else {
                        {
                            setFoundCharacters(localFoundCharacters)
                            setShowRefineSelection(true)
                            return
                        }
                    }
                } else {
                    setValidationErrorMessage([
                        "Error registering character",
                        "Please try again later",
                    ])
                }
                setCharacterName("")
                if (!keepModalOpen) {
                    handleClose()
                }
            })
            .catch((error) => {
                if (error.status === HttpStatusCode.NotFound) {
                    setValidationErrorMessage([
                        "Character not found",
                        "Ensure that the character has logged in recently and is not anonymous",
                    ])
                } else {
                    setValidationErrorMessage([
                        "Error registering character",
                        "Please try again later",
                    ])
                }
            })
            .finally(() => {
                setIsFetching(false)
                const characterNameInput =
                    document.getElementById("character-name")
                if (characterNameInput) {
                    characterNameInput.focus()
                }
            })
    }

    const refineSelectionContent = (
        <div style={{ padding: "10px" }}>
            <ContentCluster title="Select a Character">
                <div className="selection-form-content">
                    <CharacterTable
                        characterRows={characterRows}
                        visibleColumns={visibleColumns}
                    />
                </div>
                <div className="selection-form-footer">
                    <Stack fullWidth justify="space-between">
                        <div />
                        <Button
                            type="secondary"
                            onClick={() =>
                                keepModalOpen ? resetModal() : handleClose()
                            }
                        >
                            Done
                        </Button>
                    </Stack>
                </div>
            </ContentCluster>
        </div>
    )

    const findCharacterContent = (
        <div style={{ padding: "10px 40px", width: "300px" }}>
            <ContentCluster title="Find a Character">
                <div className="selection-form-content">
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                            width: "100%",
                            boxSizing: "border-box",
                        }}
                    >
                        <label htmlFor="character-name">Character name</label>
                        <input
                            id="character-name"
                            type="text"
                            value={characterName}
                            onChange={(e) => {
                                setCharacterName(e.target.value)
                                setValidationErrorMessage([])
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    registerCharacter()
                                }
                            }}
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                            }}
                        />
                        {!!validationErrorMessage.length &&
                            validationErrorMessage.map((message, index) => (
                                <div key={index}>
                                    <ValidationMessage
                                        message={message}
                                        visible={!!validationErrorMessage}
                                        showIcon={false}
                                        type={index === 0 ? "error" : "default"}
                                    />
                                </div>
                            ))}
                    </div>
                </div>
                <div className="selection-form-footer">
                    <Stack
                        direction="column"
                        gap="10px"
                        align="center"
                        fullWidth
                    >
                        <Button
                            type="primary"
                            onClick={() => {
                                if (!validationErrorMessage.length)
                                    registerCharacter()
                            }}
                            fullWidth
                            disabled={
                                isFetching || !!validationErrorMessage.length
                            }
                        >
                            Add
                        </Button>
                        <Checkbox
                            checked={keepModalOpen}
                            onChange={() => {
                                setKeepModalOpen(!keepModalOpen)
                                focusCharacterNameField()
                            }}
                        >
                            Keep open
                        </Checkbox>
                    </Stack>
                </div>
            </ContentCluster>
        </div>
    )

    return (
        <Modal onClose={onClose}>
            {showRefineSelection
                ? refineSelectionContent
                : findCharacterContent}
        </Modal>
    )
}

export default CharacterSelectModal
