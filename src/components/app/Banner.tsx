import React from "react"
import PropTypes from "prop-types"
import { useNavigate } from "react-router-dom"
import "../../index.css"
import "./Banner.css"
import { ReactComponent as GiftSVG } from "../../assets/svg_icons/gift.svg"
import Button from "../global/Button.tsx"
import useIsMobile from "../../hooks/useIsMobile.ts"

const Banner = ({ title, subtitle, showButtons, miniature, hideOnMobile }) => {
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
        <div className={`banner ${miniature === true && "miniature"}`}>
            <div className="content">
                <h1 className="title">{title}</h1>
                <h2 className="subtitle">{subtitle}</h2>
                {showButtons && (
                    <>
                        <br />
                        <div className="call-to-action-container">
                            <Button
                                text="Make a suggestion"
                                type="primary"
                                onClick={routeToSuggestionsPage}
                                style={{ width: "11rem" }}
                            />
                            <Button
                                text="Visit my GitHub"
                                type="secondary"
                                onClick={openGitHubLink}
                                style={{ width: "11rem" }}
                            />
                            <Button
                                text="Donate"
                                icon={<GiftSVG />}
                                type="secondary donate"
                                onClick={openDonationLink}
                                style={{ width: "11rem" }}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

Banner.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    showButtons: PropTypes.bool,
    miniature: PropTypes.bool,
    hideOnMobile: PropTypes.bool,
}

Banner.defaultProps = {
    title: "DDO Audit",
    subtitle: "Real-time Player Concurrency Data and LFM Viewer",
    showButtons: true,
    miniature: false,
    hideOnMobile: true,
}

export default Banner
