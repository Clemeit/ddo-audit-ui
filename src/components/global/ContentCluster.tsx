import React from "react"
import "./ContentCluster.css"

interface Props {
    title?: string
    subtitle?: string
    link?: string
    showLink?: boolean
    children?: React.ReactNode
    className?: string
    hideHeaderOnMobile?: boolean
}

const ContentCluster = ({
    title,
    subtitle,
    link,
    showLink,
    children,
    className = "",
    hideHeaderOnMobile = false,
}: Props) => {
    return (
        <div className={`content-cluster ${className}`}>
            {title && (
                <h2
                    className={`content-cluster-title ${hideHeaderOnMobile ? "hide-on-mobile" : ""}`}
                >
                    {title}
                </h2>
            )}
            {subtitle && <p className="content-cluster-subtitle">{subtitle}</p>}
            {children && (
                <div className="content-cluster-content">{children}</div>
            )}
        </div>
    )
}

export default ContentCluster
