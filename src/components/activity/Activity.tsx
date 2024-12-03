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
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import Button from "../global/Button.tsx"
import Spacer from "../global/Spacer.tsx"
import {
    getCharacterLocationActivityById,
    getCharacterStatusActivityById,
} from "../../services/activityService.ts"
import LocationActivityTable from "./LocationActivityTable.tsx"
import { CharacterActivityType, ActivityEvent } from "../../models/Activity.ts"
import StatusActivityTable from "./StatusActivityTable.tsx"

const Activity = () => {
    const {
        registeredCharacters,
        verifiedCharacters,
        accessTokens,
        isLoaded,
        isError,
        reload: reloadCharacters,
    } = useGetRegisteredCharacters()

    const [selectedCharacter, setSelectedCharacter] =
        useState<Character | null>(null)

    const [locationActivity, setLocationActivity] = useState<
        ActivityEvent[] | null
    >(null)
    const [statusActivity, setStatusActivity] = useState<
        ActivityEvent[] | null
    >(null)

    function reloadActivityData() {
        setLocationActivity(null)
        if (selectedCharacter) {
            const accessToken = accessTokens.find(
                (token: AccessToken) =>
                    token.character_id === selectedCharacter.id
            )
            if (accessToken) {
                getCharacterLocationActivityById(
                    selectedCharacter.id,
                    accessToken.access_token
                ).then((response) => {
                    setLocationActivity(response.data.data)
                })

                getCharacterStatusActivityById(
                    selectedCharacter.id,
                    accessToken.access_token
                ).then((response) => {
                    setStatusActivity(response.data.data)
                })
            }
        }
    }

    useEffect(() => {
        reloadActivityData()
    }, [selectedCharacter])

    function handleCharacterSelectionChange(e: any) {
        setSelectedCharacter(
            verifiedCharacters.find(
                (character: Character) => character.id === e.target.value
            ) || null
        )
    }

    const conditionalSelectionContent = () => {
        if (!isLoaded) return <p>Loading...</p>

        if (isError)
            return (
                <div>
                    <p>
                        Failed to load character data. Please try again later.
                    </p>
                    <Button
                        text="Reload"
                        type="secondary"
                        onClick={reloadCharacters}
                        disabled={!isLoaded}
                    />
                    <Spacer size="10px" />
                </div>
            )

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
                        <Stack gap="10px">
                            <select
                                className="large full-width-mobile"
                                id="character-selection"
                                value={
                                    selectedCharacter
                                        ? selectedCharacter?.id
                                        : ""
                                }
                                onChange={handleCharacterSelectionChange}
                            >
                                <option value="">Select a character...</option>
                                {verifiedCharacters.map((character) => (
                                    <option
                                        key={character.id}
                                        value={character.id}
                                    >
                                        {character.name}
                                    </option>
                                ))}
                            </select>
                            <Button
                                text="Reload"
                                type="secondary"
                                small
                                onClick={reloadActivityData}
                            />
                        </Stack>
                    </Stack>
                    <p className="secondary-text">
                        You can only view the data of your{" "}
                        <Link className="link" to="/registration">
                            registered, verified characters
                        </Link>
                        .
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

    const conditionalActivityContent = () => {
        return (
            <Stack direction="column" gap="20px">
                {locationActivity ? (
                    <LocationActivityTable
                        characterActivity={locationActivity}
                    />
                ) : null}
                {statusActivity ? (
                    <StatusActivityTable characterActivity={statusActivity} />
                ) : null}
            </Stack>
        )
    }

    return (
        <Page
            title="Character Activity History"
            description="View detailed information about your characters' activity history, including questing history, level history, login history, and more."
        >
            <ContentCluster title="Character Activity">
                {conditionalSelectionContent()}
                {conditionalActivityContent()}
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
