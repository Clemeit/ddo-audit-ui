import React, { useState, useEffect } from "react"
import NavigationCard from "../global/NavigationCard.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Page from "../global/Page.tsx"
import { AccessToken } from "../../models/Verification.ts"
import { Character } from "../../models/Character.ts"
import "./Activity.css"
import Stack from "../global/Stack.tsx"
import { Link, useLocation } from "react-router-dom"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import Button from "../global/Button.tsx"
import Spacer from "../global/Spacer.tsx"
import useGetCharacterActivity from "../../hooks/useGetCharacterActivity.ts"
import { CharacterActivityType } from "../../models/Activity.ts"
import ActivityTable from "./ActivityTable.tsx"
import useDebounce from "../../hooks/useDebounce.ts"
import { getLocationActivityStats } from "../../utils/locationActivityUtil.ts"
import { RANSACK_HOURS, RANSACK_THRESHOLD } from "../../constants/game.ts"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils.ts"
import {
    NoRegisteredAndVerifiedCharacters,
    NoVerifiedCharacters,
} from "../global/CommonMessages.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
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

    const [areaFilter, setAreaFilter] = useState("")
    const debouncedAreaFilter = useDebounce(areaFilter, 200)

    const {
        data: locationActivity,
        loadingState: locationActivityLoadingState,
        reload: reloadLocationActivityData,
    } = useGetCharacterActivity({
        characterId: selectedCharacterAndAccessToken?.character?.id,
        accessToken: selectedCharacterAndAccessToken?.accessToken?.access_token,
        activityType: CharacterActivityType.location,
    })
    const {
        data: statusActivity,
        loadingState: statusActivityLoadingState,
        reload: reloadStatusActivityData,
    } = useGetCharacterActivity({
        characterId: selectedCharacterAndAccessToken?.character?.id,
        accessToken: selectedCharacterAndAccessToken?.accessToken?.access_token,
        activityType: CharacterActivityType.status,
    })
    const {
        data: levelActivity,
        loadingState: levelActivityLoadingState,
        reload: reloadLevelActivityData,
    } = useGetCharacterActivity({
        characterId: selectedCharacterAndAccessToken?.character?.id,
        accessToken: selectedCharacterAndAccessToken?.accessToken?.access_token,
        activityType: CharacterActivityType.total_level,
    })

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

    function renderFilters() {
        const {
            totalTime,
            totalRuns,
            totalRunsWithinRansackHours,
            averageTime,
            ransackTimerStart,
        } = getLocationActivityStats(locationActivity, debouncedAreaFilter)

        return (
            <>
                <div className="activity-table-filter">
                    <label htmlFor="area-filter">Quest name:</label>
                    <input
                        id="area-filter"
                        className="large"
                        value={areaFilter}
                        onChange={(e) => {
                            setAreaFilter(e.target.value)
                        }}
                    />
                </div>
                <Stack
                    direction="row"
                    gap="20px"
                    className="activity-table-stats"
                >
                    <Stack direction="column" className="stat">
                        <span className="stat-title">Total time</span>
                        <span>
                            {totalTime
                                ? convertMillisecondsToPrettyString(totalTime)
                                : "-"}
                        </span>
                    </Stack>
                    <Stack direction="column" className="stat">
                        <span className="stat-title">Average time</span>
                        <span>
                            {averageTime
                                ? convertMillisecondsToPrettyString(averageTime)
                                : "-"}
                        </span>
                    </Stack>
                    <Stack direction="column" className="stat">
                        <span className="stat-title">Total runs</span>
                        <span>{totalRuns ? totalRuns : "-"}</span>
                    </Stack>
                    <Stack direction="column" className="stat">
                        <span className="stat-title">Ransack</span>
                        <span>
                            {totalRunsWithinRansackHours ? (
                                totalRunsWithinRansackHours >=
                                RANSACK_THRESHOLD ? (
                                    <span className="red-text">
                                        Until{" "}
                                        {new Date(
                                            ransackTimerStart?.getTime() +
                                                RANSACK_HOURS * 1000 * 60 * 60
                                        ).toLocaleString()}
                                    </span>
                                ) : (
                                    <span>
                                        {RANSACK_THRESHOLD -
                                            totalRunsWithinRansackHours}{" "}
                                        more runs
                                    </span>
                                )
                            ) : (
                                "-"
                            )}
                        </span>
                    </Stack>
                </Stack>
            </>
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
                                className="large full-width-mobile"
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
                                    reloadStatusActivityData()
                                    reloadLevelActivityData()
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
                {renderFilters()}
                <ActivityTable
                    characterActivity={locationActivity}
                    activityType={CharacterActivityType.location}
                    loadingState={locationActivityLoadingState}
                    filter={debouncedAreaFilter}
                />
                <ActivityTable
                    characterActivity={statusActivity}
                    activityType={CharacterActivityType.status}
                    loadingState={statusActivityLoadingState}
                />
                {/* <StatusBarChart
                    statusActivity={statusActivity}
                    locationActivity={locationActivity}
                /> */}
                <ActivityTable
                    characterActivity={levelActivity}
                    activityType={CharacterActivityType.total_level}
                    loadingState={levelActivityLoadingState}
                />
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
