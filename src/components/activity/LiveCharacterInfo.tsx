import { useAreaContext } from "../../contexts/AreaContext"
import { useQuestContext } from "../../contexts/QuestContext"
import { Character } from "../../models/Character"
import { Quest } from "../../models/Lfm"
import { mapClassesToString } from "../../utils/stringUtils"
import ColoredText from "../global/ColoredText"
import ExpandableContainer from "../global/ExpandableContainer"
import Stack from "../global/Stack"
import WebLink from "../global/WebLink"
import { ReactComponent as OpenInNew } from "../../assets/svg/open-in-new.svg"
import CharacterTable, {
    CharacterTableRow,
    ColumnType,
} from "../tables/CharacterTable"
import { useMemo, useState } from "react"
import Checkbox from "../global/Checkbox"
import useBooleanFlag from "../../hooks/useBooleanFlags"
import { BOOLEAN_FLAGS } from "../../utils/localStorage"

interface Props {
    characterData: Character | null
    groupMembers: Character[]
}

const LiveCharacterInfo = ({ characterData, groupMembers }: Props) => {
    const { quests } = useQuestContext()
    const { areas } = useAreaContext()
    const [hideSelfFromPartyList, setHideSelfFromPartyList] = useBooleanFlag(
        BOOLEAN_FLAGS.hideSelfFromPartyList,
        false
    )

    const getQuestFromAreaId = (areaId: number): Quest | undefined => {
        return Object.values(quests).find((quest) => quest.area_id === areaId)
    }

    const wikiLinkFromText = (text: string) => {
        return (
            <WebLink
                href={`https://ddowiki.com/page/${encodeURIComponent(text)}`}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                }}
            >
                {text}
                <OpenInNew
                    style={{
                        width: "1rem",
                        height: "1rem",
                        flexShrink: 0,
                    }}
                />
            </WebLink>
        )
    }

    const buildLabeledField = (
        label: string,
        value: string,
        wikiLink: boolean = false
    ) => {
        return (
            <Stack direction="column" gap="2px">
                <ColoredText style={{ fontWeight: "bold" }} color="secondary">
                    {label}
                </ColoredText>
                {!wikiLink && <div>{value}</div>}
                {wikiLink && wikiLinkFromText(value)}
            </Stack>
        )
    }

    const groupMemberRows: CharacterTableRow[] = useMemo(() => {
        return groupMembers.map((member) => ({
            character: member,
            actions: null,
        }))
    }, [groupMembers])

    const partyQuestMessage = () => {
        const locationCount: { [key: number]: number } = {}
        groupMembers.forEach((member) => {
            if (member.location_id) {
                if (!locationCount[member.location_id]) {
                    locationCount[member.location_id] = 0
                }
                locationCount[member.location_id] += 1
            }
        })
        const sortedQuests = Object.entries(locationCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            ?.map(([locId]) => getQuestFromAreaId(parseInt(locId))?.name)
            ?.filter((name) => name) as string[]
        if (sortedQuests.length === 0) return null
        if (
            sortedQuests.length === 1 &&
            Object.values(locationCount).length === 1
        ) {
            return (
                <span>
                    All party members are currently in{" "}
                    {wikiLinkFromText(sortedQuests[0])}
                </span>
            )
        }
        if (sortedQuests.length === 1) {
            return (
                <span>
                    Some party members are currently in{" "}
                    {wikiLinkFromText(sortedQuests[0])}
                </span>
            )
        }
        return (
            <span>
                Most party members are currently in{" "}
                {wikiLinkFromText(sortedQuests[0])}, and some are in{" "}
                {wikiLinkFromText(sortedQuests[1])}
            </span>
        )
    }

    return (
        <ExpandableContainer title="Live Character Info" defaultState={true}>
            <Stack direction="column" gap="10px">
                <Stack
                    direction="row"
                    gap="30px"
                    style={{ rowGap: "10px" }}
                    wrap
                >
                    {buildLabeledField(
                        "Character Name",
                        characterData?.name || "N/A"
                    )}
                    {buildLabeledField(
                        "Level",
                        characterData?.total_level.toString() || "N/A"
                    )}
                    {buildLabeledField(
                        "Class",
                        mapClassesToString(characterData?.classes) || "N/A"
                    )}
                    {buildLabeledField(
                        "Server",
                        characterData?.server_name || "N/A"
                    )}
                    {buildLabeledField(
                        "In Party",
                        characterData?.group_id ? "Yes" : "No"
                    )}
                    {buildLabeledField(
                        "Current Area",
                        areas[characterData?.location_id || 0]
                            ? areas[characterData?.location_id || 0].name
                            : "N/A",
                        true
                    )}
                    {buildLabeledField(
                        "Current Quest",
                        getQuestFromAreaId(characterData?.location_id || 0)
                            ?.name || "N/A",
                        !!getQuestFromAreaId(characterData?.location_id || 0)
                            ?.name
                    )}
                </Stack>
                <CharacterTable
                    characterRows={groupMemberRows.filter(
                        (row) =>
                            row.character.id !== characterData?.id ||
                            !hideSelfFromPartyList
                    )}
                    isLoaded
                    showAnonymous
                    noCharactersMessage={<span>No party members</span>}
                    visibleColumns={[
                        ColumnType.NAME,
                        ColumnType.GUILD,
                        ColumnType.LEVEL,
                        ColumnType.CLASSES,
                        ColumnType.LOCATION,
                    ]}
                    enableWikiLinks
                />
                <Stack
                    direction="row"
                    gap="20px"
                    align="center"
                    style={{ width: "100%" }}
                    wrap
                >
                    {partyQuestMessage()}
                    <Checkbox
                        checked={hideSelfFromPartyList}
                        onChange={(e) =>
                            setHideSelfFromPartyList(e.target.checked)
                        }
                        style={{
                            marginLeft: "auto",
                            fontSize: "0.8rem",
                        }}
                    >
                        Hide self
                    </Checkbox>
                </Stack>
            </Stack>
        </ExpandableContainer>
    )
}

export default LiveCharacterInfo
