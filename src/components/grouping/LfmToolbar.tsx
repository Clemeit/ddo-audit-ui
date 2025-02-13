import React, { useMemo } from "react"
import "./LfmToolbar.css"
import useGetCurrentServer from "../../hooks/useGetCurrentServer.ts"
import { Link } from "react-router-dom"
import { ReactComponent as MenuSVG } from "../../assets/svg/menu.svg"
import { ReactComponent as ScreenshotSVG } from "../../assets/svg/capture.svg"
import { ReactComponent as SettingsSVG } from "../../assets/svg/settings.svg"
import { ReactComponent as FullscreenSVG } from "../../assets/svg/fullscreen.svg"
import { ReactComponent as FullscreenExitSVG } from "../../assets/svg/fullscreen-exit.svg"
import { ReactComponent as RefreshSVG } from "../../assets/svg/refresh.svg"
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
import ContentCluster from "../global/ContentCluster.tsx"
import { Character } from "../../models/Character.ts"
import YesNoModal from "../modal/YesNoModal.tsx"
import Badge from "../global/Badge.tsx"
import { VIP_SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import Checkbox from "../global/Checkbox.tsx"
import useFeatureCallouts from "../../hooks/useFeatureCallouts.ts"

interface Props {
    reloadLfms: () => void
}

const LfmToolbar = ({ reloadLfms }: Props) => {
    const { serverNameSentenceCase, serverNameLowercase } =
        useGetCurrentServer()
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
        resetViewSettings,
        resetUserSettings,
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
    const [showResetViewSettingsModal, setShowResetViewSettingsModal] =
        React.useState(false)
    const [showResetUserSettingsModal, setShowResetUserSettingsModal] =
        React.useState(false)
    const [canManuallyReload, setCanManuallyReload] = React.useState(true)

    const handleOpenModal = () => {
        setShowSettingsModal(true)
        document.body.style.overflowY = "hidden"
    }

    const handleCloseModal = () => {
        setShowSettingsModal(false)
        document.body.style.overflowY = "scroll"
    }

    const resetViewSettingsModal = useMemo(
        () => (
            <YesNoModal
                title="Are you sure?"
                text="This will reset all display settings to their default values."
                onYes={() => {
                    resetViewSettings()
                    setShowResetViewSettingsModal(false)
                    handleCloseModal()
                }}
                onNo={() => setShowResetViewSettingsModal(false)}
                fullScreenOnMobile
            />
        ),
        [resetViewSettings]
    )

    const resetUserSettingsModal = useMemo(
        () => (
            <YesNoModal
                title="Are you sure?"
                text="This will reset all filter settings to their default values. Your registered characters will not be affected."
                onYes={() => {
                    resetUserSettings()
                    setShowResetUserSettingsModal(false)
                    handleCloseModal()
                }}
                onNo={() => setShowResetUserSettingsModal(false)}
                fullScreenOnMobile
            />
        ),
        [resetUserSettings]
    )

    const settingModalContent = useMemo(
        () => (
            <div className="lfm-settings-modal">
                <ContentCluster title="Filter Groups">
                    <Stack direction="column" gap="10px">
                        <label
                            className="input-label"
                            htmlFor="filterByLevelRange"
                        >
                            <input
                                type="radio"
                                name="sort"
                                id="filterByLevelRange"
                                checked={!filterByMyCharacters}
                                onChange={() => setFilterByMyCharacters(false)}
                            />
                            Filter by level range
                        </label>
                        <label
                            className="input-label"
                            htmlFor="filterOnMyLevel"
                        >
                            <input
                                type="radio"
                                id="filterOnMyLevel"
                                checked={filterByMyCharacters}
                                onChange={() => setFilterByMyCharacters(true)}
                            />
                            Filter based on my current level
                        </label>
                        {!filterByMyCharacters && (
                            <div className="filter-section">
                                <Stack direction="column" gap="10px">
                                    <span>Level range:</span>
                                    <Stack>
                                        <input
                                            type="text"
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
                                            type="text"
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
                                                    key={character.id}
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
                        <label
                            className="input-label"
                            htmlFor="showNotEligible"
                        >
                            <input
                                type="checkbox"
                                id="showNotEligible"
                                checked={showNotEligible}
                                onChange={(e) =>
                                    setShowNotEligible(e.target.checked)
                                }
                            />
                            Show groups I'm not eligible for
                        </label>
                        <Stack fullWidth justify="flex-end">
                            <Button
                                onClick={() =>
                                    setShowResetUserSettingsModal(true)
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
                            {mouseOverDelay === DEFAULT_MOUSE_OVER_DELAY && (
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
                        <Checkbox
                            checked={showBoundingBoxes}
                            onChange={(e) =>
                                setShowBoundingBoxes(e.target.checked)
                            }
                        >
                            Show bounding boxes
                        </Checkbox>
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
                        <Stack fullWidth justify="flex-end">
                            <Button
                                onClick={() =>
                                    setShowResetViewSettingsModal(true)
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
                    </Stack>
                </ContentCluster>
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
            {showResetViewSettingsModal && resetViewSettingsModal}
            {showResetUserSettingsModal && resetUserSettingsModal}
            {showSettingsModal &&
                !showResetViewSettingsModal &&
                !showResetUserSettingsModal && (
                    <Modal onClose={handleCloseModal} fullScreenOnMobile>
                        {settingModalContent}
                    </Modal>
                )}
            <div
                className="lfm-toolbar-container"
                style={{ width: panelWidth, maxWidth: "100%" }}
            >
                <Link
                    to="/grouping"
                    className="lfm-toolbar-item server-name-link"
                >
                    <MenuSVG className="lfm-toolbar-item-icon" />
                    <span className="lfm-toolbar-item-text">
                        {serverNameSentenceCase}
                        {VIP_SERVER_NAMES_LOWER.includes(
                            serverNameLowercase
                        ) && (
                            <>
                                {" "}
                                <Badge
                                    text="VIP"
                                    size="small"
                                    backgroundColor="var(--orange4)"
                                />
                            </>
                        )}
                    </span>
                </Link>
                <div className="lfm-toolbar-item screenshot-button hide-on-mobile">
                    <ScreenshotSVG className="lfm-toolbar-item-icon" />
                    <span className="lfm-toolbar-item-text hide-on-mobile">
                        Screenshot
                    </span>
                </div>
                <div
                    className="lfm-toolbar-item settings-button"
                    onClick={() => {
                        handleOpenModal()
                        dismissCallout("grouping-settings-button")
                    }}
                >
                    <SettingsSVG className="lfm-toolbar-item-icon" />
                    <span className="lfm-toolbar-item-text hide-on-mobile">
                        Settings{" "}
                        {isCalloutActive("grouping-settings-button") && (
                            <Badge type="new" text="New" />
                        )}
                    </span>
                </div>
                <div
                    className="lfm-toolbar-item fullscreen-button"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                >
                    {isFullScreen ? (
                        <FullscreenExitSVG className="lfm-toolbar-item-icon" />
                    ) : (
                        <FullscreenSVG className="lfm-toolbar-item-icon" />
                    )}
                    <span className="lfm-toolbar-item-text hide-on-mobile">
                        Fullscreen
                    </span>
                </div>
                <div
                    className={`lfm-toolbar-item refresh-button ${canManuallyReload ? "" : "disabled"}`}
                    onClick={() => {
                        if (canManuallyReload) {
                            reloadRegisteredCharacters()
                            reloadLfms()
                            setCanManuallyReload(false)
                            setTimeout(() => setCanManuallyReload(true), 5000)
                        }
                    }}
                >
                    <RefreshSVG
                        className={`lfm-toolbar-item-icon ${canManuallyReload ? "" : "icon-disabled"}`}
                    />
                </div>
            </div>
        </>
    )
}

export default LfmToolbar
