import React, { useMemo, useState } from "react"
import { useWhoContext } from "../../contexts/WhoContext.tsx"
import Badge from "../global/Badge.tsx"
import useFeatureCallouts from "../../hooks/useFeatureCallouts.ts"
import GenericToolbar from "../global/GenericToolbar.tsx"
import ContentCluster from "../global/ContentCluster.tsx"
import Stack from "../global/Stack.tsx"
import Checkbox from "../global/Checkbox.tsx"
import Modal from "../modal/Modal.tsx"
import {
    DEFAULT_REFRESH_RATE,
    MAXIMUM_REFRESH_RATE,
    MINIMUM_REFRESH_RATE,
} from "../../constants/whoPanel.ts"

interface Props {
    reloadCharacters: () => void
    serverName: string
    isSecondaryPanel?: boolean
    handleClosePanel?: () => void
}

const WhoToolbar = ({
    reloadCharacters,
    serverName,
    isSecondaryPanel,
    handleClosePanel,
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
    } = useWhoContext()
    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)

    const settingModalContent = useMemo(
        () => (
            <div style={{ padding: "20px" }}>
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
                            Refresh every: {(refreshInterval / 1000).toString()}{" "}
                            sec
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
                <ContentCluster title="Settings">
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
                                <Checkbox checked={false} onChange={(e) => {}}>
                                    Level filters{" "}
                                    <Badge text="Soon" type="soon" />
                                </Checkbox>
                                <Checkbox
                                    checked={shouldSaveSortBy}
                                    onChange={(e) => {
                                        setShouldSaveSortBy(e.target.checked)
                                    }}
                                >
                                    Sort order and direction
                                </Checkbox>
                                <Checkbox
                                    checked={shouldSaveGroupView}
                                    onChange={(e) => {
                                        setShouldSaveGroupView(e.target.checked)
                                    }}
                                >
                                    Group view
                                </Checkbox>
                            </Stack>
                        </div>
                    </Stack>
                </ContentCluster>
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
        ]
    )

    return (
        <>
            {showSettingsModal && (
                <Modal onClose={() => setShowSettingsModal(false)}>
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
            />
        </>
    )
}

export default WhoToolbar
