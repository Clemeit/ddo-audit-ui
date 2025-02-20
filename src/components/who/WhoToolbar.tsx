import React, { useState } from "react"
import { useWhoContext } from "../../contexts/WhoContext.tsx"
import { Link } from "react-router-dom"
import { ReactComponent as MenuSVG } from "../../assets/svg/menu.svg"
import { ReactComponent as ScreenshotSVG } from "../../assets/svg/capture.svg"
import { ReactComponent as SettingsSVG } from "../../assets/svg/settings.svg"
import { ReactComponent as FullscreenSVG } from "../../assets/svg/fullscreen.svg"
import { ReactComponent as FullscreenExitSVG } from "../../assets/svg/fullscreen-exit.svg"
import { ReactComponent as RefreshSVG } from "../../assets/svg/refresh.svg"
import Badge from "../global/Badge.tsx"
import useGetCurrentServer from "../../hooks/useGetCurrentServer.ts"
import { VIP_SERVER_NAMES_LOWER } from "../../constants/servers.ts"
import { useThemeContext } from "../../contexts/ThemeContext.tsx"
import useFeatureCallouts from "../../hooks/useFeatureCallouts.ts"
import GenericToolbar from "../global/GenericToolbar.tsx"

interface Props {
    reloadCharacters: () => void
}

const WhoToolbar = ({ reloadCharacters }: Props) => {
    const { serverNameSentenceCase, serverNameLowercase } =
        useGetCurrentServer()
    const { isFullScreen, setIsFullScreen } = useThemeContext()
    const {
        stringFilter,
        setStringFilter,
        sortBy,
        minLevel,
        setMinLevel,
        maxLevel,
        setMaxLevel,
        panelWidth,
    } = useWhoContext()

    return (
        <GenericToolbar
            handleReload={reloadCharacters}
            handleOpenSettingsModal={() => {}}
            panelWidth={panelWidth}
            linkDestination="/who"
        />
    )
}

export default WhoToolbar
