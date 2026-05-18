import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
import {
    getRaidTimerSettings,
    setRaidTimerSettings,
} from "../../utils/localStorage.ts"
import TimersHeader from "./TimersHeader.tsx"
import CharacterTimersList from "./CharacterTimersList.tsx"
import DeleteTimerModal from "./DeleteTimerModal.tsx"
import Spacer from "../global/Spacer.tsx"
import FauxLink from "../global/FauxLink.tsx"
import logMessage from "../../utils/logUtils.ts"
import Link from "../global/Link.tsx"
import Stack from "../global/Stack.tsx"
import PageMessage from "../global/PageMessage.tsx"
import Button from "../global/Button.tsx"
import AddTimerModal from "./AddTimerModal.tsx"
import { v4 as uuid } from "uuid"
import type { CustomRaidTimer } from "../../models/RaidTimers.ts"
import {
    addCustomTimer,
    getCustomTimers,
    removeCustomTimer,
    setCustomTimers as persistCustomTimers,
} from "../../utils/localStorage.ts"
import useNow from "../../hooks/useNow.ts"
import { RAID_TIMER_MILLIS } from "../../constants/game.ts"

const Timers = () => {
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
    const [customTimers, setCustomTimers] = useState<CustomRaidTimer[]>(() => {
        try {
            return getCustomTimers()
        } catch (e) {
            logMessage("Failed to load custom timers", "error", {
                metadata: { error: e instanceof Error ? e.message : String(e) },
            })
            return []
        }
    })
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const nowTick = useNow(MsFromMinutes(1))
    const { quests } = useQuestContext()
    const [sortCharacterBy, setSortCharacterBy] = useState<{
        type: RaidTimerCharacterSortEnum
        order: string
    }>(() => {
        try {
            const saved = getRaidTimerSettings()
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
        { characterId: number; timestamp: string; id?: string }[]
    >(() => {
        try {
            return getRaidTimerSettings()?.hiddenTimers || []
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
        setRaidTimerSettings({
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

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
    const [selectedTimer, setSelectedTimer] = useState<QuestInstances | null>(
        null
    )
    const [selectedCharacterId, setSelectedCharacterId] = useState<
        number | null
    >(null)
    const [isAddTimerModalOpen, setIsAddTimerModalOpen] = useState(false)

    const pruneExpiredCustomTimers = useCallback(
        (timers: CustomRaidTimer[], nowMillis: number) => {
            return timers.filter((timer) => {
                const completedAtMillis = new Date(timer.completedAt).getTime()
                if (Number.isNaN(completedAtMillis)) {
                    return false
                }
                return completedAtMillis + RAID_TIMER_MILLIS > nowMillis
            })
        },
        []
    )

    useEffect(() => {
        if (!customTimers.length) return
        const nextCustomTimers = pruneExpiredCustomTimers(customTimers, nowTick)
        if (nextCustomTimers.length === customTimers.length) return

        setCustomTimers(nextCustomTimers)
        persistCustomTimers(nextCustomTimers)
        logMessage("Pruned expired custom timers", "info", {
            metadata: {
                previousCount: customTimers.length,
                nextCount: nextCustomTimers.length,
                removedCount: customTimers.length - nextCustomTimers.length,
            },
        })
    }, [customTimers, nowTick, pruneExpiredCustomTimers])

    const mergedCharacterTimers = useMemo(() => {
        const merged = Object.entries(characterTimers || {}).reduce(
            (acc, [characterId, timers]) => {
                acc[Number(characterId)] = [...timers]
                return acc
            },
            {} as Record<number, QuestInstances[]>
        )

        for (const timer of customTimers) {
            if (!merged[timer.characterId]) {
                merged[timer.characterId] = []
            }
            merged[timer.characterId].push({
                timestamp: timer.completedAt,
                quest_ids: timer.questIds,
                id: timer.id,
                isUserDefined: true,
            })
        }

        return merged
    }, [characterTimers, customTimers])

    const onConfirmDelete = useCallback(
        ({
            characterId,
            timestamp,
            id,
            isUserDefined,
        }: {
            characterId: number
            timestamp: string
            id?: string
            isUserDefined?: boolean
        }) => {
            if (isUserDefined && id) {
                const timerToRemove = customTimers.find((t) => t.id === id)
                if (timerToRemove) {
                    removeCustomTimer(timerToRemove)
                    setCustomTimers((prev) => prev.filter((t) => t.id !== id))
                }
            } else {
                setHiddenTimers((prev) =>
                    prev.concat([{ characterId, timestamp, id }])
                )
            }
        },
        [customTimers]
    )

    const onCreateCustomTimer = useCallback(
        (timer: {
            characterId: number
            questIds: number[]
            questName: string
            completedAt: string
        }) => {
            const nextTimer: CustomRaidTimer = {
                id: uuid(),
                createdAt: new Date().toISOString(),
                ...timer,
            }
            addCustomTimer(nextTimer)
            setCustomTimers((prev) => prev.concat([nextTimer]))
            setIsAddTimerModalOpen(false)
            logMessage("Add raid timer", "info", {
                action: "click",
                metadata: {
                    characterId: timer.characterId,
                    questIds: timer.questIds,
                    completedAt: timer.completedAt,
                },
            })
        },
        []
    )

    // TODO: Temp, remove
    const downtimeExpires = new Date((1778878800 + 66 * 60 * 60) * 1000)
    const shouldShowMessage = new Date() < downtimeExpires

    return (
        <Page
            title="Raid and Quest Timers"
            description="View your raid and quest timers. See which raids you're on timer for and which quests you've ransacked."
            pageMessages={
                shouldShowMessage && (
                    <PageMessage
                        type="warning"
                        title="DDO Audit Downtime"
                        message="DDO Audit was offline Friday, May 15 from 6:30 am until 12:30 pm (PT). If you ran a raid during that time, it won't be tracked below. You can add raid timers manually with the 'Add a timer' button."
                    />
                )
            }
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
            <AddTimerModal
                isOpen={isAddTimerModalOpen}
                registeredCharacters={registeredCharacters}
                quests={quests}
                onSave={onCreateCustomTimer}
                onClose={() => setIsAddTimerModalOpen(false)}
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
                                characterTimers={mergedCharacterTimers}
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
                                            id: timer.id,
                                            isUserDefined: timer.isUserDefined,
                                        },
                                        action: "click",
                                    })
                                }}
                                sortValue={sortCharacterBy}
                                sortOnChange={setSortCharacterBy}
                            />
                        )}
                    </>
                    <Spacer size="20px" />
                    <Button
                        type="secondary"
                        onClick={() => setIsAddTimerModalOpen(true)}
                    >
                        Add a timer
                    </Button>
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
