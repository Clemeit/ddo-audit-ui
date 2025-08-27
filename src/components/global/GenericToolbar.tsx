import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import Link from "./Link.tsx"
import { ReactComponent as MenuSVG } from "../../assets/svg/menu.svg"
import { ReactComponent as ScreenshotSVG } from "../../assets/svg/capture.svg"
import { ReactComponent as SettingsSVG } from "../../assets/svg/settings.svg"
import { ReactComponent as FullscreenSVG } from "../../assets/svg/fullscreen.svg"
import { ReactComponent as FullscreenExitSVG } from "../../assets/svg/fullscreen-exit.svg"
import { ReactComponent as RefreshSVG } from "../../assets/svg/refresh.svg"
import { ReactComponent as CloseSVG } from "../../assets/svg/close.svg"
import Badge from "../global/Badge.tsx"
import { useAppContext } from "../../contexts/AppContext.tsx"
import useFeatureCallouts from "../../hooks/useFeatureCallouts.ts"
import "./GenericToolbar.css"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import Stack from "./Stack.tsx"
import ColoredText from "./ColoredText.tsx"
import GenericToolbarButton from "./GenericToolbarButton.tsx"
import { useMultiPanelContext } from "../../contexts/MultiPanelContext.tsx"

interface Props {
    handleReload: () => void
    handleOpenSettingsModal: () => void
    handleClosePanel?: () => void
    panelWidth: number
    linkDestination: string
    serverName: string
    isSecondaryPanel?: boolean
    handleScreenshot?: () => void
    characterCount?: number
}

const GenericToolbar = ({
    handleReload,
    handleOpenSettingsModal,
    handleClosePanel,
    panelWidth,
    linkDestination,
    serverName = "",
    isSecondaryPanel,
    handleScreenshot = () => {},
    characterCount,
}: Props) => {
    const navigate = useNavigate()
    const { secondaryPanel } = useMultiPanelContext()
    const { isFullScreen, setIsFullScreen } = useAppContext()
    const [canManuallyReload, setCanManuallyReload] = useState(true)
    const { isCalloutActive, dismissCallout } = useFeatureCallouts()

    return (
        <Stack
            direction="row"
            align="center"
            className="generic-toolbar-container"
            width="100%"
        >
            {isSecondaryPanel && (
                <GenericToolbarButton
                    onClick={handleClosePanel}
                    icon={<CloseSVG className="icon" />}
                    label={toSentenceCase(serverName)}
                />
            )}
            {!isSecondaryPanel && (
                <GenericToolbarButton
                    onClick={() => {
                        navigate(linkDestination)
                    }}
                    icon={<MenuSVG className="icon" />}
                    label={toSentenceCase(serverName)}
                />
            )}
            <Stack direction="row" gap="8px" align="center">
                {characterCount != undefined && (
                    <ColoredText
                        color="secondary"
                        className="hide-on-small-mobile"
                    >
                        &bull;
                    </ColoredText>
                )}
                {characterCount != undefined && (
                    <ColoredText
                        color="secondary"
                        className="hide-on-small-mobile"
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {characterCount} online
                    </ColoredText>
                )}
            </Stack>

            <div style={{ width: "100%" }} />

            <GenericToolbarButton
                onClick={() => {
                    handleOpenSettingsModal()
                    dismissCallout("grouping-settings-button")
                }}
                icon={<SettingsSVG className="icon" />}
                label="Settings"
                badge={
                    isCalloutActive("grouping-settings-button") ? (
                        <Badge type="new" text="New" />
                    ) : null
                }
                iconOnly={!!secondaryPanel}
                hideLabelOnMobile
            />

            <GenericToolbarButton
                onClick={() => {
                    handleScreenshot()
                    dismissCallout("grouping-screenshot-button")
                }}
                icon={<ScreenshotSVG className="icon" />}
                label="Screenshot"
                hideOnMobile
                iconOnly={!!secondaryPanel}
            />

            <GenericToolbarButton
                onClick={() => setIsFullScreen(!isFullScreen)}
                icon={
                    isFullScreen ? (
                        <FullscreenExitSVG className="icon" />
                    ) : (
                        <FullscreenSVG className="icon" />
                    )
                }
                label="Fullscreen"
                hideOnMobile
                iconOnly={!!secondaryPanel}
            />

            <GenericToolbarButton
                onClick={() => {
                    if (canManuallyReload) {
                        handleReload()
                        setCanManuallyReload(false)
                        setTimeout(() => setCanManuallyReload(true), 5000)
                    }
                }}
                icon={<RefreshSVG className="icon" />}
                disabled={!canManuallyReload}
            />
        </Stack>
    )
}

export default GenericToolbar
