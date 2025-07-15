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
import CharacterTable, { CharacterTableRow } from "../tables/CharacterTable.tsx"
import useLimitedInterval from "../../hooks/useLimitedInterval.ts"
import { MsFromHours, MsFromSeconds } from "../../utils/timeUtils.ts"
import { StaleDataPageMessage } from "../global/CommonMessages.tsx"
import { MAX_FRIENDS } from "../../constants/client.ts"
import { convertMillisecondsToPrettyString } from "../../utils/stringUtils.ts"
import { useModalNavigation } from "../../hooks/useModalNavigation.ts"
import { useLfmContext } from "../../contexts/LfmContext.tsx"
import { useWhoContext } from "../../contexts/WhoContext.tsx"
import Checkbox from "../global/Checkbox.tsx"
import useGetFriends from "../../hooks/useGetFriends.ts"

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
        friends,
        isFriendsLoading,
        isFriendsError,
        reloadFriends,
        addFriend,
        removeFriend,
        lastFriendsFetch,
    } = useGetFriends()
    const [millisSinceLastReload, setMillisSinceLastReload] =
        useState<number>(0)
    const { isActive } = useLimitedInterval({
        callback: reloadFriends,
        intervalMs: MsFromSeconds(15),
        ttlMs: MsFromHours(5),
    })
    // Update the millis since last reload every 5 seconds
    // This is used to show how long ago the friends list was last refreshed
    useLimitedInterval({
        callback: () => {
            setMillisSinceLastReload(
                Math.round((Date.now() - lastFriendsFetch.getTime()) / 5000) *
                    5000
            )
        },
        intervalMs: MsFromSeconds(5),
        ttlMs: MsFromHours(5),
    })
    const {
        isModalOpen,
        openModal: handleOpenModal,
        closeModal: handleCloseModal,
    } = useModalNavigation()
    const {
        showIndicationForGroupsPostedByFriends,
        setShowIndicationForGroupsPostedByFriends,
        showIndicationForGroupsContainingFriends,
        setShowIndicationForGroupsContainingFriends,
    } = useLfmContext()
    const {
        pinFriends,
        setPinFriends,
        alwaysShowFriends,
        setAlwaysShowFriends,
    } = useWhoContext()

    const characterRows = useMemo<CharacterTableRow[]>(
        () =>
            friends.map((friend: Character) => {
                return {
                    character: friend,
                    actions: (
                        <Delete
                            className="clickable-icon"
                            onClick={() => {
                                removeFriend(friend)
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
            {isModalOpen && (
                <CharacterSelectModal
                    previouslyAddedCharacters={friends}
                    onCharacterSelected={addFriend}
                    onClose={handleCloseModal}
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
                        isLoaded={!isFriendsLoading}
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
                        visible={isFriendsError}
                    />
                    <Spacer size="20px" />
                    <Stack gap="10px" fullWidth justify="space-between">
                        <div />
                        <Button
                            type="primary"
                            onClick={handleOpenModal}
                            disabled={friends.length >= MAX_FRIENDS}
                        >
                            {friends.length >= MAX_FRIENDS
                                ? "Max friends reached"
                                : "Add a friend"}
                        </Button>
                    </Stack>
                </ContentCluster>
                <ContentCluster
                    title="Behavior"
                    subtitle="Control how the LFM viewer and Who list handle friends. These settings can also be found on their respective pages."
                >
                    <h3>LFM Viewer</h3>
                    <Stack gap="10px" direction="column">
                        <Checkbox
                            checked={showIndicationForGroupsPostedByFriends}
                            onChange={(e) =>
                                setShowIndicationForGroupsPostedByFriends(
                                    e.target.checked
                                )
                            }
                        >
                            Show an indicator for LFMs posted by friends
                        </Checkbox>
                        <Checkbox
                            checked={showIndicationForGroupsContainingFriends}
                            onChange={(e) =>
                                setShowIndicationForGroupsContainingFriends(
                                    e.target.checked
                                )
                            }
                        >
                            Show an indicator for LFMs that friends are a part
                            of
                        </Checkbox>
                    </Stack>
                    <h3>Who List</h3>
                    <Stack gap="10px" direction="column">
                        <Checkbox
                            checked={pinFriends}
                            onChange={(e) => setPinFriends(e.target.checked)}
                        >
                            Pin friends to the top of the Who list
                        </Checkbox>
                        <Checkbox
                            checked={alwaysShowFriends}
                            onChange={(e) =>
                                setAlwaysShowFriends(e.target.checked)
                            }
                        >
                            Always show online friends in the Who list
                        </Checkbox>
                    </Stack>
                </ContentCluster>
                <ContentCluster title="About this Feature">
                    <p>
                        Adding friends allows you to easily check whether or not
                        they're online. It also provides the LFM viewer and Who
                        list with additional features including:
                    </p>
                    <ul>
                        <li>
                            A visual indication that an LFM is posted by a
                            friend
                        </li>
                        <li>
                            A visual indication when a friend is part of a group
                        </li>
                        <li>
                            A visual indicationin the Who list when a friend is
                            online
                        </li>
                        <li>
                            The ability to pin online friends to the top of the
                            Who list
                        </li>
                    </ul>
                    <p>
                        More features may be added in the future, such as push
                        notifications when friends are online.
                    </p>
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
