import React, { useMemo, useState } from "react"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import { Character } from "../../models/Character.ts"
import { addRegisteredCharacter } from "../../utils/localStorage.ts"
import Button from "../global/Button.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import { ReactComponent as Delete } from "../../assets/svg/delete.svg"
import { ReactComponent as Checkmark } from "../../assets/svg/checkmark.svg"
import NavigationCard from "../global/NavigationCard.tsx"
import Page from "../global/Page.tsx"
import Spacer from "../global/Spacer.tsx"
import Stack from "../global/Stack.tsx"
import ValidationMessage from "../global/ValidationMessage.tsx"
import "./Registration.css"
import NavCardCluster from "../global/NavCardCluster.tsx"
import { Link, useNavigate } from "react-router-dom"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils.ts"
import CharacterTable, { CharacterTableRow } from "../tables/CharacterTable.tsx"
import CharacterSelectModal from "../modals/CharacterSelectModal.tsx"
import { useLfmContext } from "../../contexts/LfmContext.tsx"

const Registration = () => {
    const {
        registeredCharacters,
        accessTokens,
        isLoaded,
        isError,
        reload: reloadCharacters,
        unregisterCharacter,
        lastReload,
    } = useGetRegisteredCharacters()

    const { trackedCharacterIds, setTrackedCharacterIds } = useLfmContext()
    const navigate = useNavigate()
    const [showCharacterSelectModal, setShowCharacterSelectModal] =
        useState<boolean>(false)

    const onUnregisterCharacter = (character: Character) => {
        // Remove the character from tracked characters (lfm)
        if (trackedCharacterIds.includes(character.id)) {
            setTrackedCharacterIds(
                trackedCharacterIds.filter((id) => id !== character.id)
            )
        }
        unregisterCharacter(character)
    }

    const getActionCellForRow = (character: Character) => {
        const actionCellVerified = (
            <Stack gap="5px" justify="flex-end">
                <Checkmark title="Verified" />
                <Delete
                    className="clickable-icon"
                    onClick={() => {
                        onUnregisterCharacter(character)
                    }}
                />
            </Stack>
        )

        const actionCellUnverified = (
            <Stack gap="5px" justify="flex-end">
                <Button
                    type="secondary"
                    className="verify-button"
                    small
                    onClick={() => {
                        navigate(`/verification?id=${character.id}`)
                    }}
                >
                    Verify
                </Button>
                <Delete
                    className="clickable-icon"
                    onClick={() => {
                        onUnregisterCharacter(character)
                    }}
                />
            </Stack>
        )

        const isCharacterVerified = accessTokens.some(
            (token) => token.character_id === character.id
        )

        return isCharacterVerified ? actionCellVerified : actionCellUnverified
    }

    const characterRows: CharacterTableRow[] = useMemo(() => {
        return registeredCharacters.map((character) => ({
            character: character,
            actions: getActionCellForRow(character),
        }))
    }, [registeredCharacters, accessTokens])

    // Registering a new character:
    const [millisSinceReload, setMillisSinceReload] = useState<number>(0)
    const [firstLoad] = useState<Date>(new Date())

    React.useEffect(() => {
        setMillisSinceReload(new Date().getTime() - lastReload.getTime())

        const updateReloadStatus = setInterval(() => {
            if (new Date().getTime() - firstLoad.getTime() > 1000 * 60 * 60 * 5)
                return
            const millis = new Date().getTime() - lastReload.getTime()
            if (millis > 30000) reloadCharacters()
            setMillisSinceReload(millis)
        }, 10000)

        return () => clearInterval(updateReloadStatus)
    }, [lastReload])

    function getLastReloadString() {
        if (registeredCharacters.length === 0) {
            return "---"
        }
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

    function saveCharacterToLocalStorage(character: Character) {
        addRegisteredCharacter(character)
        reloadCharacters()
    }

    function addCharacter(character: Character) {
        saveCharacterToLocalStorage(character)
        if (!trackedCharacterIds.includes(character.id)) {
            setTrackedCharacterIds([...trackedCharacterIds, character.id])
        }
    }

    return (
        <Page
            title="DDO Character Registration"
            description="Register your characters to automatically filter LFMs and see your raid timers."
            className="registration"
        >
            {showCharacterSelectModal && (
                <CharacterSelectModal
                    previouslyAddedCharacters={registeredCharacters}
                    onCharacterSelected={addCharacter}
                    onClose={() => setShowCharacterSelectModal(false)}
                />
            )}
            <ContentClusterGroup>
                <ContentCluster
                    title="Registered Characters"
                    subtitle="Register your characters to automatically filter LFMs and see your raid timers."
                >
                    <CharacterTable
                        characterRows={characterRows}
                        isLoaded={isLoaded}
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
                            onClick={() => setShowCharacterSelectModal(true)}
                        >
                            Add a character
                        </Button>
                    </Stack>
                </ContentCluster>
                <ContentCluster title="About this Feature">
                    <p>
                        Registering your characters is entirely optional. You do
                        not need to provide log-in credentials.{" "}
                        <span className="orange-text">
                            You should <strong>never</strong> provide DDO Audit
                            with any personal or account information such as
                            username, password, or billing details.
                        </span>
                    </p>
                    <p>
                        Once a character is registered, the LFM viewer can
                        automatically filter based on that character's server
                        and level. The LFM viewer will also show an indicator on
                        a post if you're currently on timer for that raid. You
                        can view raid timers on the{" "}
                        <Link to="/timers" className="link">
                            Timers page
                        </Link>
                        .
                    </p>
                    <p>
                        You can also Verify ownership of a character to unlock
                        additional features such as quest ransack, questing
                        history, level-up trends, and more. See the{" "}
                        <Link to="/activity" className="link">
                            Activity page
                        </Link>{" "}
                        for more information.
                    </p>
                </ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard type="timers" />
                        <NavigationCard type="activity" />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Registration
