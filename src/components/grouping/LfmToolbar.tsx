import React, { useMemo } from "react"
import "./LfmToolbar.css"
import Link from "../global/Link.tsx"
import { useThemeContext } from "../../contexts/ThemeContext.tsx"
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
import Badge from "../global/Badge.tsx"
import Checkbox from "../global/Checkbox.tsx"
import useFeatureCallouts from "../../hooks/useFeatureCallouts.ts"
import GenericToolbar from "../global/GenericToolbar.tsx"
import RadioButton from "../global/RadioButton.tsx"

interface Props {
    reloadLfms: () => void
    serverName: string
    isSecondaryPanel?: boolean
    handleClosePanel?: () => void
    handleScreenshot?: () => void
}

const LfmToolbar = ({
    reloadLfms,
    serverName,
    isSecondaryPanel,
    handleClosePanel = () => {},
    handleScreenshot = () => {},
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
        setPanelWidth,
        showBoundingBoxes,
        setShowBoundingBoxes,
        isDynamicWidth,
        setIsDynamicWidth,
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
    } = useLfmContext()
    const { isFullScreen, setIsFullScreen } = useThemeContext()
    const { isCalloutActive, callouts, dismissCallout } = useFeatureCallouts()
    const [showSettingsModal, setShowSettingsModal] = React.useState(false)
    const [showResetDisplaySettingsModal, setShowResetDisplaySettingsModal] =
        React.useState(false)
    const [showResetFilterSettingsModal, setShowResetFilterSettingsModal] =
        React.useState(false)
    const [showResetToolSettingsModal, setShowResetToolSettingsModal] =
        React.useState(false)

    const handleOpenModal = () => {
        setShowSettingsModal(true)
    }

    const handleCloseModal = () => {
        setShowSettingsModal(false)
    }

    const resetFilterSettingsModal = useMemo(
        () => (
            <YesNoModal
                title="Reset Filters"
                text="This will reset all filter settings to their default values. Your registered characters will not be affected."
                onYes={() => {
                    resetFilterSettings()
                    setShowResetFilterSettingsModal(false)
                    handleCloseModal()
                }}
                onNo={() => setShowResetFilterSettingsModal(false)}
                fullScreenOnMobile
            />
        ),
        [resetFilterSettings]
    )

    const resetDisplaySettingsModal = useMemo(
        () => (
            <YesNoModal
                title="Reset Display"
                text="This will reset all display settings to their default values."
                onYes={() => {
                    resetDisplaySettings()
                    setShowResetDisplaySettingsModal(false)
                    handleCloseModal()
                }}
                onNo={() => setShowResetDisplaySettingsModal(false)}
                fullScreenOnMobile
            />
        ),
        [resetDisplaySettings]
    )

    const resetToolSettingsModal = useMemo(
        () => (
            <YesNoModal
                title="Reset Tools"
                text="This will reset all tool settings to their default values."
                onYes={() => {
                    resetToolSettings()
                    setShowResetToolSettingsModal(false)
                    handleCloseModal()
                }}
                onNo={() => setShowResetToolSettingsModal(false)}
                fullScreenOnMobile
            />
        ),
        [resetToolSettings]
    )

    const settingModalContent = useMemo(
        () => (
            <div className="lfm-settings-modal">
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
                                            />
                                        </Stack>
                                    </Stack>
                                </div>
                            )}
                            <RadioButton
                                checked={filterByMyCharacters}
                                onChange={() => setFilterByMyCharacters(true)}
                            >
                                Filter based on my current level
                            </RadioButton>
                            {filterByMyCharacters && (
                                <div className="filter-section multi-select">
                                    <Stack direction="column" gap="10px">
                                        {registeredCharacters &&
                                            registeredCharacters
                                                .sort((a, b) =>
                                                    (
                                                        a.name || ""
                                                    ).localeCompare(
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
                                                                          (
                                                                              id
                                                                          ) =>
                                                                              id !==
                                                                              character.id
                                                                      )
                                                            )
                                                        }
                                                    >
                                                        {character.name} |{" "}
                                                        {character.total_level}{" "}
                                                        |{" "}
                                                        {character.server_name}
                                                    </Checkbox>
                                                ))}
                                        <Link
                                            to="/registration"
                                            className="link"
                                        >
                                            Register more
                                        </Link>
                                    </Stack>
                                </div>
                            )}
                            <Checkbox
                                checked={showNotEligible}
                                onChange={(e) =>
                                    setShowNotEligible(e.target.checked)
                                }
                            >
                                Show groups I'm not eligible for
                            </Checkbox>
                            <Stack fullWidth justify="flex-end">
                                <Button
                                    onClick={() =>
                                        setShowResetFilterSettingsModal(true)
                                    }
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
                                    <span className="secondary-text">
                                        {" "}
                                        (default)
                                    </span>
                                )}
                            </label>
                            <input
                                id="fontSizeSlider"
                                type="range"
                                min={10}
                                max={20}
                                value={fontSize}
                                onChange={(e) =>
                                    setFontSize(parseInt(e.target.value))
                                }
                            />
                            <label htmlFor="overlayPopupDelaySlider">
                                Overlay popup delay:{" "}
                                {(mouseOverDelay / 1000).toString()}s
                                {mouseOverDelay ===
                                    DEFAULT_MOUSE_OVER_DELAY && (
                                    <span className="secondary-text">
                                        {" "}
                                        (default)
                                    </span>
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
                            <Checkbox
                                checked={isDynamicWidth}
                                onChange={(e) =>
                                    setIsDynamicWidth(e.target.checked)
                                }
                            >
                                Dynamic width
                            </Checkbox>
                            <Checkbox
                                checked={isFullScreen}
                                onChange={(e) =>
                                    setIsFullScreen(e.target.checked)
                                }
                            >
                                Fullscreen
                            </Checkbox>
                            <Checkbox
                                checked={isMultiColumn}
                                onChange={(e) =>
                                    setIsMultiColumn(e.target.checked)
                                }
                            >
                                Show raid group members in two columns
                            </Checkbox>
                            <Stack fullWidth justify="flex-end">
                                <Button
                                    onClick={() =>
                                        setShowResetDisplaySettingsModal(true)
                                    }
                                    type="tertiary"
                                    className="critical"
                                >
                                    Reset all
                                </Button>
                            </Stack>
                        </Stack>
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
                                onChange={(e) =>
                                    setShowMemberCount(e.target.checked)
                                }
                            >
                                Show member count
                            </Checkbox>
                            <Checkbox
                                checked={showQuestGuesses}
                                onChange={(e) =>
                                    setShowQuestGuesses(e.target.checked)
                                }
                            >
                                Show quest guesses
                            </Checkbox>
                            <Checkbox
                                checked={showQuestTips}
                                onChange={(e) =>
                                    setShowQuestTips(e.target.checked)
                                }
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
                            <Checkbox
                                checked={showLfmActivity}
                                onChange={(e) => {
                                    setShowLfmActivity(e.target.checked)
                                    dismissCallout("show-lfm-activity")
                                }}
                            >
                                Show LFM activity history{" "}
                                {isCalloutActive("show-lfm-activity") && (
                                    <Badge type="new" text="New" />
                                )}
                            </Checkbox>
                            <Checkbox
                                checked={showLfmPostedTime}
                                onChange={(e) => {
                                    setShowLfmPostedTime(e.target.checked)
                                    dismissCallout("show-lfm-posted-time")
                                }}
                            >
                                Show LFM posted time{" "}
                                {isCalloutActive("show-lfm-posted-time") && (
                                    <Badge type="new" text="New" />
                                )}
                            </Checkbox>
                            <Stack fullWidth justify="flex-end">
                                <Button
                                    onClick={() =>
                                        setShowResetToolSettingsModal(true)
                                    }
                                    type="tertiary"
                                    className="critical"
                                >
                                    Reset all
                                </Button>
                            </Stack>
                        </Stack>
                    </ContentCluster>
                </ContentClusterGroup>
            </div>
        ),
        [
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
            setPanelWidth,
            showBoundingBoxes,
            setShowBoundingBoxes,
            isDynamicWidth,
            setIsDynamicWidth,
            isFullScreen,
            setIsFullScreen,
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
            trackedCharacterIds,
            setTrackedCharacterIds,
            registeredCharacters,
            showLfmPostedTime,
            setShowLfmPostedTime,
            mouseOverDelay,
            setMouseOverDelay,
            showLfmActivity,
            setShowLfmActivity,
            callouts,
        ]
    )

    return (
        <>
            {showResetDisplaySettingsModal && resetDisplaySettingsModal}
            {showResetFilterSettingsModal && resetFilterSettingsModal}
            {showResetToolSettingsModal && resetToolSettingsModal}
            {showSettingsModal &&
                !showResetDisplaySettingsModal &&
                !showResetFilterSettingsModal &&
                !showResetToolSettingsModal && (
                    <Modal onClose={handleCloseModal} fullScreenOnMobile>
                        {settingModalContent}
                    </Modal>
                )}
            <GenericToolbar
                serverName={serverName}
                handleReload={() => {
                    reloadRegisteredCharacters()
                    reloadLfms()
                }}
                handleOpenSettingsModal={handleOpenModal}
                handleClosePanel={handleClosePanel}
                panelWidth={panelWidth}
                linkDestination="/grouping"
                isSecondaryPanel={isSecondaryPanel}
                handleScreenshot={handleScreenshot}
            />
        </>
    )
}

export default LfmToolbar
