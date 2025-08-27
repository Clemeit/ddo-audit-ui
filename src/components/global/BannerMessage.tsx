import "./BannerMessage.css"
import { ReactComponent as CloseSVG } from "../../assets/svg/close.svg"

interface Props {
    message: string
    type?: "info" | "warning" | "critical" | "success"
    dismissable?: boolean
}

const BannerMessage = ({
    message,
    type = "info",
    dismissable = false,
}: Props) => {
    return (
        <div
            className={`banner-message ${type} ${dismissable ? "dismissable" : ""}`}
        >
            {message}
            {dismissable && (
                <button
                    className="banner-message-close"
                    onClick={() => {
                        // Logic to dismiss the banner
                        const banner = document.querySelector(".banner-message")
                        if (banner) {
                            banner.classList.add("hidden")
                        }
                    }}
                >
                    <CloseSVG />
                </button>
            )}
        </div>
    )
}

export default BannerMessage
