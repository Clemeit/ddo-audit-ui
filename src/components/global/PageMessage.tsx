import React from "react"
import "./PageMessage.css"
import { ReactComponent as InfoSVG } from "../../assets/svg/info.svg"
import { ReactComponent as ErrorSVG } from "../../assets/svg/x.svg"
import { ReactComponent as WarningSVG } from "../../assets/svg/warning.svg"
import { ReactComponent as SuccessSVG } from "../../assets/svg/checkmark.svg"
import { ReactComponent as CloseSVG } from "../../assets/svg/close.svg"
import Stack from "../global/Stack.tsx"

interface Props {
    type?: "error" | "warning" | "info" | "success"
    title?: string
    message?: React.ReactNode
    width?: string
    maxWidth?: string
    onDismiss?: () => void
}

const PageMessage = ({
    type = "info",
    title = "Title",
    message = <span>Message</span>,
    width = "unset",
    maxWidth = "unset",
    onDismiss,
}: Props) => {
    return (
        <div
            className={`page-message ${type}`}
            style={{
                border: `1px solid var(--${type})`,
                width,
                maxWidth,
            }}
        >
            {onDismiss && (
                <div
                    className="page-message-close"
                    onClick={onDismiss}
                    role="button"
                    tabIndex={0}
                    aria-label="Close message"
                >
                    <CloseSVG />
                </div>
            )}
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

export default PageMessage
