import React, { useMemo, useState } from "react"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import NavigationCard from "../global/NavigationCard.tsx"
import ValidationMessage from "../global/ValidationMessage.tsx"
import Spacer from "../global/Spacer.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button.tsx"
import { Character } from "../../models/Character.ts"
import { ReactComponent as Delete } from "../../assets/svg/delete.svg"
import CharacterSelectModal from "../modals/CharacterSelectModal.tsx"
import useGetCharacterList from "../../hooks/useGetCharacterList.ts"
import {
    getFriends,
    setFriends,
    addFriend,
    removeFriend,
} from "../../utils/localStorage.ts"
import CharacterTable, { CharacterTableRow } from "../tables/CharacterTable.tsx"
import useLimitedInterval from "../../hooks/useLimitedInterval.ts"
import { MsFromHours, MsFromSeconds } from "../../utils/timeUtils.ts"
import { StaleDataPageMessage } from "../global/CommonMessages.tsx"
import { MAX_FRIENDS } from "../../constants/client.ts"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils.ts"

const friendTableSortFunction = (
    a: CharacterTableRow,
    b: CharacterTableRow
): number => {
    const aOnline = a.character.is_online ? 1 : 0
    const bOnline = b.character.is_online ? 1 : 0
    const onlineComparison = bOnline - aOnline
    if (onlineComparison !== 0) {
        return onlineComparison
    }

    if (a.character.name === b.character.name)
        return a.character.id - b.character.id
    return (a.character.name || "").localeCompare(b.character.name || "")
}

const Friends = () => {
    const {
        characters: friends,
        isLoading,
        isError,
        reload,
        addCharacter,
        removeCharacter,
        lastFetch,
    } = useGetCharacterList({
        getCharactersFromLocalStorage: getFriends,
        setCharactersInLocalStorage: setFriends,
        addCharacterToLocalStorage: addFriend,
        removeCharacterFromLocalStorage: removeFriend,
    })
    const [millisSinceLastReload, setMillisSinceLastReload] =
        useState<number>(0)
    const [showAddFriendModal, setShowAddFriendModal] = useState<boolean>(false)
    const { isActive } = useLimitedInterval({
        callback: reload,
        intervalMs: MsFromSeconds(15),
        ttlMs: MsFromHours(5),
    })
    // Update the millis since last reload every 5 seconds
    // This is used to show how long ago the friends list was last refreshed
    useLimitedInterval({
        callback: () => {
            setMillisSinceLastReload(
                Math.round((Date.now() - lastFetch.getTime()) / 5000) * 5000
            )
        },
        intervalMs: MsFromSeconds(5),
        ttlMs: MsFromHours(5),
    })

    const characterRows = useMemo<CharacterTableRow[]>(
        () =>
            friends.map((friend: Character) => {
                return {
                    character: friend,
                    actions: (
                        <Delete
                            className="clickable-icon"
                            onClick={() => {
                                removeCharacter(friend)
                            }}
                        />
                    ),
                }
            }),
        [friends]
    )

    const getLastReloadString = () => {
        if (friends.length === 0) {
            return "---"
        }
        const prettyString = convertMillisecondsToPrettyString(
            millisSinceLastReload,
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

    return (
        <Page
            title="Friends List"
            description="Add your friends so that you can see what they're up to!"
        >
            {!isActive && <StaleDataPageMessage />}
            {showAddFriendModal && (
                <CharacterSelectModal
                    previouslyAddedCharacters={friends}
                    onCharacterSelected={addCharacter}
                    onClose={() => setShowAddFriendModal(false)}
                />
            )}
            <ContentClusterGroup>
                <ContentCluster
                    title="Friends"
                    subtitle="Manage a list of your friends."
                >
                    <CharacterTable
                        characterRows={characterRows}
                        noCharactersMessage="No friends added"
                        isLoaded={!isLoading}
                        tableSortFunction={friendTableSortFunction}
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
                            onClick={() => setShowAddFriendModal(true)}
                            disabled={friends.length >= MAX_FRIENDS}
                        >
                            {friends.length >= MAX_FRIENDS
                                ? "Max friends reached"
                                : "Add a friend"}
                        </Button>
                    </Stack>
                </ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard type="ignores" />
                        <NavigationCard type="registration" />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Friends
