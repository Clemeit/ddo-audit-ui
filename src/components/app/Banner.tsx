import "../../index.css"
import "./Banner.css"
import useWindowSize from "../../hooks/useWindowSize.ts"
import {
    DonateButton,
    GitHubButton,
    MakeASuggestionButton,
} from "../buttons/Buttons.tsx"
import React, { useMemo } from "react"
import { getIsNightRevels } from "../../utils/configUtils.ts"
import { useAppContext } from "../../contexts/AppContext.tsx"

interface Props {
    title: string
    subtitle: string
    showButtons: boolean
    miniature: boolean
    hideOnMobile?: boolean
    hideSuggestionButton?: boolean
}

const Banner = ({
    title = "DDO Audit",
    subtitle = "Real-time Player Concurrency Data and LFM Viewer",
    showButtons = true,
    miniature = false,
    hideOnMobile = true,
    hideSuggestionButton = false,
}: Props) => {
    const { isMobile } = useWindowSize()
    const { config } = useAppContext()

    const isNightRevels = useMemo(() => getIsNightRevels(config), [config])

    const defaultBannerSrc = "/images/banner.webp"
    const nightRevelsBannerSrc = "/images/banner_night_revels.webp"
    const defaultBannerGradStart = "rgba(97, 97, 97, 0.47)"
    const nightRevelsBannerGradStart = "rgba(97, 97, 97, 0.3)"

    const bannerStyle = useMemo(() => {
        const bannerSource = isNightRevels
            ? nightRevelsBannerSrc
            : defaultBannerSrc
        const linearGradientStart = isNightRevels
            ? nightRevelsBannerGradStart
            : defaultBannerGradStart
        return {
            backgroundImage: `linear-gradient(to bottom, ${linearGradientStart}, rgba(15, 15, 15, 0.774)), url("${bannerSource}")`,
        }
    }, [isNightRevels])

    return isMobile && hideOnMobile ? null : (
        <div
            className={`banner ${miniature ? "miniature" : ""}`}
            style={bannerStyle}
        >
            <div className="content">
                <h1 className="title">{title}</h1>
                <h2 className="subtitle">{subtitle}</h2>
                {showButtons && (
                    <>
                        <br />
                        <div className="call-to-action-container">
                            {!hideSuggestionButton && <MakeASuggestionButton />}
                            <GitHubButton />
                            <DonateButton />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Banner
