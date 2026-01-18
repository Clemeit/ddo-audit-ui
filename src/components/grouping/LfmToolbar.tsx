import "./LfmToolbar.css"
import Link from "../global/Link.tsx"
import { useAppContext } from "../../contexts/AppContext.tsx"
import Modal from "../modal/Modal.tsx"
import Stack from "../global/Stack.tsx"
import { useLfmContext } from "../../contexts/LfmContext.tsx"
import {
    DEFAULT_BASE_FONT_SIZE,
    DEFAULT_MOUSE_OVER_DELAY,
    MAXIMUM_MOUSE_OVER_DELAY,
    MINIMUM_MOUSE_OVER_DELAY,
} from "../../constants/lfmPanel.ts"
import Button from "../global/Button.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import { Character } from "../../models/Character.ts"
import YesNoModal from "../modal/YesNoModal.tsx"
import Checkbox from "../global/Checkbox.tsx"
import { useModalNavigation } from "../../hooks/useModalNavigation.ts"
import GenericToolbar from "../global/GenericToolbar.tsx"
import RadioButton from "../global/RadioButton.tsx"
import Spacer from "../global/Spacer.tsx"
import FeaturedItem from "../global/FeaturedItem.tsx"
import { MAX_LEVEL } from "../../constants/game.ts"
import { useQuestContext } from "../../contexts/QuestContext.tsx"
import { useAreaContext } from "../../contexts/AreaContext.tsx"

interface Props {
    reloadLfms: () => void
    serverName: string
    isSecondaryPanel?: boolean
    handleClosePanel?: () => void
    handleScreenshot?: () => void
    characterCount?: number
}

const LfmToolbar = ({
    reloadLfms,
    serverName,
    isSecondaryPanel,
    handleClosePanel = () => {},
    handleScreenshot = () => {},
    characterCount,
}: Props) => {
    const {
        minLevel,
        setMinLevel,
        maxLevel,
        setMaxLevel,
        filterByMyCharacters,
        setFilterByMyCharacters,
        showNotEligible,
        setShowNotEligible,
        fontSize,
        setFontSize,
        panelWidth,
        showRaidTimerIndicator,
        setShowRaidTimerIndicator,
        showMemberCount,
        setShowMemberCount,
        showQuestGuesses,
        setShowQuestGuesses,
        showQuestTips,
        setShowQuestTips,
        showCharacterGuildNames,
        setShowCharacterGuildNames,
        registeredCharacters,
        trackedCharacterIds,
        setTrackedCharacterIds,
        showLfmPostedTime,
        setShowLfmPostedTime,
        showQuestMetrics,
        setShowQuestMetrics,
        reloadRegisteredCharacters,
        resetDisplaySettings,
        resetFilterSettings,
        resetToolSettings,
        mouseOverDelay,
        setMouseOverDelay,
        showLfmActivity,
        setShowLfmActivity,
        isMultiColumn,
        setIsMultiColumn,
        showEligibleCharacters,
        setShowEligibleCharacters,
        hideGroupsPostedByIgnoredCharacters,
        setHideGroupsPostedByIgnoredCharacters,
        hideGroupsContainingIgnoredCharacters,
        setHideGroupsContainingIgnoredCharacters,
        showIndicationForGroupsPostedByFriends,
        setShowIndicationForGroupsPostedByFriends,
        showIndicationForGroupsContainingFriends,
        setShowIndicationForGroupsContainingFriends,
        highlightRaids,
        setHighlightRaids,
        hideAllLevelGroups,
        setHideAllLevelGroups,
        showEligibilityDividers,
        setShowEligibilityDividers,
        onlyShowRaids,
        setOnlyShowRaids,
        hideContentIDontOwn,
        setHideContentIDontOwn,
        indicateContentIDontOwn,
        setIndicateContentIDontOwn,
        hideFullGroups,
        setHideFullGroups,
    } = useLfmContext()
    const { reloadQuests } = useQuestContext()
    const { reloadAreas } = useAreaContext()
    const { isFullScreen, setIsFullScreen } = useAppContext()
    const {
        isModalOpen: showSettingsModal,
        openModal: handleOpenSettingsModal,
        closeModal: handleCloseSettingsModal,
    } = useModalNavigation({ modalKey: "lfm-settings" })
    const {
        isModalOpen: showResetFiltersModal,
        openModal: handleOpenResetFiltersModal,
        closeModal: handleCloseResetFiltersModal,
    } = useModalNavigation({ modalKey: "reset-filters" })
    const {
        isModalOpen: showResetDisplayModal,
        openModal: handleOpenResetDisplayModal,
        closeModal: handleCloseResetDisplayModal,
    } = useModalNavigation({ modalKey: "reset-display" })
    const {
        isModalOpen: showResetToolsModal,
        openModal: handleOpenResetToolsModal,
        closeModal: handleCloseResetToolsModal,
    } = useModalNavigation({ modalKey: "reset-tools" })

    const resetFilterSettingsModal = (
        <YesNoModal
            title="Reset Filters"
            text="This will reset all filter settings to their default values. Your registered characters will not be affected."
            onYes={() => {
                resetFilterSettings()
                handleCloseResetFiltersModal()
            }}
            onNo={handleCloseResetFiltersModal}
            fullScreenOnMobile
        />
    )

    const resetDisplaySettingsModal = (
        <YesNoModal
            title="Reset Display"
            text="This will reset all display settings to their default values."
            onYes={() => {
                resetDisplaySettings()
                handleCloseResetDisplayModal()
            }}
            onNo={handleCloseResetDisplayModal}
            fullScreenOnMobile
        />
    )

    const resetToolSettingsModal = (
        <YesNoModal
            title="Reset Tools"
            text="This will reset all tool settings to their default values."
            onYes={() => {
                resetToolSettings()
                handleCloseResetToolsModal()
            }}
            onNo={handleCloseResetToolsModal}
            fullScreenOnMobile
        />
    )

    const settingModalContent = (
        <ContentClusterGroup flavor="compact">
            <ContentCluster title="Filters">
                <Stack direction="column" gap="10px">
                    <RadioButton
                        checked={!filterByMyCharacters}
                        onChange={() => setFilterByMyCharacters(false)}
                    >
                        Filter by level range
                    </RadioButton>
                    {!filterByMyCharacters && (
                        <div className="filter-section">
                            <Stack direction="column" gap="10px">
                                <span>Level range:</span>
                                <Stack>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        style={{ width: "100px" }}
                                        value={minLevel}
                                        onChange={(e) =>
                                            setMinLevel(
                                                parseInt(e.target.value)
                                            )
                                        }
                                        min={1}
                                        max={MAX_LEVEL}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        style={{ width: "100px" }}
                                        value={maxLevel}
                                        onChange={(e) =>
                                            setMaxLevel(
                                                parseInt(e.target.value)
                                            )
                                        }
                                        min={1}
                                        max={MAX_LEVEL}
                                    />
                                </Stack>
                            </Stack>
                        </div>
                    )}
                    <RadioButton
                        checked={filterByMyCharacters}
                        onChange={() => setFilterByMyCharacters(true)}
                    >
                        Filter based on my registered characters
                    </RadioButton>
                    {filterByMyCharacters && (
                        <div className="filter-section multi-select">
                            <Stack direction="column" gap="10px">
                                {registeredCharacters &&
                                    registeredCharacters
                                        .sort((a, b) =>
                                            (a.name || "").localeCompare(
                                                b.name || ""
                                            )
                                        )
                                        .map((character: Character) => (
                                            <Checkbox
                                                key={character.id.toString()}
                                                checked={trackedCharacterIds.includes(
                                                    character.id
                                                )}
                                                onChange={(e) =>
                                                    setTrackedCharacterIds(
                                                        e.target.checked
                                                            ? [
                                                                  ...trackedCharacterIds,
                                                                  character.id,
                                                              ]
                                                            : trackedCharacterIds.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      character.id
                                                              )
                                                    )
                                                }
                                            >
                                                {character.name} |{" "}
                                                {character.total_level} |{" "}
                                                {character.server_name}
                                            </Checkbox>
                                        ))}
                                <Link to="/registration" className="link">
                                    Register more
                                </Link>
                            </Stack>
                        </div>
                    )}
                    <Checkbox
                        checked={showNotEligible}
                        onChange={(e) => setShowNotEligible(e.target.checked)}
                    >
                        Show groups I'm not eligible for
                    </Checkbox>
                    <FeaturedItem calloutId="hide-content-i-dont-own">
                        <Checkbox
                            checked={hideContentIDontOwn}
                            onChange={(e) =>
                                setHideContentIDontOwn(e.target.checked)
                            }
                        >
                            Hide content I don't own
                        </Checkbox>
                    </FeaturedItem>
                    <FeaturedItem calloutId="indicate-content-i-dont-own">
                        <Checkbox
                            checked={indicateContentIDontOwn}
                            onChange={(e) =>
                                setIndicateContentIDontOwn(e.target.checked)
                            }
                        >
                            Indicate content I don't own
                        </Checkbox>
                    </FeaturedItem>
                    <div
                        style={{
                            marginLeft: "20px",
                        }}
                    >
                        <Link to="/owned-content">Content list</Link>
                    </div>
                    <Stack width="100%" justify="flex-end">
                        <Button
                            onClick={handleOpenResetFiltersModal}
                            type="tertiary"
                            className="critical"
                        >
                            Reset all
                        </Button>
                    </Stack>
                </Stack>
            </ContentCluster>
            <ContentCluster title="Display">
                <Stack direction="column" gap="10px">
                    <label htmlFor="fontSizeSlider">
                        Font size: {fontSize.toString()}px
                        {fontSize === DEFAULT_BASE_FONT_SIZE && (
                            <span className="secondary-text"> (default)</span>
                        )}
                    </label>
                    <input
                        id="fontSizeSlider"
                        type="range"
                        min={10}
                        max={20}
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                    />
                    <label htmlFor="overlayPopupDelaySlider">
                        Overlay popup delay:{" "}
                        {(mouseOverDelay / 1000).toString()}s
                        {mouseOverDelay === DEFAULT_MOUSE_OVER_DELAY && (
                            <span className="secondary-text"> (default)</span>
                        )}
                    </label>
                    <input
                        id="overlayPopupDelaySlider"
                        type="range"
                        min={MINIMUM_MOUSE_OVER_DELAY}
                        max={MAXIMUM_MOUSE_OVER_DELAY}
                        step={50}
                        value={mouseOverDelay}
                        onChange={(e) =>
                            setMouseOverDelay(parseInt(e.target.value))
                        }
                    />
                    {/* <Checkbox
                            checked={showBoundingBoxes}
                            onChange={(e) =>
                                setShowBoundingBoxes(e.target.checked)
                            }
                        >
                            Show bounding boxes
                        </Checkbox> */}
                    {/* <Checkbox
                        checked={isDynamicWidth}
                        onChange={(e) => setIsDynamicWidth(e.target.checked)}
                    >
                        Dynamic width
                    </Checkbox> */}
                    <Checkbox
                        checked={isFullScreen}
                        onChange={(e) => setIsFullScreen(e.target.checked)}
                    >
                        Fullscreen
                    </Checkbox>
                    <Checkbox
                        checked={isMultiColumn}
                        onChange={(e) => setIsMultiColumn(e.target.checked)}
                    >
                        Show raid group members in two columns
                    </Checkbox>
                    <FeaturedItem calloutId="highlight-raids">
                        <Checkbox
                            checked={highlightRaids}
                            onChange={(e) =>
                                setHighlightRaids(e.target.checked)
                            }
                        >
                            Highlight raid groups
                        </Checkbox>
                    </FeaturedItem>
                    <FeaturedItem calloutId="hide-all-level-groups">
                        <Checkbox
                            checked={hideAllLevelGroups}
                            onChange={(e) =>
                                setHideAllLevelGroups(e.target.checked)
                            }
                        >
                            Hide groups posting for levels 1-34
                        </Checkbox>
                    </FeaturedItem>
                    <FeaturedItem calloutId="hide-full-groups">
                        <Checkbox
                            checked={hideFullGroups}
                            onChange={(e) =>
                                setHideFullGroups(e.target.checked)
                            }
                        >
                            Hide groups that are likely full
                        </Checkbox>
                    </FeaturedItem>
                    <FeaturedItem calloutId="grouping-eligibility-dividers">
                        <Checkbox
                            checked={showEligibilityDividers}
                            onChange={(e) =>
                                setShowEligibilityDividers(e.target.checked)
                            }
                        >
                            Show dividers between eligible groups
                        </Checkbox>
                    </FeaturedItem>
                    <FeaturedItem calloutId="only-show-raid-groups">
                        <Checkbox
                            checked={onlyShowRaids}
                            onChange={(e) => setOnlyShowRaids(e.target.checked)}
                        >
                            Only show raid groups
                        </Checkbox>
                    </FeaturedItem>
                    <Stack width="100%" justify="flex-end">
                        <Button
                            onClick={handleOpenResetDisplayModal}
                            type="tertiary"
                            className="critical"
                        >
                            Reset all
                        </Button>
                    </Stack>
                </Stack>
            </ContentCluster>
            <ContentCluster title="Social">
                <Stack direction="column" gap="20px">
                    <Stack direction="column" gap="10px">
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
                        <div
                            style={{
                                marginLeft: "20px",
                            }}
                        >
                            <Link to="/friends">Friends list</Link>
                        </div>
                    </Stack>
                    <Stack direction="column" gap="10px">
                        <Checkbox
                            checked={hideGroupsPostedByIgnoredCharacters}
                            onChange={(e) =>
                                setHideGroupsPostedByIgnoredCharacters(
                                    e.target.checked
                                )
                            }
                        >
                            Hide LFMs posted by ignored characters
                        </Checkbox>
                        <Checkbox
                            checked={hideGroupsContainingIgnoredCharacters}
                            onChange={(e) =>
                                setHideGroupsContainingIgnoredCharacters(
                                    e.target.checked
                                )
                            }
                        >
                            Hide LFMs that ignored characters are a part of
                        </Checkbox>
                        <div
                            style={{
                                marginLeft: "20px",
                            }}
                        >
                            <Link to="/ignores">Ignore list</Link>
                        </div>
                    </Stack>
                </Stack>
                <Spacer size="20px" />
            </ContentCluster>
            <ContentCluster title="Tools">
                <Stack direction="column" gap="10px">
                    <Checkbox
                        checked={showRaidTimerIndicator}
                        onChange={(e) =>
                            setShowRaidTimerIndicator(e.target.checked)
                        }
                    >
                        Show raid timer indicator
                    </Checkbox>
                    <Checkbox
                        checked={showMemberCount}
                        onChange={(e) => setShowMemberCount(e.target.checked)}
                    >
                        Show member count
                    </Checkbox>
                    <Checkbox
                        checked={showQuestGuesses}
                        onChange={(e) => setShowQuestGuesses(e.target.checked)}
                    >
                        Show quest guesses
                    </Checkbox>
                    <Checkbox
                        checked={showQuestTips}
                        onChange={(e) => setShowQuestTips(e.target.checked)}
                    >
                        Show quest tips
                    </Checkbox>
                    <Checkbox
                        checked={showCharacterGuildNames}
                        onChange={(e) =>
                            setShowCharacterGuildNames(e.target.checked)
                        }
                    >
                        Show character guild names
                    </Checkbox>
                    <FeaturedItem calloutId="show-eligible-characters">
                        <Checkbox
                            checked={showEligibleCharacters}
                            onChange={(e) =>
                                setShowEligibleCharacters(e.target.checked)
                            }
                        >
                            Show your eligible characters
                        </Checkbox>
                    </FeaturedItem>
                    <FeaturedItem calloutId="show-lfm-activity">
                        <Checkbox
                            checked={showLfmActivity}
                            onChange={(e) =>
                                setShowLfmActivity(e.target.checked)
                            }
                        >
                            Show LFM activity history
                        </Checkbox>
                    </FeaturedItem>
                    <FeaturedItem calloutId="show-lfm-posted-time">
                        <Checkbox
                            checked={showLfmPostedTime}
                            onChange={(e) =>
                                setShowLfmPostedTime(e.target.checked)
                            }
                        >
                            Show LFM posted time
                        </Checkbox>
                    </FeaturedItem>
                    <FeaturedItem calloutId="show-quest-metrics">
                        <Checkbox
                            checked={showQuestMetrics}
                            onChange={(e) =>
                                setShowQuestMetrics(e.target.checked)
                            }
                        >
                            Show quest metrics
                        </Checkbox>
                    </FeaturedItem>
                    <Stack width="100%" justify="flex-end">
                        <Button
                            onClick={handleOpenResetToolsModal}
                            type="tertiary"
                            className="critical"
                        >
                            Reset all
                        </Button>
                    </Stack>
                </Stack>
            </ContentCluster>
            <Link to="/user-settings" className="link">
                Import and export your settings
            </Link>
        </ContentClusterGroup>
    )

    return (
        <>
            {showResetDisplayModal && resetDisplaySettingsModal}
            {showResetFiltersModal && resetFilterSettingsModal}
            {showResetToolsModal && resetToolSettingsModal}
            {showSettingsModal &&
                !showResetDisplayModal &&
                !showResetFiltersModal &&
                !showResetToolsModal && (
                    <Modal
                        onClose={handleCloseSettingsModal}
                        fullScreenOnMobile
                        freezeBodyScroll
                    >
                        {settingModalContent}
                    </Modal>
                )}
            <GenericToolbar
                serverName={serverName}
                handleReload={() => {
                    reloadQuests()
                    reloadAreas()
                    reloadRegisteredCharacters()
                    reloadLfms()
                }}
                handleOpenSettingsModal={handleOpenSettingsModal}
                handleClosePanel={handleClosePanel}
                panelWidth={panelWidth}
                linkDestination="/grouping"
                isSecondaryPanel={isSecondaryPanel}
                handleScreenshot={handleScreenshot}
                characterCount={characterCount}
            />
        </>
    )
}

export default LfmToolbar
