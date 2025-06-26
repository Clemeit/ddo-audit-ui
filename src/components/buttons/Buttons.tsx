import React from "react"
import Button from "../global/Button.tsx"
import { useNavigate } from "react-router-dom"
import { DONATE_LINK, GITHUB_LINK } from "../../constants/client.ts"
import { ReactComponent as GiftSVG } from "../../assets/svg/gift.svg"
import logMessage from "../../utils/logUtils.ts"

const MakeASuggestionButton = () => {
    const navigate = useNavigate()
    const routeToFeedbackPage = () => {
        navigate("/feedback")
        logMessage("Make a suggestion button clicked", "info", "click")
    }
    return (
        <Button
            type="primary"
            onClick={routeToFeedbackPage}
            style={{ width: "9rem" }}
        >
            Make a suggestion
        </Button>
    )
}

const GitHubButton = () => {
    const openGitHubLink = () => {
        window.open(GITHUB_LINK, "_blank")
        logMessage("GitHub button clicked", "info", "click")
    }
    return (
        <Button
            type="secondary"
            onClick={openGitHubLink}
            style={{ width: "9rem" }}
        >
            Visit my GitHub
        </Button>
    )
}

const DonateButton = () => {
    const openDonationLink = () => {
        window.open(DONATE_LINK, "_blank")
        logMessage("Donate button clicked", "info", "click")
    }
    return (
        <Button
            icon={<GiftSVG />}
            type="secondary donate"
            onClick={openDonationLink}
            style={{ width: "9rem" }}
        >
            Donate
        </Button>
    )
}

export { MakeASuggestionButton, GitHubButton, DonateButton }
