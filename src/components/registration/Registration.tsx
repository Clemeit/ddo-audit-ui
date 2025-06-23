import { HttpStatusCode } from "axios"
import React, { useState } from "react"
import { SERVER_NAMES } from "../../constants/servers.ts"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import { Character } from "../../models/Character.ts"
import {
    getCharacterByNameAndServer,
    getCharacterByName,
} from "../../services/characterService.ts"
import { addRegisteredCharacter } from "../../utils/localStorage.ts"
import Button from "../global/Button.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
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
import { MAX_REGISTERED_CHARACTERS } from "../../constants/client.ts"
import { Link } from "react-router-dom"

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
    const [showCharacterSelectModal, setShowCharacterSelectModal] =
        useState(false)
    const [characterName, setCharacterName] = useState("")
    const [isFetching, setIsFetching] = useState(false)
    const [validationErrorMessage, setValidationErrorMessage] = useState<
        string[]
    >([])
    const [keepModalOpen, setKeepModalOpen] = useState(false)
    const [foundCharacters, setFoundCharacters] = useState<Character[]>([])
    const [foundAndAddedCharacterIds, setFoundAndAddedCharacterIds] = useState<
        number[]
    >([])

    const closeModal = () => {
        setShowRegistrationModal(false)
        setCharacterName("")
        setValidationErrorMessage([])
        setKeepModalOpen(false)
        setShowCharacterSelectModal(false)
        setFoundCharacters([])
        setFoundAndAddedCharacterIds([])
    }

    const clearCharacterSelection = () => {
        setCharacterName("")
        setShowCharacterSelectModal(false)
        setFoundCharacters([])
        setFoundAndAddedCharacterIds([])
    }

    function saveCharacterToLocalStorage(character: Character) {
        addRegisteredCharacter(character)
        reloadCharacters()
    }

    function registerCharacter() {
        if (isFetching) return
        if (!characterName) {
            setValidationErrorMessage(["Character name is required"])
            return
        }
        if (registeredCharacters.length >= MAX_REGISTERED_CHARACTERS) {
            setValidationErrorMessage([
                "Too many registered characters",
                `You can register up to ${MAX_REGISTERED_CHARACTERS} characters`,
            ])
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
                            registeredCharacters.some(
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
                        saveCharacterToLocalStorage(localFoundCharacters[0])
                    } else {
                        {
                            setFoundCharacters(localFoundCharacters)
                            setShowCharacterSelectModal(true)
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
                    closeModal()
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

    function addCharacter(character: Character) {
        if (registeredCharacters.find((c) => c.id === character.id)) {
            setValidationErrorMessage(["Character already registered"])
            return
        }
        saveCharacterToLocalStorage(character)
        setFoundAndAddedCharacterIds((prev) => [...prev, character.id])
    }

    const multipleCharacterSelectModalContent = (
        <ContentCluster title="Select a Character">
            <div className="registration-form-content">
                <RegistrationTable
                    characters={foundCharacters}
                    isLoaded={true}
                    minimal
                    characterSelectStyle
                    addButtonCallback={(character) => addCharacter(character)}
                    addedCharacterIds={foundAndAddedCharacterIds}
                />
            </div>
            <div className="registration-form-footer">
                <Stack fullWidth justify="space-between">
                    <div />
                    <Button
                        type="secondary"
                        onClick={() => {
                            keepModalOpen
                                ? clearCharacterSelection()
                                : closeModal()
                        }}
                    >
                        Done
                    </Button>
                </Stack>
            </div>
        </ContentCluster>
    )

    const registrationModalContent = (
        <ContentCluster title="Add a Character">
            <div className="registration-form-content">
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
                            <ValidationMessage
                                message={message}
                                visible={!!validationErrorMessage}
                                showIcon={false}
                                type={index === 0 ? "error" : "default"}
                            />
                        ))}
                </div>
            </div>
            <div className="registration-form-footer">
                <Stack direction="column" gap="10px" align="center" fullWidth>
                    <Button
                        type="primary"
                        onClick={() => {
                            if (!validationErrorMessage.length)
                                registerCharacter()
                        }}
                        fullWidth
                        disabled={isFetching || !!validationErrorMessage.length}
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
        </ContentCluster>
    )

    return (
        <Page
            title="DDO Character Registration"
            description="Register your characters to automatically filter LFMs and see your raid timers."
            className="registration"
        >
            {showRegistrationModal && (
                <Modal
                    onClose={closeModal}
                    maxWidth={showCharacterSelectModal ? "600px" : "400px"}
                >
                    {!showCharacterSelectModal && registrationModalContent}
                    {showCharacterSelectModal &&
                        multipleCharacterSelectModalContent}
                </Modal>
            )}
            <ContentClusterGroup>
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
                <ContentCluster title="About this Feature">
                    <p>
                        Registering your characters is entirely optional. You do
                        not need to provide log-in credentials.{" "}
                        <span className="orange-text">
                            You should <strong>never</strong> provide DDO Audit
                            with any personal or account information such as
                            username, password, or billing details.
                        </span>
                    </p>
                    <p>
                        Once a character is registered, the LFM viewer can
                        automatically filter based on that character's server
                        and level. The LFM viewer will also show an indicator on
                        a post if you're currently on timer for that raid. You
                        can view raid timers on the{" "}
                        <Link to="/timers" className="link">
                            Timers page
                        </Link>
                        .
                    </p>
                    <p>
                        You can also Verify ownership of a character to unlock
                        additional features such as quest ransack, questing
                        history, level-up trends, and more. See the{" "}
                        <Link to="/activity" className="link">
                            Activity page
                        </Link>{" "}
                        for more information.
                    </p>
                </ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard type="timers" />
                        <NavigationCard type="activity" />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Registration
