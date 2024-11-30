import React, { useEffect, useState } from "react"
import ContentCluster from "../global/ContentCluster.tsx"
import RegistrationTable from "./RegistrationTable.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import "./Registration.css"
import { Character } from "../../models/Character.ts"
import { getCharacterById } from "../../services/characterService.ts"
import { AccessToken } from "../../models/Verification.ts"

const Page1 = ({ setPage }: { setPage: Function }) => {
    // Registered characters:
    const [registeredCharacters, setRegisteredCharacters] = useState<
        Character[]
    >([])

    // Verified character ids:
    const [verifiedCharacterIds, setVerifiedCharacterIds] = useState<string[]>(
        []
    )

    useEffect(() => {
        reloadCharacters()
    }, [])

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

    return (
        <>
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
        </>
    )
}

export default Page1
