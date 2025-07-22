import React from "react"
import "./ContentCluster.css"
import { ReactComponent as LinkSVG } from "../../assets/svg/link.svg"
import { useNotificationContext } from "../../contexts/NotificationContext.tsx"

interface Props {
    title?: string
    subtitle?: string
    children?: React.ReactNode
    className?: string
    hideHeaderOnMobile?: boolean
}

const ContentCluster = ({
    title,
    subtitle,
    children,
    className = "",
    hideHeaderOnMobile = false,
}: Props) => {
    const headerId = title
        ? title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
        : ""
    const { createNotification } = useNotificationContext()

    return (
        <div className={`content-cluster ${className}`}>
            {title && (
                <h2
                    id={headerId}
                    className={`content-cluster-title ${hideHeaderOnMobile ? "hide-on-mobile" : ""}`}
                >
                    {title}
                    <LinkSVG
                        className="clickable-icon hide-on-mobile"
                        onClick={() => {
                            // Create a URL-safe ID from the title
                            const newUrl = `${window.location.pathname}#${headerId}`

                            // Update the URL without causing a page reload
                            window.history.pushState({}, "", newUrl)

                            // Copy the link to clipboard for easy sharing
                            navigator.clipboard
                                .writeText(window.location.href)
                                .then(() => {
                                    createNotification({
                                        title: "Link Copied!",
                                        message:
                                            "Section link has been copied to clipboard",
                                        type: "success",
                                        ttl: 3000,
                                    })
                                })
                                .catch(() => {
                                    // Fallback for browsers that don't support clipboard API
                                    createNotification({
                                        title: "Link Updated",
                                        message:
                                            "URL updated - you can copy it from the address bar",
                                        type: "info",
                                        ttl: 3000,
                                    })
                                })
                        }}
                    />
                </h2>
            )}
            {subtitle && <p className="content-cluster-subtitle">{subtitle}</p>}
            {children && (
                <div className="content-cluster-content">{children}</div>
            )}
        </div>
    )
}

interface ContentClusterGroupProps {
    flavor?: "comfortable" | "cozy" | "compact"
    children?: React.ReactNode
}

const ContentClusterGroup = ({
    flavor = "cozy",
    children,
}: ContentClusterGroupProps) => {
    function getGap() {
        if (flavor === "comfortable") return "50px"
        if (flavor === "cozy") return "30px"
        if (flavor === "compact") return "10px"
    }
    return (
        <div
            className="content-cluster-group"
            style={{
                gap: getGap(),
            }}
        >
            {children}
        </div>
    )
}

export { ContentCluster, ContentClusterGroup }
