import React, { useState, useEffect, useRef } from "react"
import NavigationCard from "../global/NavigationCard.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import { AccessToken } from "../../models/Verification.ts"
import {
    Character,
    SingleCharacterResponseModel,
} from "../../models/Character.ts"
import "./Activity.css"
import Stack from "../global/Stack.tsx"
import { Link, useLocation } from "react-router-dom"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import Button from "../global/Button.tsx"
import Spacer from "../global/Spacer.tsx"
import useGetCharacterActivity from "../../hooks/useGetCharacterActivity.ts"
import { CharacterActivityType } from "../../models/Activity.ts"
import {
    NoRegisteredAndVerifiedCharacters,
    NoVerifiedCharacters,
} from "../global/CommonMessages.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import { useAreaContext } from "../../contexts/AreaContext.tsx"
import { useQuestContext } from "../../contexts/QuestContext.tsx"
import LocationActivity from "./LocationActivity.tsx"
import OnlineActivity from "./OnlineActivity.tsx"
import usePollApi from "../../hooks/usePollApi.ts"
import { MsFromHours, MsFromSeconds } from "../../utils/timeUtils.ts"
import { CHARACTER_ENDPOINT } from "../../services/characterService.ts"
// import StatusBarChart from "./StatusBarChart.tsx"

// TODO: Location table updates:
// - Show quest name when a location belongs to a quest.
// - Click on a quest entry to see how your run stacks up
// - Click on a quest entry to see all of your runs, including ransack
// - The Quest Name filter is filtering by location, it should filter by quest

const Activity = () => {
    const location = useLocation()
    const {
        registeredCharacters,
        verifiedCharacters,
        accessTokens,
        isLoaded,
        isError,
        reload: reloadCharacters,
    } = useGetRegisteredCharacters()

    const [
        selectedCharacterAndAccessToken,
        setSelectedCharacterAndAccessToken,
    ] = useState<{
        character: Character | null
        accessToken: AccessToken | null
    }>({
        character: null,
        accessToken: null,
    })

    const { areas } = useAreaContext()
    const { quests } = useQuestContext()

    const {
        activityData: locationActivity,
        isLoading: locationActivityIsLoading,
        isError: locationActivityIsError,
        reload: reloadLocationActivityData,
    } = useGetCharacterActivity({
        characterId: selectedCharacterAndAccessToken?.character?.id,
        accessToken: selectedCharacterAndAccessToken?.accessToken?.access_token,
        activityType: CharacterActivityType.location,
    })
    const {
        activityData: onlineActivity,
        isLoading: onlineActivityIsLoading,
        isError: onlineActivityIsError,
        reload: reloadOnlineActivityData,
    } = useGetCharacterActivity({
        characterId: selectedCharacterAndAccessToken?.character?.id,
        accessToken: selectedCharacterAndAccessToken?.accessToken?.access_token,
        activityType: CharacterActivityType.status,
    })
    const { data: characterData } = usePollApi<SingleCharacterResponseModel>({
        endpoint: `${CHARACTER_ENDPOINT}/${selectedCharacterAndAccessToken.character?.id}`,
        interval: MsFromSeconds(5),
        lifespan: MsFromHours(8),
    })

    const lastCharacterState = useRef<Character | null>(null)

    useEffect(() => {
        let didReload = false
        if (
            lastCharacterState.current?.location_id !==
            characterData?.data?.location_id
        ) {
            didReload = true
            reloadLocationActivityData()
        }
        if (
            lastCharacterState.current?.is_online !==
            characterData?.data?.is_online
        ) {
            didReload = true
            reloadOnlineActivityData()
        }

        if (didReload) {
            lastCharacterState.current = characterData.data
        }
    }, [characterData])

    useEffect(() => {
        // get character name param from url
        const characterName = new URLSearchParams(location.search).get(
            "character"
        )
        if (characterName && verifiedCharacters.length > 0) {
            const character = verifiedCharacters.find(
                (character: Character) =>
                    character.name?.toLowerCase() ===
                    characterName.toLowerCase()
            )
            if (character && accessTokens) {
                const accessToken = accessTokens.find(
                    (token: AccessToken) => token.character_id === character.id
                )
                if (accessToken) {
                    setSelectedCharacterAndAccessToken({
                        character,
                        accessToken,
                    })
                }
            }
        }
    }, [location.search, verifiedCharacters, accessTokens])

    function handleCharacterSelectionChange(
        e: React.ChangeEvent<HTMLSelectElement>
    ) {
        if (!e.target.value) {
            setSelectedCharacterAndAccessToken({
                character: null,
                accessToken: null,
            })
            // clear character from url
            const searchParams = new URLSearchParams(location.search)
            searchParams.delete("character")
            window.history.replaceState(
                null,
                "",
                `${location.pathname}?${searchParams.toString()}`
            )
            return
        }

        const character =
            verifiedCharacters.find(
                (character: Character) =>
                    character.id.toString() === e.target.value
            ) || null
        if (character && accessTokens) {
            const accessToken = accessTokens.find(
                (token: AccessToken) => token.character_id === character.id
            )
            if (accessToken) {
                setSelectedCharacterAndAccessToken({
                    character,
                    accessToken,
                })
            }
            // set selected character in url
            const searchParams = new URLSearchParams(location.search)
            if (character.name?.toLowerCase()) {
                searchParams.set("character", character.name.toLowerCase())
                window.history.replaceState(
                    null,
                    "",
                    `${location.pathname}?${searchParams.toString()}`
                )
            }
        }
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
                        type="secondary"
                        onClick={reloadCharacters}
                        disabled={!isLoaded}
                    >
                        Reload
                    </Button>
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
                                className="full-width-on-mobile"
                                id="character-selection"
                                value={
                                    selectedCharacterAndAccessToken
                                        ? selectedCharacterAndAccessToken
                                              .character?.id
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
                                type="secondary"
                                small
                                onClick={() => {
                                    reloadLocationActivityData()
                                    reloadOnlineActivityData()
                                    // reloadLevelActivityData()
                                }}
                            >
                                Reload
                            </Button>
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
            return <NoVerifiedCharacters />
        if (verifiedCharacters.length === 0)
            return <NoRegisteredAndVerifiedCharacters />
    }

    const conditionalActivityContent = () => {
        if (verifiedCharacters.length === 0)
            return (
                <div
                    style={{
                        width: "100%",
                        height: "10vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <span>Waiting for some verified characters...</span>
                </div>
            )

        return (
            <Stack direction="column" gap="20px">
                <LocationActivity
                    quests={quests}
                    areas={areas}
                    locationActivity={locationActivity}
                />
                <OnlineActivity onlineActivity={onlineActivity} />
            </Stack>
        )
    }

    return (
        <Page
            title="Character Activity History"
            description="View detailed information about your characters' activity history, including questing history, level history, login history, and more."
        >
            <ContentClusterGroup>
                <ContentCluster title="Character Activity">
                    {conditionalSelectionContent()}
                    {conditionalActivityContent()}
                </ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard type="registration" />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Activity
