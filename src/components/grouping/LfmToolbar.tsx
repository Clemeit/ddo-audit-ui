import React, { useMemo } from "react"
import "./LfmToolbar.css"
import useGetCurrentServer from "../../hooks/useGetCurrentServer.ts"
import { Link } from "react-router-dom"
// @ts-ignore
import { ReactComponent as MenuSVG } from "../../assets/svg/menu.svg"
// @ts-ignore
import { ReactComponent as ScreenshotSVG } from "../../assets/svg/capture.svg"
// @ts-ignore
import { ReactComponent as SettingsSVG } from "../../assets/svg/settings.svg"
// @ts-ignore
import { ReactComponent as FullscreenSVG } from "../../assets/svg/fullscreen.svg"
// @ts-ignore
import { ReactComponent as FullscreenExitSVG } from "../../assets/svg/fullscreen-exit.svg"
// @ts-ignore
import { ReactComponent as RefreshSVG } from "../../assets/svg/refresh.svg"
import { useThemeContext } from "../../contexts/ThemeContext.tsx"
import Modal from "../modal/Modal.tsx"
import Stack from "../global/Stack.tsx"
import { useLfmContext } from "../../contexts/LfmContext.tsx"
import {
    DEFAULT_BASE_FONT_SIZE,
    DEFAULT_LFM_PANEL_WIDTH,
    MAXIMUM_LFM_PANEL_WIDTH,
    MINIMUM_LFM_PANEL_WIDTH,
} from "../../constants/lfmPanel.ts"
import Button from "../global/Button.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import { Character } from "../../models/Character.ts"
import YesNoModal from "../modal/YesNoModal.tsx"

interface Props {
    reloadLfms: () => void
}

const LfmToolbar = ({ reloadLfms }: Props) => {
    const { serverNameSentenceCase } = useGetCurrentServer()
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
    } = useLfmContext()
    const { isFullScreen, setIsFullScreen } = useThemeContext()
    const [showSettingsModal, setShowSettingsModal] = React.useState(false)
    const [showResetViewSettingsModal, setShowResetViewSettingsModal] =
        React.useState(false)
    const [showResetUserSettingsModal, setShowResetUserSettingsModal] =
        React.useState(false)
    const [canManuallyReload, setCanManuallyReload] = React.useState(true)

    const resetViewSettingsModal = useMemo(
        () => (
            <YesNoModal
                title="Are you sure?"
                text="This will reset all display settings to their default values."
                onYes={() => {
                    resetViewSettings()
                    setShowResetViewSettingsModal(false)
                    setShowSettingsModal(false)
                }}
                onNo={() => setShowResetViewSettingsModal(false)}
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
                    setShowSettingsModal(false)
                }}
                onNo={() => setShowResetUserSettingsModal(false)}
            />
        ),
        [resetUserSettings]
    )

    const settingModalContent = useMemo(
        () => (
            <>
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
                            <div className="filter-section">
                                <Stack direction="column" gap="10px">
                                    {registeredCharacters &&
                                        registeredCharacters
                                            .sort((a, b) =>
                                                (a.name || "").localeCompare(
                                                    b.name || ""
                                                )
                                            )
                                            .map((character: Character) => (
                                                <label
                                                    className="input-label"
                                                    htmlFor={`character${character.id}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        id={`character${character.id}`}
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
                                                    />
                                                    {character.name} |{" "}
                                                    {character.total_level} |{" "}
                                                    {character.server_name}
                                                </label>
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
                        <Stack fullWidth justify="right">
                            <Button
                                onClick={() =>
                                    setShowResetUserSettingsModal(true)
                                }
                                type="tertiary"
                                text="Reset all"
                                className="critical"
                            />
                        </Stack>
                    </Stack>
                </ContentCluster>
                <ContentCluster title="Display">
                    <Stack direction="column" gap="10px">
                        <span>
                            Font size: {fontSize}px
                            {fontSize === DEFAULT_BASE_FONT_SIZE && (
                                <span className="secondary-text">
                                    {" "}
                                    (default)
                                </span>
                            )}
                        </span>
                        <input
                            type="range"
                            min={10}
                            max={20}
                            value={fontSize}
                            onChange={(e) =>
                                setFontSize(parseInt(e.target.value))
                            }
                        />
                        <span>
                            Panel width: {panelWidth}px
                            {panelWidth === DEFAULT_LFM_PANEL_WIDTH && (
                                <span className="secondary-text">
                                    {" "}
                                    (default)
                                </span>
                            )}
                        </span>
                        <input
                            type="range"
                            min={MINIMUM_LFM_PANEL_WIDTH}
                            max={MAXIMUM_LFM_PANEL_WIDTH}
                            value={panelWidth}
                            onChange={(e) =>
                                setPanelWidth(parseInt(e.target.value))
                            }
                        />
                        <label
                            className="input-label"
                            htmlFor="showBoundingBoxes"
                        >
                            <input
                                type="checkbox"
                                id="showBoundingBoxes"
                                checked={showBoundingBoxes}
                                onChange={(e) =>
                                    setShowBoundingBoxes(e.target.checked)
                                }
                            />
                            Show bounding boxes
                        </label>
                        <label className="input-label" htmlFor="dynamicWidth">
                            <input
                                type="checkbox"
                                id="dynamicWidth"
                                checked={isDynamicWidth}
                                onChange={(e) =>
                                    setIsDynamicWidth(e.target.checked)
                                }
                            />
                            Dynamic width
                        </label>
                        <label className="input-label" htmlFor="fullscreen">
                            <input
                                type="checkbox"
                                id="fullscreen"
                                checked={isFullScreen}
                                onChange={(e) =>
                                    setIsFullScreen(e.target.checked)
                                }
                            />
                            Fullscreen
                        </label>
                        <Stack fullWidth justify="right">
                            <Button
                                onClick={() =>
                                    setShowResetViewSettingsModal(true)
                                }
                                type="tertiary"
                                text="Reset all"
                                className="critical"
                            />
                        </Stack>
                    </Stack>
                </ContentCluster>
                <ContentCluster title="Tools">
                    <Stack direction="column" gap="10px">
                        <label
                            className="input-label"
                            htmlFor="raidTimerIndicator"
                        >
                            <input
                                type="checkbox"
                                id="raidTimerIndicator"
                                checked={showRaidTimerIndicator}
                                onChange={(e) =>
                                    setShowRaidTimerIndicator(e.target.checked)
                                }
                            />
                            Show raid timer indicator
                        </label>
                        <label className="input-label" htmlFor="memberCount">
                            <input
                                type="checkbox"
                                id="memberCount"
                                checked={showMemberCount}
                                onChange={(e) =>
                                    setShowMemberCount(e.target.checked)
                                }
                            />
                            Show member count
                        </label>
                        <label className="input-label" htmlFor="questGuesses">
                            <input
                                type="checkbox"
                                id="questGuesses"
                                checked={showQuestGuesses}
                                onChange={(e) =>
                                    setShowQuestGuesses(e.target.checked)
                                }
                            />
                            Show quest guesses
                        </label>
                        <label className="input-label" htmlFor="questTips">
                            <input
                                type="checkbox"
                                id="questTips"
                                checked={showQuestTips}
                                onChange={(e) =>
                                    setShowQuestTips(e.target.checked)
                                }
                            />
                            Show quest tips
                        </label>
                        <label
                            className="input-label"
                            htmlFor="characterGuildNames"
                        >
                            <input
                                type="checkbox"
                                id="characterGuildNames"
                                checked={showCharacterGuildNames}
                                onChange={(e) =>
                                    setShowCharacterGuildNames(e.target.checked)
                                }
                            />
                            Show character guild names
                        </label>
                        <label className="input-label" htmlFor="lfmPostedTime">
                            <input
                                type="checkbox"
                                id="lfmPostedTime"
                                checked={showLfmPostedTime}
                                onChange={(e) =>
                                    setShowLfmPostedTime(e.target.checked)
                                }
                            />
                            Show LFM posted time
                        </label>
                    </Stack>
                </ContentCluster>
            </>
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
        ]
    )

    return (
        <>
            {showResetViewSettingsModal && resetViewSettingsModal}
            {showResetUserSettingsModal && resetUserSettingsModal}
            {showSettingsModal &&
                !showResetViewSettingsModal &&
                !showResetUserSettingsModal && (
                    <Modal onClose={() => setShowSettingsModal(false)}>
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
                    onClick={() => setShowSettingsModal(true)}
                >
                    <SettingsSVG className="lfm-toolbar-item-icon" />
                    <span className="lfm-toolbar-item-text hide-on-mobile">
                        Settings
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
