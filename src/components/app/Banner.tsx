import React from "react"
import { useNavigate } from "react-router-dom"
import "../../index.css"
import "./Banner.css"
// @ts-ignore
import { ReactComponent as GiftSVG } from "../../assets/svg/gift.svg"
import Button from "../global/Button.tsx"
import useIsMobile from "../../hooks/useIsMobile.ts"

interface Props {
    title: string
    subtitle: string
    showButtons: boolean
    miniature: boolean
    hideOnMobile: boolean
}

const Banner = ({
    title = "DDO Audit",
    subtitle = "Real-time Player Concurrency Data and LFM Viewer",
    showButtons = true,
    miniature = false,
    hideOnMobile = true,
}: Props) => {
    const navigate = useNavigate()
    const isMobile = useIsMobile()

    const routeToSuggestionsPage = () => {
        navigate("/suggestions")
    }
    const openGitHubLink = () => {
        window.open("https://github.com/Clemeit/ddo-audit", "_blank")
    }
    const openDonationLink = () => {
        window.open(
            "https://www.paypal.com/donate/?hosted_button_id=YWG5SJPYLDQXY",
            "_blank"
        )
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
                            <Button
                                type="primary"
                                onClick={routeToSuggestionsPage}
                                style={{ width: "9rem" }}
                            >
                                Make a suggestion
                            </Button>
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
