import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import {
    ErrorGettingRegisteredCharacters,
    NoRegisteredCharacters,
} from "../global/CommonMessages.tsx"
import Link from "../global/Link.tsx"
import useGetCharacterTimers, {
    QuestInstances,
} from "../../hooks/useGetCharacterTimers.ts"
import {
    convertMillisecondsToPrettyString,
    pluralize,
} from "../../utils/stringUtils.ts"
import NavigationCard from "../global/NavigationCard.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import { useQuestContext } from "../../contexts/QuestContext.tsx"
import { useAreaContext } from "../../contexts/AreaContext.tsx"
import PageMessage from "../global/PageMessage.tsx"
import Button from "../global/Button.tsx"
import Stack from "../global/Stack.tsx"
import { RAID_TIMER_MILLIS } from "../../constants/game.ts"
import ColoredText from "../global/ColoredText.tsx"
import { ReactComponent as Delete } from "../../assets/svg/delete.svg"
import "./Timers.css"
import { MsFromHours } from "../../utils/timeUtils.ts"

const Timers = () => {
    const { registeredCharacters, verifiedCharacters, isLoaded, isError } =
        useGetRegisteredCharacters()
    const { characterTimers } = useGetCharacterTimers({ registeredCharacters })
    const { quests, reloadQuests } = useQuestContext()
    const { areas, reloadAreas } = useAreaContext()

    const getQuestById = (id: number) => {
        return quests ? quests[id] : undefined
    }

    const getContentHeader = () => {
        if (isError) {
            return <ErrorGettingRegisteredCharacters />
        }

        if (!isLoaded) {
            return <p>Loading...</p>
        }

        if (registeredCharacters.length === 0) {
            return <NoRegisteredCharacters />
        }

        return <></>
    }

    const getRemainingTime = (timestamp: string) => {
        const time = new Date(timestamp).getTime()
        const remainingMillis = RAID_TIMER_MILLIS - (Date.now() - time)
        return remainingMillis
    }

    const getRaidActivityTable = (entries: QuestInstances[]) => {
        if (entries.length === 0) {
            return (
                <ColoredText color="secondary">
                    No raid timers to show
                </ColoredText>
            )
        }

        return (
            <table className="raid-activity-table">
                <thead>
                    <tr>
                        <th>Completed At</th>
                        <th>Raids</th>
                        <th>Remaining Time</th>
                        <th>Off Timer At</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry, index) => {
                        const quests = entry.quest_ids
                            .map((id) => getQuestById(id))
                            .filter((q) => q !== undefined)
                        let questNames = quests[0].name
                        if (quests.length > 1) {
                            questNames += ` (or ${quests
                                .splice(1)
                                .map((q) => q.name)
                                .join(", ")})`
                        }
                        const timestamp = new Date(entry.timestamp).getTime()
                        const remainingMiliseconds = getRemainingTime(
                            entry.timestamp
                        )
                        const remainingTime = Math.max(remainingMiliseconds, 0)
                        const offTimerAt = new Date(
                            timestamp + RAID_TIMER_MILLIS
                        ).toLocaleString()

                        return (
                            <tr key={index}>
                                <td>
                                    {new Date(entry.timestamp).toLocaleString()}
                                </td>
                                <td>
                                    {remainingTime > 0 ? (
                                        questNames
                                    ) : (
                                        <s>{questNames}</s>
                                    )}
                                </td>
                                {remainingTime === 0 && (
                                    <td colSpan={3}>Recently off timer</td>
                                )}
                                {remainingTime > 0 && (
                                    <td>
                                        {convertMillisecondsToPrettyString(
                                            remainingTime,
                                            true,
                                            true
                                        )}
                                    </td>
                                )}
                                {remainingTime > 0 && <td>{offTimerAt}</td>}
                                {remainingTime > 0 && (
                                    <td>
                                        <Delete
                                            className="clickable-icon"
                                            onClick={() => {}}
                                        />
                                    </td>
                                )}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        )
    }

    const conditionalTimerContent = () => {
        if (registeredCharacters.length === 0) {
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
        }

        if (!characterTimers || characterTimers.length === 0) {
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
                    <span>No timers to show!</span>
                </div>
            )
        }

        return (
            <Stack direction="column" gap="20px" fullWidth>
                {characterTimers
                    .sort(
                        (a, b) =>
                            b.raidActivity?.length - a.raidActivity?.length
                    )
                    .map((timer) => (
                        <div style={{ width: "100%" }} key={timer.character.id}>
                            <h3>{timer.character.name}</h3>
                            {getRaidActivityTable(
                                timer.raidActivity?.filter(
                                    (activity) =>
                                        getRemainingTime(activity.timestamp) +
                                            MsFromHours(1) >
                                        0
                                )
                            )}
                        </div>
                    ))}
            </Stack>
        )
    }

    const noQuestsPageMessage = () => {
        if (!quests || Object.entries(quests).length === 0) {
            return (
                <PageMessage
                    title="No Quests Found"
                    type="warning"
                    message={
                        <Stack direction="column" gap="10px">
                            <span>
                                You probably just need to fetch the quests from
                                the server again.
                            </span>
                            <Button
                                type="primary"
                                onClick={() => reloadQuests()}
                            >
                                Fetch Quests
                            </Button>
                        </Stack>
                    }
                />
            )
        }
    }

    const noAreasPageMessage = () => {
        if (!areas || Object.entries(areas).length === 0) {
            return (
                <PageMessage
                    title="No Areas Found"
                    type="warning"
                    message={
                        <Stack direction="column" gap="10px">
                            <span>
                                You probably just need to fetch the areas from
                                the server again.
                            </span>
                            <Button
                                type="primary"
                                onClick={() => reloadAreas()}
                            >
                                Fetch Areas
                            </Button>
                        </Stack>
                    }
                />
            )
        }
    }

    return (
        <Page
            title="Raid and Quest Timers"
            description="View your raid and quest timers. See which raids you're on timer for and which quests you've ransacked."
        >
            {noQuestsPageMessage()}
            {noAreasPageMessage()}
            <ContentClusterGroup>
                <ContentCluster title="Timers">
                    {getContentHeader()}
                    {conditionalTimerContent()}
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

export default Timers
