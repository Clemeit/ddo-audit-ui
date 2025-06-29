import React, { useState } from "react"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import RegistrationTable from "../registration/RegistrationTable.tsx"
import useGetFriends from "../../hooks/useGetFriends.ts"
import NavCardCluster from "../global/NavCardCluster.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils.ts"
import ValidationMessage from "../global/ValidationMessage.tsx"
import Spacer from "../global/Spacer.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import Modal from "../modal/Modal.tsx"
import { Character } from "../../models/Character.ts"
import { addFriend as addFriendToLocalStorage } from "../../utils/localStorage.ts"
import { MAX_FRIENDS } from "../../constants/client.ts"
import { getCharacterByName } from "../../services/characterService.ts"
import { HttpStatusCode } from "axios"
import Checkbox from "../global/Checkbox.tsx"
import "./Friends.css"

const Friends = () => {
    const {
        friends,
        isLoaded,
        isError,
        reload: reloadFriends,
        removeFriend,
        lastReload,
    } = useGetFriends()
    const [showAddFriendsModal, setShowAddFriendsModal] = useState(false)
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
    const [millisSinceReload, setMillisSinceReload] = useState<number>(0)
    const [firstLoad] = useState<Date>(new Date())

    React.useEffect(() => {
        setMillisSinceReload(new Date().getTime() - lastReload.getTime())

        const updateReloadStatus = setInterval(() => {
            if (new Date().getTime() - firstLoad.getTime() > 1000 * 60 * 60 * 5)
                return
            const millis = new Date().getTime() - lastReload.getTime()
            if (millis > 30000) reloadFriends()
            setMillisSinceReload(millis)
        }, 10000)

        return () => clearInterval(updateReloadStatus)
    }, [lastReload])

    function getLastReloadString() {
        const prettyString = convertMillisecondsToPrettyString(
            millisSinceReload,
            true,
            true,
            true
        )
        if (!prettyString) {
            return "Last refreshed just now"
        } else {
            return `Last refreshed ${prettyString} ago`
        }
    }

    const closeModal = () => {
        setShowAddFriendsModal(false)
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
        addFriendToLocalStorage(character)
        reloadFriends()
    }

    function addFriend() {
        if (isFetching) return
        if (!characterName) {
            setValidationErrorMessage(["Character name is required"])
            return
        }
        if (friends.length >= MAX_FRIENDS) {
            setValidationErrorMessage([
                "Too many friends",
                `You can add up to ${MAX_FRIENDS} friends`,
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
                            friends.some(
                                (registeredCharacter) =>
                                    registeredCharacter.id === character.id
                            )
                        )
                    ) {
                        setValidationErrorMessage([
                            "All characters with that name have already been added",
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
                        "Error adding friend",
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
                        "Error adding friend",
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
        if (friends.find((c) => c.id === character.id)) {
            setValidationErrorMessage(["Character already added"])
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
                        onClick={() =>
                            keepModalOpen
                                ? clearCharacterSelection()
                                : closeModal()
                        }
                    >
                        Done
                    </Button>
                </Stack>
            </div>
        </ContentCluster>
    )

    const addFriendModalContent = (
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
                                addFriend()
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
            <div className="registration-form-footer">
                <Stack direction="column" gap="10px" align="center" fullWidth>
                    <Button
                        type="primary"
                        onClick={() => {
                            if (!validationErrorMessage.length) addFriend()
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
            title="Friends List"
            description="Add your friends so that you can see what they're up to!"
        >
            {showAddFriendsModal && (
                <Modal
                    onClose={closeModal}
                    maxWidth={showCharacterSelectModal ? "600px" : "400px"}
                >
                    {!showCharacterSelectModal && addFriendModalContent}
                    {showCharacterSelectModal &&
                        multipleCharacterSelectModalContent}
                </Modal>
            )}
            <ContentClusterGroup>
                <ContentCluster
                    title="Friends"
                    subtitle="Add your friends so that you don't miss out!"
                >
                    <RegistrationTable
                        characters={friends}
                        isLoaded={isLoaded}
                        noCharactersMessage="No friends added"
                        unregisterCharacter={removeFriend}
                    />
                    <div
                        style={{
                            marginTop: "5px",
                        }}
                    >
                        <span style={{ color: "var(--secondary-text)" }}>
                            {getLastReloadString()}
                        </span>
                    </div>
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
                            onClick={() => setShowAddFriendsModal(true)}
                        >
                            Add a friend
                        </Button>
                    </Stack>
                </ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard type="ignore" />
                        <NavigationCard type="registration" />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Friends
