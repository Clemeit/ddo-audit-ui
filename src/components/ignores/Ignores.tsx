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
        characters: ignores,
        isLoading,
        isLoaded,
        isError,
        reload,
        addCharacter,
        removeCharacter,
    } = useGetCharacterList({
        getCharactersFromLocalStorage: getIgnores,
        setCharactersInLocalStorage: setIgnores,
        addCharacterToLocalStorage: addIgnore,
        removeCharacterFromLocalStorage: removeIgnore,
    })
    const [showAddIgnoreModal, setShowAddIgnoreModal] = useState<boolean>(false)

    const characterRows = useMemo<CharacterTableRow[]>(
        () =>
            ignores.map((ignore: Character) => {
                return {
                    character: ignore,
                    actions: (
                        <Delete
                            className="clickable-icon"
                            onClick={() => {
                                removeCharacter(ignore)
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
            {showAddIgnoreModal && (
                <CharacterSelectModal
                    previouslyAddedCharacters={ignores}
                    onCharacterSelected={addCharacter}
                    onClose={() => setShowAddIgnoreModal(false)}
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
                        isLoaded={!isLoading}
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
                        visible={isError}
                    />
                    <Spacer size="20px" />
                    <Stack gap="10px" fullWidth justify="space-between">
                        <div />
                        <Button
                            type="primary"
                            onClick={() => setShowAddIgnoreModal(true)}
                        >
                            Ignore a character
                        </Button>
                    </Stack>
                </ContentCluster>
                <ContentCluster title="Behavior">
                    <Stack gap="10px" direction="column">
                        <span>
                            This can contain aggregated settings from both the
                            Who and LFM context
                        </span>
                    </Stack>
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
