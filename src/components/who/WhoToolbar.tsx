import React, { useMemo, useState } from "react"
import { useWhoContext } from "../../contexts/WhoContext.tsx"
import Badge from "../global/Badge.tsx"
import GenericToolbar from "../global/GenericToolbar.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Stack from "../global/Stack.tsx"
import Checkbox from "../global/Checkbox.tsx"
import Modal from "../modal/Modal.tsx"
import {
    DEFAULT_REFRESH_RATE,
    MAXIMUM_REFRESH_RATE,
    MINIMUM_REFRESH_RATE,
} from "../../constants/whoPanel.ts"
import Link from "../global/Link.tsx"

interface Props {
    reloadCharacters: () => void
    serverName: string
    isSecondaryPanel?: boolean
    handleClosePanel?: () => void
    handleScreenshot?: () => void
}

const WhoToolbar = ({
    reloadCharacters,
    serverName,
    isSecondaryPanel,
    handleClosePanel = () => {},
    handleScreenshot = () => {},
}: Props) => {
    const {
        panelWidth,
        shouldSaveSettings,
        setShouldSaveSettings,
        shouldSaveClassFilter,
        setShouldSaveStringFilter,
        shouldSaveStringFilter,
        setShouldSaveClassFilter,
        shouldSaveLevelFilter,
        // setShouldSaveLevelFilter,
        shouldSaveSortBy,
        setShouldSaveSortBy,
        shouldSaveGroupView,
        setShouldSaveGroupView,
        shouldSaveExactMatch,
        setShouldSaveExactMatch,
        showInQuestIndicator,
        setShowInQuestIndicator,
        refreshInterval,
        setRefreshInterval,
        applyFriendsListSettings,
        setApplyFriendsListSettings,
        applyIgnoreListSettings,
        setApplyIgnoreListSettings,
        pinRegisteredCharacters,
        setPinRegisteredCharacters,
        pinFriends,
        setPinFriends,
        alwaysShowFriends,
        setAlwaysShowFriends,
        alwaysShowRegisteredCharacters,
        setAlwaysShowRegisteredCharacters,
    } = useWhoContext()
    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)

    const settingModalContent = useMemo(
        () => (
            <div style={{ padding: "20px" }}>
                <ContentClusterGroup>
                    <ContentCluster title="Display">
                        <Stack direction="column" gap="10px">
                            <Checkbox
                                checked={showInQuestIndicator}
                                onChange={(e) => {
                                    setShowInQuestIndicator(e.target.checked)
                                }}
                            >
                                Show in-quest indicator
                            </Checkbox>
                            <label htmlFor="refreshIntervalSlider">
                                Refresh every:{" "}
                                {(refreshInterval / 1000).toString()} sec
                                {refreshInterval === DEFAULT_REFRESH_RATE && (
                                    <span className="secondary-text">
                                        {" "}
                                        (default)
                                    </span>
                                )}
                            </label>
                            <input
                                id="refreshIntervalSlider"
                                type="range"
                                min={MINIMUM_REFRESH_RATE}
                                max={MAXIMUM_REFRESH_RATE}
                                step={3000}
                                value={refreshInterval}
                                onChange={(e) =>
                                    setRefreshInterval(parseInt(e.target.value))
                                }
                            />
                        </Stack>
                    </ContentCluster>
                    <ContentCluster title="Character Settings">
                        <Stack direction="column" gap="20px">
                            <Stack direction="column" gap="10px">
                                <Checkbox
                                    checked={pinRegisteredCharacters}
                                    onChange={(e) => {
                                        setPinRegisteredCharacters(
                                            e.target.checked
                                        )
                                    }}
                                >
                                    Pin my registered characters
                                </Checkbox>
                                {pinRegisteredCharacters && (
                                    <div
                                        style={{
                                            marginLeft: "20px",
                                        }}
                                    >
                                        <Checkbox
                                            checked={
                                                alwaysShowRegisteredCharacters
                                            }
                                            onChange={(e) => {
                                                setAlwaysShowRegisteredCharacters(
                                                    e.target.checked
                                                )
                                            }}
                                        >
                                            Always show registered characters
                                        </Checkbox>
                                    </div>
                                )}
                                <div
                                    style={{
                                        marginLeft: "20px",
                                    }}
                                >
                                    <Link to="/registration">
                                        Registered characters
                                    </Link>
                                </div>
                            </Stack>
                            <Stack direction="column" gap="10px">
                                <Checkbox
                                    checked={pinFriends}
                                    onChange={(e) => {
                                        setPinFriends(e.target.checked)
                                    }}
                                >
                                    Pin my friends
                                </Checkbox>
                                {pinFriends && (
                                    <div
                                        style={{
                                            marginLeft: "20px",
                                        }}
                                    >
                                        <Checkbox
                                            checked={alwaysShowFriends}
                                            onChange={(e) => {
                                                setAlwaysShowFriends(
                                                    e.target.checked
                                                )
                                            }}
                                        >
                                            Always show friends
                                        </Checkbox>
                                    </div>
                                )}
                            </Stack>
                            <Stack direction="column" gap="10px">
                                <Checkbox
                                    checked={applyIgnoreListSettings}
                                    onChange={(e) => {
                                        setApplyIgnoreListSettings(
                                            e.target.checked
                                        )
                                    }}
                                >
                                    Apply ignore list settings
                                </Checkbox>
                                <div
                                    style={{
                                        marginLeft: "20px",
                                    }}
                                >
                                    <Link to="/ignores">Change settings</Link>
                                </div>
                            </Stack>
                        </Stack>
                    </ContentCluster>
                    <ContentCluster title="Filters">
                        <Stack direction="column" gap="10px">
                            <Checkbox
                                checked={shouldSaveSettings}
                                onChange={(e) => {
                                    setShouldSaveSettings(e.target.checked)
                                }}
                            >
                                Save my filter settings and apply on each visit
                            </Checkbox>
                            <div
                                style={{
                                    borderLeft: "1px solid #ccc",
                                    paddingLeft: "10px",
                                    opacity: shouldSaveSettings ? 1 : 0.5,
                                    pointerEvents: shouldSaveSettings
                                        ? "auto"
                                        : "none",
                                }}
                            >
                                <Stack direction="column" gap="10px">
                                    <Checkbox
                                        checked={shouldSaveClassFilter}
                                        onChange={(e) => {
                                            setShouldSaveClassFilter(
                                                e.target.checked
                                            )
                                        }}
                                    >
                                        Class filters
                                    </Checkbox>
                                    <Checkbox
                                        checked={shouldSaveStringFilter}
                                        onChange={(e) => {
                                            setShouldSaveStringFilter(
                                                e.target.checked
                                            )
                                        }}
                                    >
                                        Search text
                                    </Checkbox>
                                    <Checkbox
                                        checked={shouldSaveExactMatch}
                                        onChange={(e) => {
                                            setShouldSaveExactMatch(
                                                e.target.checked
                                            )
                                        }}
                                    >
                                        Exact match checkbox
                                    </Checkbox>
                                    <Checkbox
                                        checked={false}
                                        onChange={(e) => {}}
                                    >
                                        Level filters{" "}
                                        <Badge text="Soon" type="soon" />
                                    </Checkbox>
                                    <Checkbox
                                        checked={shouldSaveSortBy}
                                        onChange={(e) => {
                                            setShouldSaveSortBy(
                                                e.target.checked
                                            )
                                        }}
                                    >
                                        Sort order and direction
                                    </Checkbox>
                                    <Checkbox
                                        checked={shouldSaveGroupView}
                                        onChange={(e) => {
                                            setShouldSaveGroupView(
                                                e.target.checked
                                            )
                                        }}
                                    >
                                        Group view
                                    </Checkbox>
                                </Stack>
                            </div>
                        </Stack>
                    </ContentCluster>
                </ContentClusterGroup>
            </div>
        ),
        [
            shouldSaveSettings,
            shouldSaveClassFilter,
            shouldSaveStringFilter,
            shouldSaveLevelFilter,
            shouldSaveSortBy,
            shouldSaveGroupView,
            shouldSaveExactMatch,
            showInQuestIndicator,
            refreshInterval,
            applyFriendsListSettings,
            applyIgnoreListSettings,
            pinRegisteredCharacters,
            pinFriends,
            alwaysShowFriends,
            alwaysShowRegisteredCharacters,
        ]
    )

    return (
        <>
            {showSettingsModal && (
                <Modal
                    onClose={() => setShowSettingsModal(false)}
                    fullScreenOnMobile
                >
                    {settingModalContent}
                </Modal>
            )}
            <GenericToolbar
                serverName={serverName}
                handleReload={reloadCharacters}
                handleOpenSettingsModal={() => {
                    setShowSettingsModal(true)
                }}
                panelWidth={panelWidth}
                linkDestination="/who"
                isSecondaryPanel={isSecondaryPanel}
                handleClosePanel={handleClosePanel}
                handleScreenshot={handleScreenshot}
            />
        </>
    )
}

export default WhoToolbar
