import React, { useMemo } from "react"
import "./LfmToolbar.css"
import useGetCurrentServer from "../../hooks/useGetCurrentServer.ts"
import { Link } from "react-router-dom"
// @ts-ignore
import { ReactComponent as MenuSVG } from "../../assets/svg/menu.svg"
// @ts-ignore
import { ReactComponent as ScreenshotSVG } from "../../assets/svg/capture.svg"
// @ts-ignore
import { ReactComponent as FilterSVG } from "../../assets/svg/filter.svg"
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

const LfmToolbar = () => {
    const { serverNameSentenceCase } = useGetCurrentServer()
    const {
        minLevel,
        setMinLevel,
        maxLevel,
        setMaxLevel,
        filterByMyLevel,
        setFilterByMyLevel,
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
        resetAll,
    } = useLfmContext()
    const { isFullScreen, setIsFullScreen } = useThemeContext()
    const [showSettingsModal, setShowSettingsModal] = React.useState(false)

    const settingModalContent = useMemo(
        () => (
            <>
                <ContentCluster title="Filter Groups">
                    <Stack direction="column" gap="10px">
                        <span>Level range:</span>
                        <Stack>
                            <input
                                type="text"
                                placeholder="Min"
                                style={{ width: "100px" }}
                                value={minLevel}
                                onChange={(e) =>
                                    setMinLevel(parseInt(e.target.value))
                                }
                            />
                            <input
                                type="text"
                                placeholder="Max"
                                style={{ width: "100px" }}
                                value={maxLevel}
                                onChange={(e) =>
                                    setMaxLevel(parseInt(e.target.value))
                                }
                            />
                        </Stack>
                        <label htmlFor="filterOnMyLevel">
                            <input
                                type="checkbox"
                                id="filterOnMyLevel"
                                checked={filterByMyLevel}
                                onChange={(e) =>
                                    setFilterByMyLevel(e.target.checked)
                                }
                            />
                            Filter based on my current level
                        </label>
                        <label htmlFor="showNotEligible">
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
                        <label htmlFor="showBoundingBoxes">
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
                        <label htmlFor="dynamicWidth">
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
                        <label htmlFor="fullscreen">
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
                        <Button
                            onClick={resetAll}
                            type="secondary"
                            text="Reset all"
                        />
                    </Stack>
                </ContentCluster>
                <ContentCluster title="Tools">
                    <Stack direction="column" gap="10px">
                        <label htmlFor="raidTimerIndicator">
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
                        <label htmlFor="memberCount">
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
                        <label htmlFor="questGuesses">
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
                        <label htmlFor="questTips">
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
                        <label htmlFor="characterGuildNames">
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
                    </Stack>
                </ContentCluster>
            </>
        ),
        [
            minLevel,
            setMinLevel,
            maxLevel,
            setMaxLevel,
            filterByMyLevel,
            setFilterByMyLevel,
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
            resetAll,
        ]
    )

    return (
        <>
            {showSettingsModal && (
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
                    <MenuSVG />
                    <span className="lfm-toolbar-item-text">
                        {serverNameSentenceCase}
                    </span>
                </Link>
                <div className="lfm-toolbar-item screenshot-button">
                    <ScreenshotSVG />
                    <span className="lfm-toolbar-item-text hide-on-mobile">
                        Screenshot
                    </span>
                </div>
                <div
                    className="lfm-toolbar-item filter-button"
                    onClick={() => setShowSettingsModal(true)}
                >
                    <FilterSVG />
                    <span className="lfm-toolbar-item-text hide-on-mobile">
                        Filter
                    </span>
                </div>
                <div
                    className="lfm-toolbar-item fullscreen-button"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                >
                    {isFullScreen ? <FullscreenExitSVG /> : <FullscreenSVG />}
                    <span className="lfm-toolbar-item-text hide-on-mobile">
                        Fullscreen
                    </span>
                </div>
                <div className="lfm-toolbar-item refresh-button">
                    <RefreshSVG />
                </div>
            </div>
        </>
    )
}

export default LfmToolbar
