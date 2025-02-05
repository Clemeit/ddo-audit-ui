import { HttpStatusCode } from "axios"
import React, { useState } from "react"
import { SERVER_NAMES } from "../../constants/servers.ts"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import { Character } from "../../models/Character.ts"
import { getCharacterByNameAndServer } from "../../services/characterService.ts"
import { addRegisteredCharacter } from "../../utils/localStorage.ts"
import Button from "../global/Button.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import Page from "../global/Page.tsx"
import Spacer from "../global/Spacer.tsx"
import Stack from "../global/Stack.tsx"
import ValidationMessage from "../global/ValidationMessage.tsx"
import Modal from "../modal/Modal.tsx"
import "./Registration.css"
import RegistrationTable from "./RegistrationTable.tsx"
import Checkbox from "../global/Checkbox.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"

const Registration = () => {
    const {
        registeredCharacters,
        accessTokens,
        isLoaded,
        isError,
        reload: reloadCharacters,
        unregisterCharacter,
    } = useGetRegisteredCharacters()

    // Registering a new character:
    const [showRegistrationModal, setShowRegistrationModal] = useState(false)
    const [characterName, setCharacterName] = useState("")
    const [characterServer, setCharacterServer] = useState("Argonnessen")
    const [isFetching, setIsFetching] = useState(false)
    const [validationErrorMessage, setValidationErrorMessage] = useState("")
    const [keepModalOpen, setKeepModalOpen] = useState(false)

    const closeModal = () => {
        setShowRegistrationModal(false)
        setCharacterName("")
        setValidationErrorMessage("")
        setKeepModalOpen(false)
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
                if (!keepModalOpen) {
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
                            width: "100%",
                        }}
                    >
                        <label htmlFor="server-select">Server:</label>
                        <select
                            style={{
                                width: "100%",
                            }}
                            id="server-select"
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
                            width: "min-content",
                        }}
                    >
                        <label htmlFor="character-name">Character name:</label>
                        <input
                            id="character-name"
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
                                showIcon={false}
                            />
                        )}
                    </div>
                </Stack>
            </div>
            <div className="registration-form-footer">
                <Stack direction="column" gap="10px">
                    <Button
                        type="primary"
                        fullWidth
                        onClick={() => {
                            if (!validationErrorMessage) registerCharacter()
                        }}
                        disabled={isFetching || !!validationErrorMessage}
                    >
                        Add
                    </Button>
                    <Checkbox
                        checked={keepModalOpen}
                        onChange={() => setKeepModalOpen(!keepModalOpen)}
                    >
                        Keep open
                    </Checkbox>
                </Stack>
            </div>
        </form>
    )

    return (
        <Page
            title="DDO Character Registration"
            description="Register your characters to automatically filter LFMs and see your raid timers."
            className="registration"
        >
            {showRegistrationModal && (
                <Modal onClose={closeModal} centeredContent maxWidth="350px">
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
                    isLoaded={isLoaded}
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
            <ContentCluster title="See Also...">
                <NavCardCluster>
                    <NavigationCard type="timers" />
                    <NavigationCard type="activity" />
                </NavCardCluster>
            </ContentCluster>
        </Page>
    )
}

export default Registration
