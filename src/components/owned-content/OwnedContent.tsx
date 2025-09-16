import React, { useEffect, useMemo, useState } from "react"
import "./OwnedContent.css"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import { useQuestContext } from "../../contexts/QuestContext.tsx"
import Checkbox from "../global/Checkbox.tsx"
import Stack from "../global/Stack.tsx"
import Button from "../global/Button"
import { useLfmContext } from "../../contexts/LfmContext.tsx"
import ColoredText from "../global/ColoredText.tsx"
import Spacer from "../global/Spacer.tsx"
import Link from "../global/Link.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import NavigationCard from "../global/NavigationCard.tsx"

const OwnedContent = () => {
    const { quests } = useQuestContext()
    const { ownedContent, setOwnedContent } = useLfmContext()

    const [contentFilterText, setContentFilterText] = useState<string>("")

    const handleContentSelection = (
        e: React.ChangeEvent<HTMLInputElement>,
        adventurePack: string
    ) => {
        const filteredContent =
            ownedContent?.filter((i) => i !== adventurePack) || []
        if (e.target.checked) {
            setOwnedContent([...filteredContent, adventurePack])
        } else {
            setOwnedContent(filteredContent)
        }
    }

    const adventurePacks: string[] = useMemo(() => {
        if (!quests) return []
        if (Object.keys(quests).length === 0) return []

        const packs: Set<string> = new Set<string>()
        Object.values(quests).forEach((quest) => {
            if (
                quest.required_adventure_pack != undefined &&
                quest.required_adventure_pack.trim() !== ""
            ) {
                packs.add(quest.required_adventure_pack)
            }
        })
        return Array.from(packs).sort((a, b) =>
            (a || "").localeCompare(b || "")
        )
    }, [quests])

    const handleSelectAll = () => {
        if (!contentFilterText) {
            setOwnedContent(adventurePacks)
        } else {
            const tempContent = [
                ...(ownedContent || []),
                ...adventurePacks.filter((adventurePack) => {
                    return adventurePack
                        .toLowerCase()
                        .includes(contentFilterText.toLowerCase())
                }),
            ]
            setOwnedContent(Array.from(new Set(tempContent)))
        }
    }

    const handleDeselectAll = () => {
        if (!contentFilterText) {
            setOwnedContent([])
        } else {
            setOwnedContent([
                ...(ownedContent || []).filter((adventurePack) => {
                    return !adventurePack
                        .toLowerCase()
                        .includes(contentFilterText.toLowerCase())
                }),
            ])
        }
    }

    const filteredContent = useMemo(
        () =>
            Array.from(adventurePacks).filter((adventurePack) => {
                if (!contentFilterText) return true
                return adventurePack
                    .toLowerCase()
                    .includes(contentFilterText.toLowerCase())
            }),
        [adventurePacks, contentFilterText]
    )

    return (
        <Page
            title="Owned Content"
            description="Specify the adventure packs and expansions that you own to better filter the LFM Viewed."
        >
            <ContentClusterGroup>
                <ContentCluster
                    title="Adventure Packs and Expansions"
                    subtitle="Specify the content that you own. You can choose to filter the LFM Viewed based on your selection."
                >
                    <Stack direction="column" gap="10px">
                        <Stack
                            direction="row"
                            gap="10px"
                            width="100%"
                            align="flex-end"
                        >
                            <Stack
                                direction="column"
                                gap="2px"
                                className="full-width-on-mobile"
                            >
                                <label
                                    htmlFor="content-filter-input"
                                    style={{
                                        color: "var(--secondary-text)",
                                        fontWeight: "bolder",
                                    }}
                                >
                                    Filter
                                </label>
                                <input
                                    id="content-filter-input"
                                    value={contentFilterText}
                                    onChange={(e) =>
                                        setContentFilterText(e.target.value)
                                    }
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </Stack>
                            <Stack
                                gap="5px"
                                style={{
                                    marginLeft: "auto",
                                }}
                            >
                                <Button
                                    type="secondary"
                                    onClick={() => handleSelectAll()}
                                    small
                                    style={{
                                        width: "max-content",
                                    }}
                                >
                                    Select {contentFilterText ? "Shown" : "All"}
                                </Button>
                                <Button
                                    type="secondary"
                                    onClick={() => handleDeselectAll()}
                                    small
                                    style={{
                                        width: "max-content",
                                    }}
                                >
                                    Deselect{" "}
                                    {contentFilterText ? "Shown" : "All"}
                                </Button>
                            </Stack>
                        </Stack>
                        <div className="multi-select">
                            <Stack direction="column" gap="3px">
                                {filteredContent.map(
                                    (adventurePack: string) => (
                                        <Checkbox
                                            checked={ownedContent?.includes(
                                                adventurePack
                                            )}
                                            onChange={(e) =>
                                                handleContentSelection(
                                                    e,
                                                    adventurePack
                                                )
                                            }
                                        >
                                            {adventurePack}
                                        </Checkbox>
                                    )
                                )}
                                {(!filteredContent ||
                                    filteredContent.length === 0) && (
                                    <span>There's nothing here</span>
                                )}
                            </Stack>
                        </div>
                    </Stack>
                    <Spacer size="15px" />
                    <ColoredText color="secondary">
                        Missing content? Other issues? Please{" "}
                        <Link to="/feedback">let me know</Link>.
                    </ColoredText>
                </ContentCluster>
                <ContentCluster title="See Also...">
                    <NavCardCluster>
                        <NavigationCard type="grouping" />
                    </NavCardCluster>
                </ContentCluster>
            </ContentClusterGroup>
        </Page>
    )
}

export default OwnedContent
