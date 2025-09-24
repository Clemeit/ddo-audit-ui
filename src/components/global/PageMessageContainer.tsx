import React from "react"
import "./PageMessageContainer.css"

interface PageMessageContainerProps {
    children?: React.ReactNode
}

const PageMessageContainer = ({ children }: PageMessageContainerProps) => {
    return (
        <div
            className="page-message-container"
            aria-live="polite"
            data-nosnippet
            role="note"
        >
            {children}
        </div>
    )
}

export default PageMessageContainer
