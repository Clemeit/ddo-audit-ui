import React, { useEffect, useState } from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import RegistrationTable from "./RegistrationTable.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import "./Registration.css"
import { Character } from "../../models/Character.ts"
import { getCharacterById } from "../../services/characterService.ts"
import { AccessToken } from "../../models/Verification.ts"
import Spacer from "../global/Spacer.tsx"
import {
    getAccessTokens,
    getRegisteredCharacters,
    removeRegisteredCharacter,
    removeAccessToken,
} from "../../utils/localStorage.ts"
import ExpandableContainer from "../global/ExpandableContainer.tsx"

const Page1 = ({ setPage }: { setPage: Function }) => {
    // Registered characters:
    const [registeredCharacters, setRegisteredCharacters] = useState<
        Character[]
    >([])
    // Access tokens:
    const [accessTokens, setAccessTokens] = useState<AccessToken[]>([])

    useEffect(() => {
        reloadCharacters()
    }, [])

    function reloadCharacters() {
        // get the list of registered character IDs from local storage
        const registeredCharacters = getRegisteredCharacters()
        const accessTokens = getAccessTokens()

        setRegisteredCharacters(registeredCharacters)
        setAccessTokens(accessTokens)

        // for every ID, look up the character data and add it to the list
        const promises = registeredCharacters.map((character: Character) =>
            getCharacterById(character.id)
        )
        Promise.all(promises).then((responses) => {
            const characters = responses
                .map((response) => response.data.data)
                .filter((character) => character)
            setRegisteredCharacters(characters)
        })
    }

    function removeCharacter(character: Character) {
        // revoke the access token for this character
        const accessTokens = getAccessTokens()
        const token = accessTokens.find(
            (token) => token.character_id === character.id
        )
        if (token) removeAccessToken(token)

        // unregister the character
        removeRegisteredCharacter(character)

        reloadCharacters()
    }

    return (
        <>
            <ContentCluster
                title="Registered Characters"
                subtitle="Register your characters to automatically filter LFMs and see your raid timers."
            >
                <RegistrationTable
                    characters={registeredCharacters}
                    accessTokens={accessTokens}
                    noCharactersMessage="No characters added"
                    removeCharacter={removeCharacter}
                />
                <Spacer size="20px" />
                <Stack gap="10px" fullWidth justify="space-between">
                    <div />
                    <Button
                        text="Add a character"
                        type="primary"
                        onClick={() => setPage(2)}
                    />
                </Stack>
            </ContentCluster>
        </>
    )
}

export default Page1
