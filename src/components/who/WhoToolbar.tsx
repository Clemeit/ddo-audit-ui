import { useWhoContext } from "../../contexts/WhoContext.tsx"
import GenericToolbar from "../global/GenericToolbar.tsx"
import {
    ContentCluster,
    ContentClusterGroup,
} from "../global/ContentCluster.tsx"
import Stack from "../global/Stack.tsx"
import Checkbox from "../global/Checkbox.tsx"
import Modal from "../modal/Modal.tsx"
import Link from "../global/Link.tsx"
import { useModalNavigation } from "../../hooks/useModalNavigation.ts"
import {
    DEFAULT_CHARACTER_COUNT,
    MAXIMUM_CHARACTER_COUNT,
    MINIMUM_CHARACTER_COUNT,
} from "../../constants/whoPanel.ts"
import { ReactComponent as WarningSVG } from "../../assets/svg/warning.svg"
import { useAreaContext } from "../../contexts/AreaContext.tsx"

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
        setShouldSaveLevelFilter,
        shouldSaveSortBy,
        setShouldSaveSortBy,
        shouldSaveGroupView,
        setShouldSaveGroupView,
        shouldSaveExactMatch,
        setShouldSaveExactMatch,
        showInQuestIndicator,
        setShowInQuestIndicator,
        hideIgnoredCharacters,
        setHideIgnoredCharacters,
        pinRegisteredCharacters,
        setPinRegisteredCharacters,
        pinFriends,
        setPinFriends,
        alwaysShowFriends,
        setAlwaysShowFriends,
        alwaysShowRegisteredCharacters,
        setAlwaysShowRegisteredCharacters,
        maximumRenderedCharacterCount,
        setMaximumRenderedCharacterCount,
    } = useWhoContext()

    const { reloadAreas } = useAreaContext()

    const {
        isModalOpen: showSettingsModal,
        openModal: handleOpenModal,
        closeModal: handleCloseModal,
    } = useModalNavigation()

    const settingModalContent = (
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
                    <label htmlFor="maxChracterRenderSlider">
                        Display the first{" "}
                        {maximumRenderedCharacterCount.toString()} characters
                        {maximumRenderedCharacterCount ===
                            DEFAULT_CHARACTER_COUNT && (
                            <span className="secondary-text"> (default)</span>
                        )}
                    </label>
                    <input
                        id="maxChracterRenderSlider"
                        type="range"
                        min={MINIMUM_CHARACTER_COUNT}
                        max={MAXIMUM_CHARACTER_COUNT}
                        step={10}
                        value={maximumRenderedCharacterCount}
                        onChange={(e) =>
                            setMaximumRenderedCharacterCount(
                                parseInt(e.target.value)
                            )
                        }
                    />
                    {maximumRenderedCharacterCount > 200 && (
                        <span>
                            <WarningSVG
                                className="page-message-icon"
                                style={{ fill: `var(--warning)` }}
                            />
                            This can slow down or crash your browser!
                        </span>
                    )}
                </Stack>
            </ContentCluster>
            <ContentCluster title="Social">
                <Stack direction="column" gap="20px">
                    <Stack direction="column" gap="10px">
                        <Checkbox
                            checked={pinRegisteredCharacters}
                            onChange={(e) => {
                                setPinRegisteredCharacters(e.target.checked)
                            }}
                        >
                            Pin my online registered characters
                        </Checkbox>
                        <Checkbox
                            checked={alwaysShowRegisteredCharacters}
                            onChange={(e) => {
                                setAlwaysShowRegisteredCharacters(
                                    e.target.checked
                                )
                            }}
                        >
                            Always show my online registered characters
                        </Checkbox>
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
                            Pin my online friends
                        </Checkbox>
                        <Checkbox
                            checked={alwaysShowFriends}
                            onChange={(e) => {
                                setAlwaysShowFriends(e.target.checked)
                            }}
                        >
                            Always show my online friends
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
                            checked={hideIgnoredCharacters}
                            onChange={(e) => {
                                setHideIgnoredCharacters(e.target.checked)
                            }}
                        >
                            Hide ignored characters
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
                            pointerEvents: shouldSaveSettings ? "auto" : "none",
                        }}
                    >
                        <Stack direction="column" gap="10px">
                            <Checkbox
                                checked={shouldSaveClassFilter}
                                onChange={(e) => {
                                    setShouldSaveClassFilter(e.target.checked)
                                }}
                            >
                                Class filters
                            </Checkbox>
                            <Checkbox
                                checked={shouldSaveStringFilter}
                                onChange={(e) => {
                                    setShouldSaveStringFilter(e.target.checked)
                                }}
                            >
                                Search text
                            </Checkbox>
                            <Checkbox
                                checked={shouldSaveExactMatch}
                                onChange={(e) => {
                                    setShouldSaveExactMatch(e.target.checked)
                                }}
                            >
                                Exact match checkbox
                            </Checkbox>
                            <Checkbox
                                checked={shouldSaveLevelFilter}
                                onChange={(e) => {
                                    setShouldSaveLevelFilter(e.target.checked)
                                }}
                            >
                                Level filters
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
        </ContentClusterGroup>
    )

    return (
        <>
            {showSettingsModal && (
                <Modal
                    onClose={handleCloseModal}
                    fullScreenOnMobile
                    freezeBodyScroll
                >
                    {settingModalContent}
                </Modal>
            )}
            <GenericToolbar
                serverName={serverName}
                handleReload={() => {
                    reloadAreas()
                    reloadCharacters()
                }}
                handleOpenSettingsModal={handleOpenModal}
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
