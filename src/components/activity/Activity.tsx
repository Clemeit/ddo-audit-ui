import React, { useState, useEffect } from "react"
import NavigationCard from "../global/NavigationCard.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import { AccessToken } from "../../models/Verification.ts"
import { Character } from "../../models/Character.ts"
import { getCharacterById } from "../../services/characterService.ts"
import "./Activity.css"
import Stack from "../global/Stack.tsx"
import { Link } from "react-router-dom"
import {
    getAccessTokens,
    getRegisteredCharacters,
} from "../../utils/localStorage.ts"

const Activity = () => {
    const [registeredCharacters, setRegisteredCharacters] = useState<
        Character[]
    >([])
    const [verifiedCharacters, setVerifiedCharacters] = useState<Character[]>(
        []
    )
    const [dataLoaded, setDataLoaded] = useState<boolean>(true)

    useEffect(() => {
        refreshCharacters()
    }, [])

    function refreshCharacters() {
        const registeredCharacters = getRegisteredCharacters()
        const accessTokens = getAccessTokens()

        setRegisteredCharacters(registeredCharacters)

        const verifiedCharacterIds = accessTokens.map(
            (token: AccessToken) => token.character_id
        )

        // fetch character data
        const promises = verifiedCharacterIds.map((id: string) =>
            getCharacterById(id)
        )
        Promise.all(promises).then((responses) => {
            const characters = responses
                .map((response) => response.data.data)
                .filter((character) => character)
            setVerifiedCharacters(characters)
            setDataLoaded(false)
        })
    }

    const conditionalContent = () => {
        if (dataLoaded) return <p>Loading...</p>
        if (verifiedCharacters.length > 0)
            return (
                <div>
                    <Stack
                        className="character-selection-container"
                        direction="column"
                        gap="5px"
                    >
                        <label htmlFor="character-selection">
                            Select a character:
                        </label>
                        <select className="large" id="character-selection">
                            {verifiedCharacters.map((character) => (
                                <option key={character.id} value={character.id}>
                                    {character.name}
                                </option>
                            ))}
                        </select>
                    </Stack>
                    <p className="secondary-text">
                        You can only view the data of your{" "}
                        <Link className="link" to="/registration">
                            registered, verified characters.
                        </Link>
                    </p>
                </div>
            )
        if (verifiedCharacters.length === 0 && registeredCharacters.length > 0)
            return (
                <p>
                    You have not verified any characters. Head over to the{" "}
                    <Link className="link" to="/registration">
                        Character Registration
                    </Link>{" "}
                    page to do so. Once a character has been verified, you'll be
                    able to view their activity here.
                </p>
            )
        if (
            verifiedCharacters.length === 0 &&
            registeredCharacters.length === 0
        )
            return (
                <p>
                    You have not registered any characters. Head over to the{" "}
                    <Link className="link" to="/registration">
                        Character Registration
                    </Link>{" "}
                    page to get started. Once a character has been registered
                    and verified, you'll be able to view their activity here.
                </p>
            )
    }

    return (
        <Page
            title="Character Activity History"
            description="View detailed information about your characters' activity history, including questing history, level history, login history, and more."
        >
            <ContentCluster title="Character Activity">
                {conditionalContent()}
            </ContentCluster>
            <ContentCluster title="See Also...">
                <div className="nav-card-cluster">
                    <NavigationCard type="registration" />
                </div>
            </ContentCluster>
        </Page>
    )
}

export default Activity
