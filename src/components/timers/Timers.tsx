import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Page from "../global/Page.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import useGetRegisteredCharacters from "../../hooks/useGetRegisteredCharacters.ts"
import useGetCharacterTimers, {
    QuestInstances,
} from "../../hooks/useGetCharacterTimers.ts"
import NavigationCard from "../global/NavigationCard.tsx"
import NavCardCluster from "../global/NavCardCluster.tsx"
import { useQuestContext } from "../../contexts/QuestContext.tsx"
import LfmSprite from "../../assets/png/lfm_sprite_6.webp"
import { RaidTimerCharacterSortEnum } from "../../models/Common.ts"
import { MsFromMinutes, MsFromSeconds } from "../../utils/timeUtils.ts"
import { getData, setData } from "../../utils/localStorage.ts"
import TimersHeader from "./TimersHeader.tsx"
import TimerSortControls from "./TimerSortControls.tsx"
import CharacterTimersList from "./CharacterTimersList.tsx"
import DeleteTimerModal from "./DeleteTimerModal.tsx"
import Spacer from "../global/Spacer.tsx"
import FauxLink from "../global/FauxLink.tsx"
import logMessage from "../../utils/logUtils.ts"
import Link from "../global/Link.tsx"
import Stack from "../global/Stack.tsx"

interface TimerStorage {
    sortType: RaidTimerCharacterSortEnum
    sortOrder: string
    hiddenTimers?: {
        characterId: number
        timestamp: string
    }[]
}

const Timers = () => {
    const timerStorageKey = "timer-settings"
    const {
        registeredCharacters,
        isLoaded,
        isError,
        reload: reloadRegisteredCharacters,
    } = useGetRegisteredCharacters()
    const {
        characterTimers,
        isLoading,
        reload: reloadCharacterTimers,
    } = useGetCharacterTimers({
        registeredCharacters,
    })
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const { quests } = useQuestContext()
    const [sortCharacterBy, setSortCharacterBy] = useState<{
        type: RaidTimerCharacterSortEnum
        order: string
    }>(() => {
        try {
            const saved = getData<TimerStorage>(timerStorageKey)
            return saved
                ? {
                      type: saved.sortType as RaidTimerCharacterSortEnum,
                      order: saved.sortOrder,
                  }
                : {
                      type: RaidTimerCharacterSortEnum.RECENT_RAID,
                      order: "asc",
                  }
        } catch (e) {
            logMessage("Failed to load timer settings (sort)", "error", {
                metadata: { error: e instanceof Error ? e.message : String(e) },
            })
            return {
                type: RaidTimerCharacterSortEnum.RECENT_RAID,
                order: "asc",
            }
        }
    })
    const [initialCharacterLoadDone, setInitialCharacterLoadDone] =
        useState<boolean>(false)
    const [initialTimerLoadDone, setInitialTimerLoadDone] =
        useState<boolean>(false)
    const [hiddenTimers, setHiddenTimers] = useState<
        { characterId: number; timestamp: string }[]
    >(() => {
        try {
            return getData<TimerStorage>(timerStorageKey)?.hiddenTimers || []
        } catch (e) {
            logMessage(
                "Failed to load timer settings (hiddenTimers)",
                "error",
                {
                    metadata: {
                        error: e instanceof Error ? e.message : String(e),
                    },
                }
            )
            return []
        }
    })
    const hasMountedRef = useRef(false)

    // Save settings
    useEffect(() => {
        // Skip saving on initial mount to avoid writing defaults back immediately
        if (!hasMountedRef.current) {
            hasMountedRef.current = true
            return
        }
        setData<TimerStorage>(timerStorageKey, {
            sortType: sortCharacterBy.type,
            sortOrder: sortCharacterBy.order,
            hiddenTimers,
        })
    }, [sortCharacterBy, hiddenTimers])

    useEffect(() => {
        const interval = setInterval(() => {
            reloadRegisteredCharacters()
        }, MsFromMinutes(1))
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const anyOnline = registeredCharacters.some(
            (char) => char.is_online === true
        )
        if (!anyOnline) return
        const interval = setInterval(() => {
            reloadCharacterTimers()
        }, MsFromSeconds(30))
        return () => clearInterval(interval)
    }, [registeredCharacters])

    useEffect(() => {
        if (!isLoading) {
            setInitialTimerLoadDone(true)
        }
    }, [isLoading])

    useEffect(() => {
        if (isLoaded) {
            setInitialCharacterLoadDone(true)
        }
    }, [isLoaded])

    useEffect(() => {
        const img = new Image()
        img.src = LfmSprite
        img.onload = () => {
            setImage(img)
        }
    }, [])

    const sortAndFilterContent = () => (
        <TimerSortControls
            value={sortCharacterBy}
            onChange={setSortCharacterBy}
        />
    )

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
    const [selectedTimer, setSelectedTimer] = useState<QuestInstances | null>(
        null
    )
    const [selectedCharacterId, setSelectedCharacterId] = useState<
        number | null
    >(null)

    const onConfirmDelete = useCallback(
        ({
            characterId,
            timestamp,
        }: {
            characterId: number
            timestamp: string
        }) => {
            setHiddenTimers((prev) => prev.concat([{ characterId, timestamp }]))
        },
        []
    )

    return (
        <Page
            title="Raid and Quest Timers"
            description="View your raid and quest timers. See which raids you're on timer for and which quests you've ransacked."
        >
            <DeleteTimerModal
                isOpen={isDeleteModalOpen}
                character={
                    registeredCharacters.find(
                        (c) => c.id === selectedCharacterId
                    ) || null
                }
                timer={selectedTimer}
                quests={quests}
                onConfirm={onConfirmDelete}
                onClose={() => setIsDeleteModalOpen(false)}
            />
            <ContentClusterGroup>
                <ContentCluster title="Timers">
                    <TimersHeader
                        isError={isError}
                        isLoaded={isLoaded}
                        initialCharacterLoadDone={initialCharacterLoadDone}
                        registeredCharactersCount={registeredCharacters.length}
                    />
                    <>
                        {sortAndFilterContent()}
                        {isLoading && !initialTimerLoadDone ? (
                            <div
                                style={{
                                    width: "100%",
                                    height: "10vh",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <span>Loading timers...</span>
                            </div>
                        ) : (
                            <CharacterTimersList
                                registeredCharacters={registeredCharacters}
                                characterTimers={characterTimers}
                                sortCharacterBy={sortCharacterBy}
                                hiddenTimers={hiddenTimers}
                                quests={quests}
                                image={image}
                                onDeleteClick={(characterId, timer) => {
                                    setSelectedCharacterId(characterId)
                                    setSelectedTimer(timer)
                                    setIsDeleteModalOpen(true)
                                    logMessage("Delete raid timer", "info", {
                                        metadata: {
                                            characterId,
                                            timestamp: timer.timestamp,
                                            questIds: timer.quest_ids,
                                        },
                                        action: "click",
                                    })
                                }}
                            />
                        )}
                    </>
                    <Spacer size="20px" />
                    <Stack
                        direction="row"
                        gap="5px"
                        style={{ justifyContent: "space-between" }}
                    >
                        <Link
                            to="/feedback"
                            style={{ color: "var(--secondary-text)" }}
                        >
                            Report a problem
                        </Link>
                        {hiddenTimers && hiddenTimers.length > 0 && (
                            <FauxLink
                                onClick={() => {
                                    setHiddenTimers([])
                                    logMessage(
                                        "Restore deleted timers",
                                        "info",
                                        {
                                            action: "click",
                                        }
                                    )
                                }}
                                style={{
                                    color: "var(--secondary-text)",
                                    textAlign: "right",
                                }}
                            >
                                Restore deleted timers
                            </FauxLink>
                        )}
                    </Stack>
                </ContentCluster>
                <ContentCluster title="About this Feature">
                    <p>
                        DDO Audit tracks your character's questing activity to
                        determine when you've entered or completed a raid quest.
                        This approach comes with the following caveats:
                    </p>
                    <ul>
                        <li>
                            The raid timers displayed here start the moment your
                            character leaves a raid, regardless of whether you
                            have turned in the quest.
                        </li>
                        <li>
                            DDO Audit has no way of knowing when you use a Raid
                            Timer Bypass Hourglass to reset a raid timer. You
                            can manually clear a raid timer by clicking the
                            "Delete" button next to the timer.
                        </li>
                        <li>
                            It's difficult to differentiate between the Heroic
                            and Epic versions of certain raids. In such cases,
                            both versions of the raid will be displayed with the
                            same timer.
                        </li>
                    </ul>
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
