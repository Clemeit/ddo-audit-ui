import React, { useState } from "react"
import { ContentCluster } from "../global/ContentCluster.tsx"
import RegistrationTable from "./RegistrationTable.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import "./Registration.css"
import Spacer from "../global/Spacer.tsx"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import ValidationMessage from "../global/ValidationMessage.tsx"
import { addRegisteredCharacter } from "../../utils/localStorage.ts"
import { Character } from "../../models/Character.ts"
import { getCharacterByNameAndServer } from "../../services/characterService.ts"
import { HttpStatusCode } from "axios"
import { SERVER_NAMES } from "../../constants/servers.ts"
import Modal from "../modal/Modal.tsx"
import useIsMobile from "../../hooks/useIsMobile.ts"

const Page1 = () => {
    const {
        registeredCharacters,
        accessTokens,
        isLoaded,
        isError,
        reload: reloadCharacters,
        unregisterCharacter,
    } = useGetRegisteredCharacters()

    // Registering a new character:
    const isMobile = useIsMobile()
    const [showRegistrationModal, setShowRegistrationModal] = useState(false)
    const [characterName, setCharacterName] = useState("")
    const [characterServer, setCharacterServer] = useState("Argonnessen")
    const [isFetching, setIsFetching] = useState(false)
    const [validationErrorMessage, setValidationErrorMessage] = useState("")

    const closeModal = () => {
        setShowRegistrationModal(false)
        setCharacterName("")
        setValidationErrorMessage("")
    }

    function saveCharacterToLocalStorage(character: Character) {
        addRegisteredCharacter(character)
        reloadCharacters()
    }

    function registerCharacter() {
        if (isFetching) return
        if (!characterName) {
            setValidationErrorMessage("Character name is required")
            return
        }
        if (
            registeredCharacters.find(
                (c) =>
                    c.name === characterName &&
                    c.server_name === characterServer
            )
        ) {
            setValidationErrorMessage("Character already registered")
            return
        }
        setIsFetching(true)

        getCharacterByNameAndServer(characterName, characterServer)
            .then((response) => {
                if (response && response.status === HttpStatusCode.Ok) {
                    const responseData = response.data
                    const characterData: Character = responseData.data
                    saveCharacterToLocalStorage(characterData)
                } else {
                    setValidationErrorMessage("Error registering character")
                }
                setCharacterName("")
                if (isMobile) {
                    closeModal()
                }
            })
            .catch((error) => {
                if (error.status === HttpStatusCode.NotFound) {
                    setValidationErrorMessage(
                        "Character not found. Ensure that the character has logged in recently and is not anonymous."
                    )
                } else {
                    setValidationErrorMessage("Error registering character")
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

    const registrationModalContent = (
        <form
            id="registration-form"
            className="registration-form"
            onSubmit={(e) => e.preventDefault()}
        >
            <h2>Add a character</h2>
            <div className="registration-form-content">
                <Stack direction="column" gap="15px" fullWidth>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                        }}
                    >
                        <label htmlFor="server-select">Server:</label>
                        <select
                            id="server-select"
                            className="large full-width"
                            value={characterServer}
                            onChange={(e) => {
                                setCharacterServer(e.target.value)
                                setValidationErrorMessage("")
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    // focus character-name
                                    const serverSelect =
                                        document.getElementById(
                                            "character-name"
                                        )
                                    if (serverSelect) {
                                        serverSelect.focus()
                                    }
                                }
                            }}
                        >
                            {SERVER_NAMES.map((server) => (
                                <option key={server} value={server}>
                                    {server}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                        }}
                    >
                        <label htmlFor="character-name">Character name:</label>
                        <input
                            id="character-name"
                            className="large"
                            type="text"
                            value={characterName}
                            onChange={(e) => {
                                setCharacterName(e.target.value)
                                setValidationErrorMessage("")
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    registerCharacter()
                                }
                            }}
                        />
                        {validationErrorMessage && (
                            <ValidationMessage
                                message={validationErrorMessage}
                                visible={!!validationErrorMessage}
                            />
                        )}
                    </div>
                </Stack>
            </div>
            <div className="registration-form-footer">
                <Button
                    type="primary"
                    fullWidth
                    onClick={() => {
                        !validationErrorMessage && registerCharacter()
                    }}
                    disabled={isFetching || !!validationErrorMessage}
                >
                    Add
                </Button>
            </div>
        </form>
    )

    return (
        <>
            {showRegistrationModal && (
                <Modal onClose={closeModal} centeredContent>
                    {registrationModalContent}
                </Modal>
            )}
            <ContentCluster
                title="Registered Characters"
                subtitle="Register your characters to automatically filter LFMs and see your raid timers."
            >
                <RegistrationTable
                    characters={registeredCharacters}
                    accessTokens={accessTokens}
                    noCharactersMessage="No characters added"
                    unregisterCharacter={unregisterCharacter}
                />
                <ValidationMessage
                    type="error"
                    message="Failed to load characters. Showing cached data."
                    visible={isError}
                />
                <Spacer size="20px" />
                <Stack gap="10px" fullWidth justify="space-between">
                    <div />
                    <Button
                        type="primary"
                        onClick={() => setShowRegistrationModal(true)}
                    >
                        Add a character
                    </Button>
                </Stack>
            </ContentCluster>
        </>
    )
}

export default Page1
