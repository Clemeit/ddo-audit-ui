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
import { useLocation } from "react-router-dom"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import Button from "../global/Button.tsx"
import Spacer from "../global/Spacer.tsx"
import useGetCharacterActivity from "../../hooks/useGetCharacterActivity.ts"
import { CharacterActivityType } from "../../models/Activity.ts"
import {
    DataLoadingErrorPageMessage,
    LiveDataHaultedPageMessage,
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
import { LoadingState } from "../../models/Api.ts"
import LevelActivity from "./LevelActivity.tsx"
import useSearchParamState, {
    SearchParamType,
} from "../../hooks/useSearchParamState.ts"
import PageMessage from "../global/PageMessage.tsx"
import useBooleanFlag from "../../hooks/useBooleanFlags.ts"
import { BOOLEAN_FLAGS } from "../../utils/localStorage.ts"
import Link from "../global/Link.tsx"

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
    const [isReloadDisabled, setIsReloadDisabled] = useState<boolean>(false)
    const [hideActivityDevelopmentNotice, setHideActivityDevelopmentNotice] =
        useBooleanFlag(BOOLEAN_FLAGS.hideActivityDevelopmentNotice, false)

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

    const lastCharacterState = useRef<Character | null>(null)
    const [isCharacterOnline, setIsCharacterOnline] = useState<boolean>(false)
    const [isCharacterSelectionInvalid, setIsCharacterSelectionInvalid] =
        useState<boolean>(false)

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
    const {
        activityData: levelActivity,
        isLoading: levelActivityIsLoading,
        isError: levelActivityIsError,
        reload: reloadLevelActivityData,
    } = useGetCharacterActivity({
        characterId: selectedCharacterAndAccessToken?.character?.id,
        accessToken: selectedCharacterAndAccessToken?.accessToken?.access_token,
        activityType: CharacterActivityType.total_level,
    })
    const { data: characterData, state: characterDataState } =
        usePollApi<SingleCharacterResponseModel>({
            endpoint: `${CHARACTER_ENDPOINT}/${selectedCharacterAndAccessToken.character?.id}`,
            interval: isCharacterOnline ? MsFromSeconds(1) : MsFromSeconds(5),
            lifespan: MsFromHours(8),
            enabled: !!selectedCharacterAndAccessToken.character?.id,
        })
    const [selectedTimestampRange, setSelectedTimestampRange] = useState<{
        start: number | null
        end: number | null
    }>({ start: null, end: null })
    // Track which table initiated the selection and a version counter to force effects
    const [lastSelectionSource, setLastSelectionSource] = useState<
        "location" | "level" | "online" | null
    >(null)
    const [selectionVersion, setSelectionVersion] = useState<number>(0)

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

        if (didReload || !lastCharacterState.current) {
            lastCharacterState.current = characterData?.data
        }
    }, [characterData])

    useEffect(() => {
        const next = characterData?.data?.is_online
        if (next !== undefined) setIsCharacterOnline(next)
    }, [characterData?.data?.is_online])

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

    const { getSearchParam, setSearchParam } = useSearchParamState()
    const selectedCharacterName =
        getSearchParam(SearchParamType.CHARACTER) || ""
    const setSelectedCharacterName = (name: string) => {
        setSearchParam(SearchParamType.CHARACTER, name)
    }

    useEffect(() => {
        if (!isLoaded) return
        if (!selectedCharacterName) {
            setSelectedCharacterAndAccessToken({
                character: null,
                accessToken: null,
            })
            setIsCharacterSelectionInvalid(false)
            return
        }
        const character =
            verifiedCharacters.find(
                (character: Character) =>
                    character.id.toString() === selectedCharacterName
            ) || null
        if (character && accessTokens) {
            setIsCharacterSelectionInvalid(false)
            const accessToken = accessTokens.find(
                (token: AccessToken) => token.character_id === character.id
            )
            if (accessToken) {
                setSelectedCharacterAndAccessToken({
                    character,
                    accessToken,
                })
            }
        } else {
            setIsCharacterSelectionInvalid(true)
            setSelectedCharacterAndAccessToken({
                character: null,
                accessToken: null,
            })
        }
    }, [verifiedCharacters, selectedCharacterName])

    const conditionalSelectionContent = () => {
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
                        <Stack gap="10px" align="center" width="100%">
                            <select
                                className="full-width-on-smallish-mobile"
                                id="character-selection"
                                value={selectedCharacterName}
                                onChange={(e) =>
                                    setSelectedCharacterName(e.target.value)
                                }
                            >
                                <option value="">Select a character...</option>
                                {verifiedCharacters
                                    .sort((a, b) =>
                                        (a.name ?? "").localeCompare(
                                            b.name ?? ""
                                        )
                                    )
                                    .map((character) => (
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
                                    reloadCharacters()
                                    reloadLocationActivityData()
                                    reloadOnlineActivityData()
                                    reloadLevelActivityData()
                                    setIsReloadDisabled(true)
                                    setTimeout(() => {
                                        setIsReloadDisabled(false)
                                    }, 2000)
                                }}
                                disabled={!isLoaded || isReloadDisabled}
                            >
                                Reload
                            </Button>
                        </Stack>
                    </Stack>
                    <p className="secondary-text">
                        You can only view the data of your{" "}
                        <Link to="/registration">
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
        return (
            <Stack direction="column" gap="20px">
                <LocationActivity
                    quests={quests}
                    areas={areas}
                    locationActivity={
                        selectedCharacterAndAccessToken?.character
                            ? locationActivity
                            : []
                    }
                    onlineActivity={
                        selectedCharacterAndAccessToken?.character
                            ? onlineActivity
                            : []
                    }
                    handleActivityClick={(timestampRange: {
                        start: number | null
                        end: number | null
                    }) => {
                        setSelectedTimestampRange(timestampRange)
                        setLastSelectionSource("location")
                        setSelectionVersion((v) => v + 1)
                    }}
                    selectedTimestampRange={selectedTimestampRange}
                    lastSelectionSource={lastSelectionSource}
                    selectionVersion={selectionVersion}
                />
                <LevelActivity
                    areas={areas}
                    levelActivity={
                        selectedCharacterAndAccessToken?.character
                            ? levelActivity
                            : []
                    }
                    locationActivity={
                        selectedCharacterAndAccessToken?.character
                            ? locationActivity
                            : []
                    }
                    onlineActivity={
                        selectedCharacterAndAccessToken?.character
                            ? onlineActivity
                            : []
                    }
                    handleActivityClick={(timestampRange: {
                        start: number | null
                        end: number | null
                    }) => {
                        setSelectedTimestampRange(timestampRange)
                        setLastSelectionSource("level")
                        setSelectionVersion((v) => v + 1)
                    }}
                    selectedTimestampRange={selectedTimestampRange}
                    lastSelectionSource={lastSelectionSource}
                    selectionVersion={selectionVersion}
                />
                <OnlineActivity
                    onlineActivity={
                        selectedCharacterAndAccessToken?.character
                            ? onlineActivity
                            : []
                    }
                    handleActivityClick={(timestampRange: {
                        start: number | null
                        end: number | null
                    }) => {
                        setSelectedTimestampRange(timestampRange)
                        setLastSelectionSource("online")
                        setSelectionVersion((v) => v + 1)
                    }}
                    selectedTimestampRange={selectedTimestampRange}
                    lastSelectionSource={lastSelectionSource}
                    selectionVersion={selectionVersion}
                />
            </Stack>
        )
    }

    return (
        <Page
            title="Character Activity History"
            description="View detailed information about your characters' activity history, including questing history, level history, login history, and more."
            pageMessages={() => {
                const messages = []
                if (characterDataState === LoadingState.Haulted)
                    messages.push(<LiveDataHaultedPageMessage />)
                if (isCharacterSelectionInvalid)
                    messages.push(
                        <PageMessage
                            title="Permission Denied"
                            type="error"
                            message="You don't have permission to view that character. Make sure you've registered and verified the character."
                        />
                    )
                if (
                    locationActivityIsError ||
                    onlineActivityIsError ||
                    levelActivityIsError
                ) {
                    messages.push(<DataLoadingErrorPageMessage />)
                }
                if (!hideActivityDevelopmentNotice) {
                    messages.push(
                        <PageMessage
                            title="Active Development"
                            message={
                                <span>
                                    This page is currently in active
                                    development. If you encounter any issues or
                                    have suggestions, please visit the{" "}
                                    <Link to="/feedback">Feedback page</Link>.
                                </span>
                            }
                            type="info"
                            onDismiss={() =>
                                setHideActivityDevelopmentNotice(true)
                            }
                        />
                    )
                }
                return messages
            }}
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
