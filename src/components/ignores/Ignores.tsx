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
import {
    getIgnores,
    setIgnores,
    addIgnore,
    removeIgnore,
} from "../../utils/localStorage.ts"
import CharacterTable, {
    CharacterTableRow,
    ColumnType,
} from "../tables/CharacterTable.tsx"
import Checkbox from "../global/Checkbox.tsx"
import { useModalNavigation } from "../../hooks/useModalNavigation.ts"
import { useWhoContext, WhoProvider } from "../../contexts/WhoContext.tsx"
import { useLfmContext } from "../../contexts/LfmContext.tsx"
import useGetIgnores from "../../hooks/useGetIgnores.ts"

const ignoreTableSortFunction = (
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

const Ignores = () => {
    const {
        ignores,
        isIgnoresLoading,
        isIgnoresError,
        addIgnore,
        removeIgnore,
    } = useGetIgnores()
    const {
        isModalOpen,
        openModal: handleOpenModal,
        closeModal: handleCloseModal,
    } = useModalNavigation()
    const { hideIgnoredCharacters, setHideIgnoredCharacters } = useWhoContext()
    const {
        hideGroupsPostedByIgnoredCharacters,
        setHideGroupsPostedByIgnoredCharacters,
        hideGroupsContainingIgnoredCharacters,
        setHideGroupsContainingIgnoredCharacters,
    } = useLfmContext()

    const characterRows = useMemo<CharacterTableRow[]>(
        () =>
            ignores.map((ignore: Character) => {
                return {
                    character: ignore,
                    actions: (
                        <Delete
                            className="clickable-icon"
                            onClick={() => {
                                removeIgnore(ignore)
                            }}
                        />
                    ),
                }
            }),
        [ignores]
    )

    return (
        <Page
            title="Ignore List"
            description="Adding characters to your ignore list will enable additional LFM filtering and viewing options."
        >
            {isModalOpen && (
                <CharacterSelectModal
                    previouslyAddedCharacters={ignores}
                    onCharacterSelected={addIgnore}
                    onClose={handleCloseModal}
                />
            )}
            <ContentClusterGroup>
                <ContentCluster
                    title="Ignore List"
                    subtitle="Manage a list of your ignored characters."
                >
                    <CharacterTable
                        characterRows={characterRows}
                        noCharactersMessage="No ignored characters added"
                        isLoaded={!isIgnoresLoading}
                        tableSortFunction={ignoreTableSortFunction}
                        visibleColumns={[
                            ColumnType.NAME,
                            ColumnType.SERVER_NAME,
                            ColumnType.GUILD,
                            ColumnType.ACTIONS,
                        ]}
                    />
                    <ValidationMessage
                        type="error"
                        message="Failed to load characters. Showing cached data."
                        visible={isIgnoresError}
                    />
                    <Spacer size="20px" />
                    <Stack gap="10px" fullWidth justify="space-between">
                        <div />
                        <Button type="primary" onClick={handleOpenModal}>
                            Ignore a character
                        </Button>
                    </Stack>
                </ContentCluster>
                <ContentCluster
                    title="Behavior"
                    subtitle="Control how the LFM Viewer and Who List handle ignored characters. These settings can also be found on their respective pages."
                >
                    <h3>LFM Viewer</h3>
                    <Stack gap="10px" direction="column">
                        <Checkbox
                            checked={hideGroupsPostedByIgnoredCharacters}
                            onChange={(e) =>
                                setHideGroupsPostedByIgnoredCharacters(
                                    e.target.checked
                                )
                            }
                        >
                            Hide groups posted by ignored characters
                        </Checkbox>
                        <Checkbox
                            checked={hideGroupsContainingIgnoredCharacters}
                            onChange={(e) =>
                                setHideGroupsContainingIgnoredCharacters(
                                    e.target.checked
                                )
                            }
                        >
                            Hide groups when an ignored character is a member of
                            the party
                        </Checkbox>
                    </Stack>
                    <h3>Who List</h3>
                    <Stack gap="10px" direction="column">
                        <Checkbox
                            checked={hideIgnoredCharacters}
                            onChange={(e) =>
                                setHideIgnoredCharacters(e.target.checked)
                            }
                        >
                            Hide ignored characters from the Who List
                        </Checkbox>
                    </Stack>
                </ContentCluster>
                <ContentCluster title="About this Feature">
                    <p>
                        Adding characters to your ignore list will enable
                        additional LFM Viewer and Who List filtering and viewing
                        options, including:
                    </p>
                    <ul>
                        <li>Hiding LFMs posted by ignored characters</li>
                        <li>
                            Hiding LFMs when an ignored character is part of the
                            group
                        </li>
                        <li>Hiding ignored characters from the Who List</li>
                    </ul>
                </ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard type="friends" />
                        <NavigationCard type="registration" />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default Ignores
