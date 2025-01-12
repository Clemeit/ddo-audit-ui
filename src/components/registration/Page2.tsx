import React, { useEffect, useState } from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import RegistrationTable from "./RegistrationTable.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import "./Registration.css"
import { Character } from "../../models/Character.ts"
import ValidationMessage from "../global/ValidationMessage.tsx"
import { getCharacterByNameAndServer } from "../../services/characterService.ts"
import { HttpStatusCode } from "axios"
import { SERVER_NAMES } from "../../constants/servers.ts"
import Spacer from "../global/Spacer.tsx"
import useIsMobile from "../../hooks/useIsMobile.ts"
import { addRegisteredCharacter } from "../../utils/localStorage.ts"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"

const Page2 = ({ setPage }: { setPage: Function }) => {
    const isMobile = useIsMobile()

    const {
        registeredCharacters,
        accessTokens,
        isLoaded,
        isError,
        reload: reloadCharacters,
        unregisterCharacter,
    } = useGetRegisteredCharacters()

    // Registering a new character:
    const [characterName, setCharacterName] = useState("")
    const [characterServer, setCharacterServer] = useState("Argonnessen")
    const [isFetching, setIsFetching] = useState(false)
    const [validationErrorMessage, setValidationErrorMessage] = useState("")

    useEffect(() => {
        reloadCharacters()
    }, [])

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
                    setPage(1)
                }
            })
            .catch((error) => {
                if (error.status === HttpStatusCode.NotFound) {
                    setValidationErrorMessage("Character not found")
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

    const registrationPanel1 = (
        <form
            id="registration-form"
            className="registration-form"
            onSubmit={(e) => e.preventDefault()}
        >
            <h2>Register</h2>
            <div className="registration-form-content">
                <Stack direction="column" gap="15px">
                    <Stack gap="5px" direction="column">
                        <label htmlFor="server-select">Server:</label>
                        <select
                            id="server-select"
                            className="large"
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
                    </Stack>
                    <Stack gap="5px" direction="column">
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
                    </Stack>
                </Stack>
            </div>
            <div className="registration-form-footer">
                <Button
                    type="primary"
                    fullWidth
                    onClick={registerCharacter}
                    disabled={isFetching}
                >
                    Add
                </Button>
            </div>
        </form>
    )

    const registrationPanel2 = (
        <div className="registered-list hide-on-mobile">
            <p>Registered characters:</p>
            <RegistrationTable
                characters={registeredCharacters}
                minimal
                noCharactersMessage="No recent characters"
            />
        </div>
    )

    return (
        <>
            <ContentCluster title="Registration" hideHeaderOnMobile>
                <div className="registration-form-container">
                    <div className="inner-container">
                        <Stack>
                            {registrationPanel1}
                            <hr
                                className="hide-on-mobile"
                                style={{
                                    width: "1px",
                                    height: "500px",
                                }}
                            />
                            {registrationPanel2}
                        </Stack>
                    </div>
                </div>
                <Spacer size="30px" />
                <Stack gap="10px" fullWidth justify="space-between">
                    <Button type="secondary" onClick={() => setPage(1)}>
                        Back
                    </Button>
                </Stack>
            </ContentCluster>
        </>
    )
}

export default Page2
