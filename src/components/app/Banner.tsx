import React from "react"
import "../../index.css"
import "./Banner.css"
import useIsMobile from "../../hooks/useIsMobile.ts"
import {
    DonateButton,
    GitHubButton,
    MakeASuggestionButton,
} from "../buttons/Buttons.tsx"

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
    const isMobile = useIsMobile()

    return isMobile && hideOnMobile ? null : (
        <div className={`banner ${miniature ? "miniature" : ""}`}>
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
