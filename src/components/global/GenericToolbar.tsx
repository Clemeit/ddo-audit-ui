import React, { useState } from "react"
import Link from "./Link.tsx"
import { ReactComponent as MenuSVG } from "../../assets/svg/menu.svg"
import { ReactComponent as ScreenshotSVG } from "../../assets/svg/capture.svg"
import { ReactComponent as SettingsSVG } from "../../assets/svg/settings.svg"
import { ReactComponent as FullscreenSVG } from "../../assets/svg/fullscreen.svg"
import { ReactComponent as FullscreenExitSVG } from "../../assets/svg/fullscreen-exit.svg"
import { ReactComponent as RefreshSVG } from "../../assets/svg/refresh.svg"
import { ReactComponent as CloseSVG } from "../../assets/svg/close.svg"
import Badge from "../global/Badge.tsx"
import { VIP_SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { useThemeContext } from "../../contexts/ThemeContext.tsx"
import useFeatureCallouts from "../../hooks/useFeatureCallouts.ts"
import "./GenericToolbar.css"
import { toSentenceCase } from "../../utils/stringUtils.ts"
import Button from "./Button.tsx"
import Stack from "./Stack.tsx"
import ColoredText from "./ColoredText.tsx"

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
    const { isFullScreen, setIsFullScreen } = useThemeContext()
    const [canManuallyReload, setCanManuallyReload] = useState(true)
    const { isCalloutActive, dismissCallout } = useFeatureCallouts()

    return (
        <div
            className="generic-toolbar-container"
            style={{ width: `${panelWidth}px` }}
        >
            {isSecondaryPanel ? (
                <button className="item" onClick={handleClosePanel}>
                    <CloseSVG className="icon" />
                    <span>
                        {toSentenceCase(serverName)}
                        {VIP_SERVER_NAMES_LOWER.includes(serverName) && (
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
                </button>
            ) : (
                <Link to={linkDestination} className="item">
                    <Stack direction="row" gap="5px" align="center">
                        <MenuSVG className="icon" />
                        <Stack direction="row" gap="5px" align="center">
                            {toSentenceCase(serverName)}
                            {VIP_SERVER_NAMES_LOWER.includes(serverName) && (
                                <Badge
                                    text="VIP"
                                    size="small"
                                    backgroundColor="var(--orange4)"
                                />
                            )}
                        </Stack>
                        {characterCount != undefined && (
                            <ColoredText
                                color="secondary"
                                className="hide-on-smallish-mobile"
                            >
                                &bull;
                            </ColoredText>
                        )}
                        {characterCount != undefined && (
                            <ColoredText
                                color="secondary"
                                className="hide-on-smallish-mobile"
                            >
                                {characterCount} online
                            </ColoredText>
                        )}
                    </Stack>
                </Link>
            )}
            <Button
                asDiv
                className="item settings-button"
                onClick={() => {
                    handleOpenSettingsModal()
                    dismissCallout("grouping-settings-button")
                }}
                data-attribute="grouping-settings-button"
            >
                <Stack align="center" gap="4px">
                    <SettingsSVG className="icon" />
                    <span className="hide-on-mobile">
                        Settings{" "}
                        {isCalloutActive("grouping-settings-button") && (
                            <Badge type="new" text="New" />
                        )}
                    </span>
                </Stack>
            </Button>
            <Button
                asDiv
                className="item hide-on-mobile"
                onClick={() => {
                    handleScreenshot()
                    dismissCallout("grouping-screenshot-button")
                }}
                data-attribute="grouping-screenshot-button"
            >
                <Stack align="center" gap="4px">
                    <ScreenshotSVG className="icon" />
                    <span className="hide-on-mobile">Screenshot</span>
                </Stack>
            </Button>
            <div
                className="item fullscreen-button"
                onClick={() => setIsFullScreen(!isFullScreen)}
            >
                {isFullScreen ? (
                    <FullscreenExitSVG className="icon" />
                ) : (
                    <FullscreenSVG className="icon" />
                )}
                <span className="hide-on-mobile">Fullscreen</span>
            </div>
            <div
                className={`item refresh-button ${canManuallyReload ? "" : "disabled"}`}
                onClick={() => {
                    if (canManuallyReload) {
                        handleReload()
                        setCanManuallyReload(false)
                        setTimeout(() => setCanManuallyReload(true), 5000)
                    }
                }}
            >
                <RefreshSVG
                    className={`icon ${canManuallyReload ? "" : "icon-disabled"}`}
                />
            </div>
        </div>
    )
}

export default GenericToolbar
