import React from "react"
import { Helmet } from "react-helmet-async"
import "./Page.css"
import useNetworkStatus from "../../hooks/useNetworkStatus.ts"
import BreadcrumbSchema from "./BreadcrumbSchema.tsx"
import BannerMessage from "./BannerMessage.tsx"

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
    logo = "/icons/logo-192px.png",
}: Props) => {
    const isOnline = useNetworkStatus()

    // Convert relative logo path to absolute URL for social media meta tags
    const absoluteLogoUrl = logo.startsWith("http")
        ? logo
        : `https://www.ddoaudit.com${logo}`

    return (
        <div className={className}>
            {!isOnline && (
                <BannerMessage message="You're offline" type="critical" />
            )}

            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <link
                    rel="canonical"
                    href={`https://www.ddoaudit.com${window.location.pathname}`}
                />

                {/* Open Graph tags */}
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:site_name" content="DDO Audit" />
                <meta property="og:type" content="website" />
                <meta
                    property="og:url"
                    content={`https://www.ddoaudit.com${window.location.pathname}`}
                />
                <meta property="og:image" content={absoluteLogoUrl} />

                {/* Twitter Card tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@ddoaudit" />
                <meta name="twitter:creator" content="@ddoaudit" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content={absoluteLogoUrl} />
            </Helmet>
            <BreadcrumbSchema />
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
