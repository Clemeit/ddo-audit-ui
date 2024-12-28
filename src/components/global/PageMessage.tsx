import React from "react"
import "./PageMessage.css"
import PropTypes from "prop-types"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"
import { ReactComponent as ErrorSVG } from "../../assets/svg/x.svg"
import { ReactComponent as WarningSVG } from "../../assets/svg/warning.svg"
import { ReactComponent as SuccessSVG } from "../../assets/svg/checkmark.svg"
import Stack from "../global/Stack.tsx"

const PageMessage = ({ type, title, message }) => {
    return (
        <div
            className={`page-message ${type}`}
            style={{
                border: `1px solid var(--${type})`,
            }}
        >
            <Stack direction="column" gap="10px">
                <Stack direction="row" align="center">
                    {type === "info" && (
                        <InfoSVG
                            className="page-message-icon"
                            style={{ fill: `var(--${type})` }}
                        />
                    )}
                    {type === "error" && (
                        <ErrorSVG
                            className="page-message-icon"
                            style={{ fill: `var(--${type})` }}
                        />
                    )}
                    {type === "warning" && (
                        <WarningSVG
                            className="page-message-icon"
                            style={{ fill: `var(--${type})` }}
                        />
                    )}
                    {type === "success" && (
                        <SuccessSVG
                            className="page-message-icon"
                            style={{ fill: `var(--${type})` }}
                        />
                    )}
                    <strong>{title}</strong>
                </Stack>
                {message}
            </Stack>
        </div>
    )
}

PageMessage.propTypes = {
    type: PropTypes.oneOf(["error", "warning", "info", "success"]),
    title: PropTypes.string,
    message: PropTypes.string,
}

PageMessage.defaultProps = {
    type: "info",
    title: "Title",
    message: "Message",
}

export default PageMessage
