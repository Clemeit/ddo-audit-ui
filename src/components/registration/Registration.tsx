import React, { useEffect, useState } from "react"
import Page from "../global/Page.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import RegistrationTable from "./RegistrationTable.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import usePagination from "../../hooks/usePagination.ts"
import "./Registration.css"
import Spacer from "../global/Spacer.tsx"
import { SERVER_NAMES } from "../../constants/servers.ts"
import { Character } from "../../models/Character.ts"
import {
    getCharacterByNameAndServer,
    getCharacterById,
} from "../../services/characterService.ts"
import InputValidationMessage from "../global/InputValidationMessage.tsx"
// import status codes axios
import { HttpStatusCode } from "axios"
import { AccessToken } from "../../models/Verification.ts"

const Registration = () => {
    // Pagination:
    const { currentPage, setPage } = usePagination()

    // Registered characters:
    const [registeredCharacters, setRegisteredCharacters] = useState<
        Character[]
    >([])

    // Verified character ids:
    const [verifiedCharacterIds, setVerifiedCharacterIds] = useState<string[]>(
        []
    )

    // Registering a new character:
    const [characterName, setCharacterName] = useState("")
    const [characterServer, setCharacterServer] = useState("Argonnessen")
    const [recentlyRegisteredCharacters, setRecentlyRegisteredCharacters] =
        useState<Character[]>([])
    const [isFetching, setIsFetching] = useState(false)
    const [validationErrorMessage, setValidationErrorMessage] = useState("")

    useEffect(() => {
        setRecentlyRegisteredCharacters([])
    }, [currentPage])

    useEffect(() => {
        if (currentPage !== 1) return
        reloadCharacters()
    }, [currentPage])

    function reloadCharacters() {
        // get the list of registered character IDs from local storage
        const ids = JSON.parse(
            localStorage.getItem("registered-characters") || "[]"
        )
        const accessTokens = JSON.parse(
            localStorage.getItem("access-tokens") || "[]"
        )
        const verifiedCharacterIds = accessTokens.map(
            (token: AccessToken) => token.character_id
        )
        setVerifiedCharacterIds(verifiedCharacterIds)
        // for every ID, look up the character data and add it to the list
        const promises = ids.map((id: string) => getCharacterById(id))
        Promise.all(promises).then((responses) => {
            const characters = responses
                .map((response) => response.data.data)
                .filter((character) => character)
            setRegisteredCharacters(characters)
        })
    }

    useEffect(() => {
        const previousCharacterIds = JSON.parse(
            localStorage.getItem("registered-characters") || "[]"
        )
        const newCharacterIds = recentlyRegisteredCharacters.map(
            (character) => character.id
        )
        const allIds = [
            ...new Set([...previousCharacterIds, ...newCharacterIds]),
        ]
        localStorage.setItem("registered-characters", JSON.stringify(allIds))
    }, [recentlyRegisteredCharacters])

    function registerCharacter() {
        if (isFetching) return
        if (!characterName) {
            setValidationErrorMessage("Character name is required")
            return
        }
        setIsFetching(true)

        getCharacterByNameAndServer(characterName, characterServer)
            .then((response) => {
                if (response && response.status === HttpStatusCode.Ok) {
                    let responseData = response.data
                    setRecentlyRegisteredCharacters((prev) => [
                        ...prev,
                        responseData.data,
                    ])
                } else {
                    setValidationErrorMessage("Error registering character")
                }
                setCharacterName("")
            })
            .catch((error) => {
                console.log(error)
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
                            <InputValidationMessage
                                text={validationErrorMessage}
                            />
                        )}
                    </Stack>
                </Stack>
            </div>
            <div className="registration-form-footer">
                <Button
                    text="Add"
                    type="primary"
                    fullWidth
                    onClick={registerCharacter}
                    disabled={isFetching}
                />
            </div>
        </form>
    )

    const registrationPanel2 = (
        <div className="registered-list hide-on-mobile">
            <span>Characters recently registered:</span>
            <RegistrationTable
                minimal
                characters={recentlyRegisteredCharacters}
                noCharactersMessage="No recent characters"
            />
        </div>
    )

    const page1 = (
        <ContentCluster
            title="Registered Characters"
            subtitle="Register your characters to automatically filter LFMs and see your raid timers."
        >
            <RegistrationTable
                characters={registeredCharacters}
                verifiedCharacterIds={verifiedCharacterIds}
                noCharactersMessage="No characters added"
                reload={reloadCharacters}
            />
            <Stack gap="10px" fullWidth justify="space-between">
                <div />
                <Button
                    text="Add a character"
                    type="primary"
                    onClick={() => setPage(2)}
                />
            </Stack>
        </ContentCluster>
    )

    const page2 = (
        <ContentCluster title="Registration">
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
                <Button
                    text="Back"
                    type="secondary"
                    onClick={() => setPage(1)}
                />
            </Stack>
        </ContentCluster>
    )

    return (
        <Page className="registration" title="DDO Character Registration">
            {currentPage === 1 && page1}
            {currentPage === 2 && page2}
        </Page>
    )
}

export default Registration
