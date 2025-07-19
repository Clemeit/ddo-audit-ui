import React from "react"
import { Helmet } from "react-helmet-async"
import "./Page.css"
import useNetworkStatus from "../../hooks/useNetworkStatus.ts"

interface Props {
    children: React.ReactNode
    title: string
    description: string
    icon?: React.ReactNode
    className?: string
    centered?: boolean
    noPadding?: boolean
    contentMaxWidth?: boolean
    logo?: string
}

const Page = ({
    children,
    title,
    description,
    icon,
    className,
    centered = false,
    noPadding = false,
    contentMaxWidth = false,
    logo = "/icons/logo-512px.png",
}: Props) => {
    const isOnline = useNetworkStatus()

    return (
        <div className={className}>
            {!isOnline && (
                <div
                    className="banner-message"
                    style={{ backgroundColor: "#aa0000ff" }}
                >
                    You're offline
                </div>
            )}
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta
                    property="og:image"
                    content={logo}
                    data-react-helmet="true"
                />
                <meta
                    property="twitter:image"
                    content={logo}
                    data-react-helmet="true"
                />
            </Helmet>
            <div className={`page ${noPadding ? "no-padding" : ""}`}>
                <div
                    className={`page-content ${centered ? "centered" : ""} ${contentMaxWidth ? "content-max-width" : ""}`}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Page
