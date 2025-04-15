import React from "react"
import { useNavigate } from "react-router-dom"
import "../../index.css"
import "./Banner.css"
import { ReactComponent as GiftSVG } from "../../assets/svg/gift.svg"
import Button from "../global/Button.tsx"
import useIsMobile from "../../hooks/useIsMobile.ts"
import { DONATE_LINK, GITHUB_LINK } from "../../constants/client.ts"

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
    const navigate = useNavigate()
    const isMobile = useIsMobile()

    const routeToSuggestionsPage = () => {
        navigate("/suggestions")
    }
    const openGitHubLink = () => {
        window.open(GITHUB_LINK, "_blank")
    }
    const openDonationLink = () => {
        window.open(DONATE_LINK, "_blank")
    }

    return isMobile && hideOnMobile ? null : (
        <div className={`banner ${miniature ? "miniature" : ""}`}>
            <div className="content">
                <h1 className="title">{title}</h1>
                <h2 className="subtitle">{subtitle}</h2>
                {showButtons && (
                    <>
                        <br />
                        <div className="call-to-action-container">
                            {!hideSuggestionButton && (
                                <Button
                                    type="primary"
                                    onClick={routeToSuggestionsPage}
                                    style={{ width: "9rem" }}
                                >
                                    Make a suggestion
                                </Button>
                            )}
                            <Button
                                type="secondary"
                                onClick={openGitHubLink}
                                style={{ width: "9rem" }}
                            >
                                Visit my GitHub
                            </Button>
                            <Button
                                icon={<GiftSVG />}
                                type="secondary donate"
                                onClick={openDonationLink}
                                style={{ width: "9rem" }}
                            >
                                Donate
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Banner
