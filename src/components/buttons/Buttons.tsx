import React from "react"
import Button from "../global/Button.tsx"
import { useNavigate } from "react-router-dom"
import { DONATE_LINK, GITHUB_LINK } from "../../constants/client.ts"
import { ReactComponent as GiftSVG } from "../../assets/svg/gift.svg"

const MakeASuggestionButton = () => {
    const navigate = useNavigate()
    const routeToFeedbackPage = () => {
        navigate("/feedback")
    }
    return (
        <Button
            type="primary"
            onClick={routeToFeedbackPage}
            style={{ width: "9rem", height: "2.8rem" }}
        >
            Make a suggestion
        </Button>
    )
}

const GitHubButton = () => {
    const openGitHubLink = () => {
        window.open(GITHUB_LINK, "_blank")
    }
    return (
        <Button
            type="secondary"
            onClick={openGitHubLink}
            style={{ width: "9rem", height: "2.8rem" }}
        >
            Visit my GitHub
        </Button>
    )
}

const DonateButton = () => {
    const openDonationLink = () => {
        window.open(DONATE_LINK, "_blank")
    }
    return (
        <Button
            icon={<GiftSVG />}
            type="secondary donate"
            onClick={openDonationLink}
            style={{ width: "9rem", height: "2.8rem" }}
        >
            Donate
        </Button>
    )
}

export { MakeASuggestionButton, GitHubButton, DonateButton }
